import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, type RateLimitTier } from '@/lib/rate-limit'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const customAnalyticsOrigin = (() => {
    try {
      const url = process.env.NEXT_PUBLIC_CUSTOM_ANALYTICS_URL
      if (!url) return ''
      return `${new URL(url).origin} `
    } catch {
      return ''
    }
  })()

  // 强制HTTPS重定向 (生产环境)
  if (process.env.NODE_ENV === 'production') {
    // 线上环境禁用所有调试接口
    if (pathname.startsWith('/api/debug/')) {
      return new NextResponse(null, { status: 404 })
    }

    const proto = request.headers.get('x-forwarded-proto')
    if (proto === 'http') {
      return NextResponse.redirect(`https://fluxkontext.space${pathname}`, 301)
    }
  }

  // API v1 路由重写 - 将文档中的API端点映射到实际实现
  if (pathname.startsWith('/api/v1/')) {
    let newPath = '/api/flux-kontext'
    let action = ''

    // 根据URL路径确定action类型
    if (pathname.includes('/text-to-image/pro')) {
      action = 'text-to-image-pro'
    } else if (pathname.includes('/text-to-image/max')) {
      action = 'text-to-image-max'
    } else if (pathname.includes('/image-edit/pro')) {
      action = 'edit-image-pro'
    } else if (pathname.includes('/image-edit/max')) {
      action = 'edit-image-max'
    }

    // 创建新的URL并添加action参数
    const url = request.nextUrl.clone()
    url.pathname = newPath

    // 如果确定了action，添加到查询参数中
    if (action) {
      url.searchParams.set('action', action)
    }

    return NextResponse.rewrite(url)
  }

  const response = NextResponse.next()

  // 添加安全头
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  )

  // 内容安全策略 - 修复Google OAuth和TrustedScript问题
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' " +
    "https://platform.twitter.com " +
    "https://www.googletagmanager.com " +
    "https://plausible.io " +
    "https://www.clarity.ms " +
    "https://openpanel.dev " +
    "https://accounts.google.com " +
    "https://apis.google.com " +
    "https://www.gstatic.com " +
    "https://gstatic.com " +
    "https://challenges.cloudflare.com " +
    "https://static.cloudflareinsights.com " +
    customAnalyticsOrigin +
    "data: blob:; " +
    "style-src 'self' 'unsafe-inline' " +
    "https://fonts.googleapis.com " +
    "https://accounts.google.com " +
    "https://www.gstatic.com; " +
    "font-src 'self' " +
    "https://fonts.gstatic.com " +
    "https://accounts.google.com " +
    "data:; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https: " +
    "https://accounts.google.com " +
    "https://www.googleapis.com " +
    "https://challenges.cloudflare.com " +
    "wss: ws:; " +
    "frame-src 'self' " +
    "https://accounts.google.com " +
    "https://www.google.com " +
    "https://challenges.cloudflare.com; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self' https:; " +
    "frame-ancestors 'self';"
  )

  // API路由速率限制 (Upstash distributed + in-memory fallback)
  if (pathname.startsWith('/api/')) {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() :
               request.headers.get('x-real-ip') ??
               '127.0.0.1'

    // 不同API端点不同的限制级别
    let tier: RateLimitTier = 'api'

    if (pathname.includes('/auth/')) {
      tier = 'auth'
    } else if (pathname.includes('/payment/')) {
      tier = 'payment'
    }

    const { success, remaining } = await checkRateLimit(ip, tier)

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'Retry-After': tier === 'payment' ? '600' : tier === 'auth' ? '300' : '60',
          },
        }
      )
    }

    response.headers.set('X-RateLimit-Remaining', String(remaining))
  }

  return response
}

export const config = {
  matcher: [
    // 覆盖页面和API，排除静态资源
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
