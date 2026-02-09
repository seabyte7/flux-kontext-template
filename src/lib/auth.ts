import CredentialsProvider from "next-auth/providers/credentials"
import GitHubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"
import { getClientIp } from "@/lib/utils/ip"
import { getIsoTimestr } from "@/lib/utils/time"
import { getUuid } from "@/lib/utils/hash"
import { saveUser } from "@/lib/services/user"
import { User } from "@/lib/types/user"
import { createClient } from '@supabase/supabase-js'
import { authLogger } from '@/lib/logger'
import { env } from '@/lib/env'

const providers: any[] = []

// Google Auth (如果配置了)
if (
  env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true" &&
  env.GOOGLE_ID &&
  env.GOOGLE_SECRET
) {
  providers.push(
    GoogleProvider({
      clientId: env.GOOGLE_ID,
      clientSecret: env.GOOGLE_SECRET,
    })
  )
}

// Github Auth (如果配置了)
if (
  env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true" &&
  env.AUTH_GITHUB_ID &&
  env.AUTH_GITHUB_SECRET
) {
  providers.push(
    GitHubProvider({
      clientId: env.AUTH_GITHUB_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
    })
  )
}

// 🔥 简化的邮箱登录 - 只使用Supabase认证
if (env.NEXT_PUBLIC_AUTH_CREDENTIALS_ENABLED === "true") {
  providers.push(
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // 🎯 开发环境测试账户（无需数据库）
        if (env.NODE_ENV === 'development' &&
            credentials.email === "test@example.com" &&
            credentials.password === "password") {
          return {
            id: "test-user-id",
            email: "test@example.com",
            name: "Test User",
          }
        }

        // 🚀 生产环境：使用Supabase认证（自带邮箱验证）
        try {
          const supabase = createClient(
            env.NEXT_PUBLIC_SUPABASE_URL,
            env.SUPABASE_SERVICE_ROLE_KEY
          )

          // 🔐 Supabase登录验证（自动检查邮箱验证状态）
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (error) {
            authLogger.warn({ error: error.message }, 'Login failed')
            return null
          }

          if (!data.user) {
            authLogger.warn('User not found')
            return null
          }

          // ✅ 检查邮箱验证状态
          if (!data.user.email_confirmed_at) {
            authLogger.warn({ email: credentials.email }, 'Email not verified')
            return null
          }

          // 🎉 登录成功
          return {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || data.user.email!,
          }

        } catch (error) {
          authLogger.error({ err: error }, 'Supabase auth error')
          return null
        }
      },
    })
  )
}

export const providerMap = providers
  .map((provider: any) => {
    if (typeof provider === "function") {
      const providerData = provider()
      return { id: providerData.id, name: providerData.name }
    } else {
      return { id: provider.id, name: provider.name }
    }
  })

