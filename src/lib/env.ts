import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  // ─── Server-side environment variables ───
  server: {
    // 核心 AI 服务
    FAL_KEY: z.string().min(1, 'FAL_KEY is required'),

    // 数据库
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
    DATABASE_URL: z.string().optional(),

    // 认证
    NEXTAUTH_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
    GOOGLE_ID: z.string().min(1, 'GOOGLE_ID is required'),
    GOOGLE_SECRET: z.string().min(1, 'GOOGLE_SECRET is required'),
    AUTH_GITHUB_ID: z.string().optional(),
    AUTH_GITHUB_SECRET: z.string().optional(),

    // R2 存储
    R2_ACCOUNT_ID: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    R2_BUCKET_NAME: z.string().optional(),
    R2_PUBLIC_URL: z.string().optional(),
    R2_CUSTOM_DOMAIN: z.string().optional(),

    // Stripe 支付
    STRIPE_PUBLIC_KEY: z.string().optional(),
    STRIPE_PRIVATE_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    PAYMENT_VALIDATION_SECRET: z.string().optional(),

    // Creem 支付
    CREEM_API_KEY: z.string().optional(),
    CREEM_API_URL: z.string().optional(),
    CREEM_WEBHOOK_SECRET: z.string().optional(),

    // Turnstile 安全
    TURNSTILE_SECRET_KEY: z.string().optional(),

    // 内容安全
    OPENAI_API_KEY: z.string().optional(),
    GOOGLE_CLOUD_VISION_API_KEY: z.string().optional(),
    API4AI_API_KEY: z.string().optional(),
    AZURE_CONTENT_SAFETY_KEY: z.string().optional(),
    AZURE_CONTENT_SAFETY_ENDPOINT: z.string().optional(),

    // SEO
    GOOGLE_SITE_VERIFICATION: z.string().optional(),

    // 视频生成
    SEGMIND_API_KEY: z.string().optional(),
    RUNWAY_API_KEY: z.string().optional(),

    // 邮件
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),

    // 管理
    ADMIN_EMAILS: z.string().optional(),
    IPAPI_KEY: z.string().optional(),

    // 环境
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  },

  // ─── Client-side environment variables (NEXT_PUBLIC_*) ───
  client: {
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),

    // 认证开关
    NEXT_PUBLIC_AUTH_GOOGLE_ENABLED: z.string().optional().default('true'),
    NEXT_PUBLIC_AUTH_GITHUB_ENABLED: z.string().optional().default('false'),
    NEXT_PUBLIC_AUTH_CREDENTIALS_ENABLED: z.string().optional().default('false'),

    // R2 存储开关
    NEXT_PUBLIC_ENABLE_R2: z.string().optional().default('true'),

    // 演示资源
    NEXT_PUBLIC_DEMO_IMAGES_URL: z.string().optional(),
    NEXT_PUBLIC_DEMO_VIDEOS_URL: z.string().optional(),

    // Stripe
    NEXT_PUBLIC_ENABLE_STRIPE: z.string().optional().default('false'),

    // Creem
    NEXT_PUBLIC_ENABLE_CREEM: z.string().optional().default('false'),

    // 支付系统
    NEXT_PUBLIC_DEFAULT_PAYMENT_PROVIDER: z.string().optional().default('stripe'),
    NEXT_PUBLIC_PAY_CANCEL_URL: z.string().optional(),

    // Turnstile
    NEXT_PUBLIC_ENABLE_TURNSTILE: z.string().optional().default('false'),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),

    // 内容安全
    NEXT_PUBLIC_ENABLE_CONTENT_SAFETY: z.string().optional().default('false'),

    // 站点配置
    NEXT_PUBLIC_SITE_URL: z.string().optional().default('https://fluxkontext.space'),
    NEXT_PUBLIC_WEB_URL: z.string().optional(),
    NEXT_PUBLIC_PROJECT_NAME: z.string().optional().default('Flux Kontext'),

    // 分析
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: z.string().optional(),
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),
    NEXT_PUBLIC_OPENPANEL_CLIENT_ID: z.string().optional(),
    NEXT_PUBLIC_CLARITY_PROJECT_ID: z.string().optional(),
    NEXT_PUBLIC_CUSTOM_ANALYTICS_DOMAIN: z.string().optional(),
    NEXT_PUBLIC_CUSTOM_ANALYTICS_URL: z.string().optional(),

    // 主题
    NEXT_PUBLIC_DEFAULT_THEME: z.string().optional().default('dark'),
  },

  // ─── Runtime values mapping ───
  runtimeEnv: {
    // Server
    FAL_KEY: process.env.FAL_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_ID: process.env.GOOGLE_ID,
    GOOGLE_SECRET: process.env.GOOGLE_SECRET,
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
    R2_CUSTOM_DOMAIN: process.env.R2_CUSTOM_DOMAIN,
    STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
    STRIPE_PRIVATE_KEY: process.env.STRIPE_PRIVATE_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    PAYMENT_VALIDATION_SECRET: process.env.PAYMENT_VALIDATION_SECRET,
    CREEM_API_KEY: process.env.CREEM_API_KEY,
    CREEM_API_URL: process.env.CREEM_API_URL,
    CREEM_WEBHOOK_SECRET: process.env.CREEM_WEBHOOK_SECRET,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GOOGLE_CLOUD_VISION_API_KEY: process.env.GOOGLE_CLOUD_VISION_API_KEY,
    API4AI_API_KEY: process.env.API4AI_API_KEY,
    AZURE_CONTENT_SAFETY_KEY: process.env.AZURE_CONTENT_SAFETY_KEY,
    AZURE_CONTENT_SAFETY_ENDPOINT: process.env.AZURE_CONTENT_SAFETY_ENDPOINT,
    GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION,
    SEGMIND_API_KEY: process.env.SEGMIND_API_KEY,
    RUNWAY_API_KEY: process.env.RUNWAY_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    IPAPI_KEY: process.env.IPAPI_KEY,
    NODE_ENV: process.env.NODE_ENV,

    // Client
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_AUTH_GOOGLE_ENABLED: process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED,
    NEXT_PUBLIC_AUTH_GITHUB_ENABLED: process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED,
    NEXT_PUBLIC_AUTH_CREDENTIALS_ENABLED: process.env.NEXT_PUBLIC_AUTH_CREDENTIALS_ENABLED,
    NEXT_PUBLIC_ENABLE_R2: process.env.NEXT_PUBLIC_ENABLE_R2,
    NEXT_PUBLIC_DEMO_IMAGES_URL: process.env.NEXT_PUBLIC_DEMO_IMAGES_URL,
    NEXT_PUBLIC_DEMO_VIDEOS_URL: process.env.NEXT_PUBLIC_DEMO_VIDEOS_URL,
    NEXT_PUBLIC_ENABLE_STRIPE: process.env.NEXT_PUBLIC_ENABLE_STRIPE,
    NEXT_PUBLIC_ENABLE_CREEM: process.env.NEXT_PUBLIC_ENABLE_CREEM,
    NEXT_PUBLIC_DEFAULT_PAYMENT_PROVIDER: process.env.NEXT_PUBLIC_DEFAULT_PAYMENT_PROVIDER,
    NEXT_PUBLIC_PAY_CANCEL_URL: process.env.NEXT_PUBLIC_PAY_CANCEL_URL,
    NEXT_PUBLIC_ENABLE_TURNSTILE: process.env.NEXT_PUBLIC_ENABLE_TURNSTILE,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_ENABLE_CONTENT_SAFETY: process.env.NEXT_PUBLIC_ENABLE_CONTENT_SAFETY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL,
    NEXT_PUBLIC_PROJECT_NAME: process.env.NEXT_PUBLIC_PROJECT_NAME,
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
    NEXT_PUBLIC_OPENPANEL_CLIENT_ID: process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID,
    NEXT_PUBLIC_CLARITY_PROJECT_ID: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
    NEXT_PUBLIC_CUSTOM_ANALYTICS_DOMAIN: process.env.NEXT_PUBLIC_CUSTOM_ANALYTICS_DOMAIN,
    NEXT_PUBLIC_CUSTOM_ANALYTICS_URL: process.env.NEXT_PUBLIC_CUSTOM_ANALYTICS_URL,
    NEXT_PUBLIC_DEFAULT_THEME: process.env.NEXT_PUBLIC_DEFAULT_THEME,
  },

  // Skip validation in edge runtime or during build on CI
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  // Allow empty strings for optional variables
  emptyStringAsUndefined: true,
})
