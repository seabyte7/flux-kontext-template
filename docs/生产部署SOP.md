# FluxKontext 生产部署 SOP（Vercel）

本文是当前仓库的生产上线标准流程，目标是可重复、可回滚、可验证。

配套模板文件：`docs/vercel.production.env.template`

## 1. 适用范围

- 部署平台：Vercel
- 技术栈：Next.js + Supabase + NextAuth + Fal.ai
- 对应配置文件：`vercel.json`、`env.example`、`middleware.ts`、`.npmrc`

## 2. 发布前准备

1. 确认生产域名（示例：`https://yourdomain.com`）。
2. 确认 Supabase、Google OAuth、Fal.ai 已创建并可用；如启用支付，同时确认 Stripe 或 Creem 已配置完成。
3. 本地代码已合并到待发布分支，且无未确认改动。

## 3. 必填环境变量（Production）

以下变量是生产必填，缺失会导致构建或运行异常：

```bash
FAL_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=
GOOGLE_ID=
GOOGLE_SECRET=
PAYMENT_VALIDATION_SECRET=
```

安全要求：

1. `NEXTAUTH_URL` 必须是生产 HTTPS 域名。
2. `NEXTAUTH_SECRET` 建议至少 32 位随机字符串。
3. `PAYMENT_VALIDATION_SECRET` 必须至少 32 位随机字符串（当前代码强制）。
4. `SUPABASE_SERVICE_ROLE_KEY` 仅服务端使用，禁止泄露。

可用命令生成随机密钥：

```bash
openssl rand -base64 48 | tr -d '\n'
```

## 4. 推荐环境变量（Production）

```bash
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_WEB_URL=https://yourdomain.com
NEXT_PUBLIC_PROJECT_NAME=Flux Kontext
ADMIN_EMAILS=admin@yourdomain.com,support@yourdomain.com
LOG_LEVEL=info
```

## 5. 按功能选填环境变量

### 5.1 Stripe

```bash
NEXT_PUBLIC_ENABLE_STRIPE=true
STRIPE_PUBLIC_KEY=
STRIPE_PRIVATE_KEY=
STRIPE_WEBHOOK_SECRET=
```

### 5.2 Creem

```bash
NEXT_PUBLIC_ENABLE_CREEM=true
CREEM_API_KEY=
CREEM_API_URL=https://api.creem.io/v1
CREEM_WEBHOOK_SECRET=
```

### 5.3 Cloudflare R2

```bash
NEXT_PUBLIC_ENABLE_R2=true
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
R2_CUSTOM_DOMAIN=
```

### 5.4 Turnstile

```bash
NEXT_PUBLIC_ENABLE_TURNSTILE=true
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

### 5.5 Analytics（含 pageview.click）

```bash
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
NEXT_PUBLIC_OPENPANEL_CLIENT_ID=
NEXT_PUBLIC_CLARITY_PROJECT_ID=
NEXT_PUBLIC_CUSTOM_ANALYTICS_DOMAIN=
NEXT_PUBLIC_CUSTOM_ANALYTICS_URL=https://click.pageview.click/js/script.js
```

### 5.6 邮件

```bash
RESEND_API_KEY=
EMAIL_FROM=
```

## 6. Vercel 项目配置步骤

1. 在 Vercel 创建/导入项目（关联 Git 仓库）。
2. Framework 选择 Next.js（仓库已包含 `vercel.json`）。
3. 在 Project Settings -> Environment Variables 中录入上面变量，作用域选 `Production`。
4. 自定义域名绑定后，确保 `NEXTAUTH_URL`、`NEXT_PUBLIC_SITE_URL`、`NEXT_PUBLIC_WEB_URL` 与正式域名一致。

## 7. 首次上线流程

### 7.1 本地预检

```bash
npm ci
npm run build
```

### 7.2 部署

Dashboard 方式：在 Vercel 触发 Production Deploy。  
CLI 方式：

```bash
npm i -g vercel
vercel login
vercel link
vercel --prod
```

## 8. 第三方回调配置

### 8.1 Google OAuth 回调

```text
https://yourdomain.com/api/auth/callback/google
```

### 8.2 Stripe Webhook

```text
https://yourdomain.com/api/webhooks/stripe
```

### 8.3 Creem Webhook

```text
https://yourdomain.com/api/webhooks/payments
```

## 9. 上线后验收（必须执行）

```bash
curl -I https://yourdomain.com
curl -i https://yourdomain.com/api/health
curl -i https://yourdomain.com/api/debug/env
```

预期：

1. 首页返回 200/301，且包含安全响应头（CSP/HSTS 等）。
2. `/api/health` 返回 200。
3. `/api/debug/*` 在生产返回 404（线上已关闭调试接口）。

## 10. 回滚流程

1. 打开 Vercel 项目 Deployments。
2. 选择上一个稳定版本，执行 Promote/Redeploy。
3. 回滚后重新执行第 9 节验收命令。

## 11. 常见问题

1. 登录失败：优先检查 `NEXTAUTH_URL` 是否为生产 HTTPS 域名。
2. 支付验签报错：检查 `PAYMENT_VALIDATION_SECRET` 是否已配置且长度 >= 32。
3. 构建失败：先本地 `npm run build` 复现，再看 Vercel 构建日志。
4. 数据库权限错误：确认使用了正确的 `SUPABASE_SERVICE_ROLE_KEY`。