export const authOptions: NextAuthOptions = {
  providers,
  pages: {
    signIn: "/auth/signin",
  },
  // 🍪 Cookie安全配置 - 优化以支持Google One Tap
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',        // 🔧 设置为lax而非strict，支持第三方登录
        path: '/',
        secure: env.NODE_ENV === 'production',
        domain: env.NODE_ENV === 'production' ? 'fluxkontext.space' : undefined, // 🌐 明确指定域名
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',        // 🔧 支持跨站点回调
        path: '/',
        secure: env.NODE_ENV === 'production',
        domain: env.NODE_ENV === 'production' ? 'fluxkontext.space' : undefined,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',        // 🔧 支持CSRF保护但允许第三方登录
        path: '/',
        secure: env.NODE_ENV === 'production',
        domain: env.NODE_ENV === 'production' ? 'fluxkontext.space' : undefined,
      },
    },
    // 🔧 添加状态Cookie配置以支持Google One Tap
    state: {
      name: `next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: env.NODE_ENV === 'production',
        maxAge: 900, // 15分钟
        domain: env.NODE_ENV === 'production' ? 'fluxkontext.space' : undefined,
      },
    },
    pkceCodeVerifier: {
      name: `next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: env.NODE_ENV === 'production',
        maxAge: 900, // 15分钟
        domain: env.NODE_ENV === 'production' ? 'fluxkontext.space' : undefined,
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // 🎯 处理用户登录和首次注册赠送积分
      authLogger.info({ userId: user?.id, provider: account?.provider, email: profile?.email }, 'signIn callback triggered')

      try {
        if (user?.email) {
          authLogger.debug({ email: user.email }, 'Processing user login')

          // 🔧 使用Supabase替代Prisma，确保数据库访问一致性
          const { createAdminClient } = await import('@/lib/supabase/server')
          const { getUuid } = await import('@/lib/utils/hash')

          authLogger.debug('Supabase module imported')

          const supabase = createAdminClient()

          // 检查用户是否已存在
          authLogger.debug('Querying existing user')
          const { data: existingUser, error: findError } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email)
            .limit(1)
            .single()
          
          authLogger.debug({ exists: !!existingUser }, 'User query result')

          if (findError && findError.code === 'PGRST116') {
            // 用户不存在，创建新用户
            authLogger.info({ email: user.email }, 'Creating new user')
            
            const newUserData = {
              id: user.id || getUuid(),
              email: user.email,
              name: user.name || user.email,
              image: user.image || '',
              credits: 100, // 🎁 新用户赠送100积分
              signin_type: account?.type || 'oauth',
              signin_provider: account?.provider || 'google',
              signin_openid: account?.providerAccountId || '',
              signin_ip: 'unknown',
              last_signin_at: new Date().toISOString(),
              signin_count: 1,
              location: 'US',
              preferred_currency: 'USD',
              preferred_payment_provider: 'creem'
            }

            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert(newUserData)
              .select()
              .single()

            if (createError) {
              authLogger.error({ err: createError }, 'New user creation failed')
              // 即使创建失败，也允许用户登录，后续通过API自动创建
            } else {
              authLogger.info({ userId: newUser.id }, 'New user created successfully')

              // 🎁 创建积分赠送记录
              try {
                await supabase
                  .from('credit_transactions')
                  .insert({
                    id: getUuid(),
                    user_id: newUser.id,
                    amount: 100,
                    type: 'gift',
                    description: '新用户注册赠送积分',
                    reference_id: 'welcome_bonus'
                  })

                authLogger.info({ email: user.email, credits: 100 }, 'Welcome bonus credits granted')
              } catch (creditError) {
                authLogger.error({ err: creditError }, 'Credit transaction creation failed')
              }

              // 📧 发送欢迎邮件（异步，不阻塞登录流程）
              try {
                const { sendWelcomeEmail } = await import('@/lib/email')
                sendWelcomeEmail({
                  to: user.email!,
                  name: user.name || user.email!,
                }).catch((emailError) => {
                  authLogger.error({ err: emailError }, 'Welcome email send failed')
                })
                authLogger.info({ email: user.email }, 'Welcome email triggered')
              } catch (emailError) {
                authLogger.error({ err: emailError }, 'Welcome email module load failed')
              }
            }
          } else if (!findError && existingUser) {
            authLogger.debug({ userId: existingUser.id }, 'Updating existing user login info')
            
            // 🔄 现有用户：更新登录信息
            const updateData = {
              last_signin_at: new Date().toISOString(),
              signin_count: (existingUser.signin_count || 0) + 1,
              // 更新头像和昵称（如果有变化）
              ...(user.image && { image: user.image }),
              ...(user.name && { name: user.name }),
            }

            await supabase
              .from('users')
              .update(updateData)
              .eq('id', existingUser.id)
            
            authLogger.debug({ userId: existingUser.id }, 'Existing user login info updated')
          } else {
            authLogger.error({ err: findError }, 'Database query error')
          }
        } else {
          authLogger.warn('User email is empty, skipping database operations')
        }
      } catch (error) {
        authLogger.error({ err: error }, 'User login processing failed')
        // 即使数据库操作失败，也允许用户登录
      }

      authLogger.debug('signIn callback completed')
      return true
    },
    async redirect({ url, baseUrl }) {
      // 🎯 修改重定向逻辑 - 优先跳转到generate页面
      
      // 如果URL包含callbackUrl参数，使用该参数
      if (url.includes('callbackUrl=')) {
        const urlParams = new URLSearchParams(url.split('?')[1])
        const callbackUrl = urlParams.get('callbackUrl')
        if (callbackUrl) {
          // 解码callbackUrl
          const decodedCallback = decodeURIComponent(callbackUrl)
          if (decodedCallback.startsWith("/")) return `${baseUrl}${decodedCallback}`
          else if (new URL(decodedCallback).origin === baseUrl) return decodedCallback
        }
      }
      
      // 如果是相对路径，添加baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`
      
      // 如果是同域名的完整URL，直接返回
      if (new URL(url).origin === baseUrl) return url
      
      // 🎯 默认跳转到generate页面（主功能页面）而非dashboard
      return `${baseUrl}/generate`
    },
    async session({ session, token }) {
      // 🎯 会话信息处理
      return session
    },
    async jwt({ token, user, account }: { token: any; user?: any; account?: any }) {
      // 🎯 JWT token 处理
      if (user) {
        token.user = user as any
      }
      return token
    },
  },
}

// 检测用户地理位置的函数
async function detectUserLocation(): Promise<string> {
  try {
    // 这里可以使用IP地理位置检测服务
    // 暂时返回默认值，实际项目中可以集成 ipapi.co 等服务
    return "US" // 默认为美国
  } catch (error) {
    authLogger.error({ err: error }, 'Geolocation detection failed')
    return "US"
  }
} 