# FluxKontext 项目工程文档

## 1. 项目简介

**FluxKontext.space** 是一个基于 AI 的专业图像生成与编辑平台。用户可以通过文本描述生成高质量图像、编辑已有图像、以及同时处理多张图像。平台集成了 Black Forest Labs 的 FLUX 系列模型（通过 Fal.ai 提供 API 服务），支持多种生成模式，包括文生图（Text-to-Image）、图像编辑（Image-to-Image）和多图编辑（Multi-Image Editing）。

项目采用积分制商业模式，新用户注册赠送 100 积分，用户可通过 Stripe 或 Creem 双支付通道购买积分包或订阅计划。

**线上地址**: `https://fluxkontext.space`

---

## 2. 技术栈

| 层级 | 技术 | 版本/说明 |
|------|------|-----------|
| **前端框架** | Next.js (App Router) | ^15.3.2 |
| **UI 框架** | React | ^18.3.1 |
| **样式方案** | Tailwind CSS + shadcn/ui | ^3.4.17 |
| **动画** | Framer Motion | ^12.14.0 |
| **状态管理** | Zustand | ^5.0.5 |
| **身份认证** | NextAuth.js v4 | ^4.24.11 |
| **数据库** | Supabase (PostgreSQL) | ^2.47.10 |
| **AI 服务** | Fal.ai (FLUX Kontext) | ^1.5.0 |
| **支付 - 主** | Stripe | ^17.5.0 |
| **支付 - 副** | Creem | REST API |
| **文件存储** | Cloudflare R2 (S3 兼容) | AWS SDK ^3.817 |
| **人机验证** | Cloudflare Turnstile | 可选 |
| **密码加密** | bcryptjs | ^3.0.2 |
| **代码规范** | Biome + ESLint | — |
| **语言** | TypeScript | ^5.8.3 |
| **部署平台** | Vercel | — |

---

## 3. 代码目录结构

```
flux-kontext-template/
├── docs/                          # 项目文档
├── public/                        # 静态资源
│   ├── favicon.ico / *.png        # 站点图标
│   ├── logo.png / logo-white.png  # 品牌 Logo
│   ├── manifest.json              # PWA 配置
│   ├── robots.txt                 # 爬虫规则
│   ├── llms.txt / llms-full.txt   # LLM 站点信息
│   └── images/                    # 静态图片
├── scripts/                       # 工具脚本
│   ├── setup-database.sql         # 数据库初始化 SQL
│   ├── quick-setup.js             # 快速配置向导
│   ├── check-config.js            # 配置检查
│   ├── check-payment-config.js    # 支付配置检查
│   ├── check-seo.js               # SEO 检查
│   ├── check-supabase.js          # Supabase 连接检查
│   ├── performance-check.js       # 性能检查
│   └── test-api.js                # API 测试
├── src/
│   ├── app/                       # Next.js App Router 页面
│   │   ├── layout.tsx             # 根布局
│   │   ├── page.tsx               # 首页 (英文)
│   │   ├── globals.css            # 全局样式
│   │   ├── ClientBody.tsx         # 客户端 Body 包装
│   │   ├── not-found.tsx          # 404 页面
│   │   ├── sitemap.ts             # 动态 Sitemap 生成
│   │   ├── auth/                  # 认证页面
│   │   │   ├── signin/page.tsx    # 登录页
│   │   │   └── signup/page.tsx    # 注册页
│   │   ├── generate/page.tsx      # AI 图像生成页（核心功能页）
│   │   ├── dashboard/page.tsx     # 用户仪表盘
│   │   ├── pricing/page.tsx       # 定价页
│   │   ├── privacy/page.tsx       # 隐私政策
│   │   ├── terms/page.tsx         # 服务条款
│   │   ├── refund/page.tsx        # 退款政策
│   │   ├── resources/             # 资源中心
│   │   │   ├── page.tsx           # 资源列表
│   │   │   └── api/page.tsx       # API 文档
│   │   ├── zh/page.tsx            # 中文首页
│   │   ├── ja/page.tsx            # 日语首页
│   │   ├── ko/page.tsx            # 韩语首页
│   │   ├── de/page.tsx            # 德语首页
│   │   ├── es/page.tsx            # 西语首页
│   │   ├── fr/page.tsx            # 法语首页
│   │   ├── it/page.tsx            # 意大利语首页
│   │   ├── nl/page.tsx            # 荷兰语首页
│   │   ├── pl/page.tsx            # 波兰语首页
│   │   ├── pt/page.tsx            # 葡语首页
│   │   ├── ru/page.tsx            # 俄语首页
│   │   ├── tr/page.tsx            # 土耳其语首页
│   │   ├── ar/page.tsx            # 阿拉伯语首页
│   │   ├── hi/page.tsx            # 印地语首页
│   │   ├── bn/page.tsx            # 孟加拉语首页
│   │   └── api/                   # API 路由
│   │       ├── auth/              # 认证 API
│   │       ├── flux-kontext/      # AI 生成 API
│   │       ├── payment/           # 支付 API
│   │       ├── payments/          # 支付结账 API
│   │       ├── upload/            # 文件上传 API
│   │       ├── user/              # 用户/积分 API
│   │       ├── verify-turnstile/  # 人机验证 API
│   │       ├── webhooks/          # Webhook 处理
│   │       ├── admin/             # 管理员 API
│   │       └── debug/             # 调试 API
│   ├── components/                # React 组件
│   │   ├── FluxKontextGenerator.tsx  # 核心：AI 图像生成器
│   │   ├── HomeContent.tsx           # 首页内容
│   │   ├── HomeContentSimple.tsx     # 首页简化版
│   │   ├── Navigation.tsx            # 导航栏
│   │   ├── Footer.tsx                # 页脚
│   │   ├── PricingContent.tsx        # 定价内容
│   │   ├── CreditDisplay.tsx         # 积分显示
│   │   ├── UpgradePrompt.tsx         # 升级提示
│   │   ├── SignInContent.tsx         # 登录内容
│   │   ├── SignUpContent.tsx         # 注册内容
│   │   ├── GoogleOneTap.tsx          # Google 一键登录
│   │   ├── GoogleOneTapTrigger.tsx   # Google 一键登录触发器
│   │   ├── LanguageSwitcher.tsx      # 语言切换器
│   │   ├── StandardTurnstile.tsx     # Turnstile 验证组件
│   │   ├── SmartImagePreview.tsx     # 智能图片预览
│   │   ├── StructuredData.tsx        # 结构化数据 (JSON-LD)
│   │   ├── FAQ.tsx                   # 常见问题
│   │   ├── KeyFeatures.tsx           # 功能特性展示
│   │   ├── HowToSteps.tsx            # 使用步骤
│   │   ├── Logo.tsx                  # Logo 组件
│   │   ├── Analytics.tsx             # 分析追踪
│   │   ├── ApiDocumentation.tsx      # API 文档组件
│   │   ├── ResourcesContent.tsx      # 资源内容
│   │   ├── TwitterShowcase.tsx       # Twitter 展示
│   │   ├── animations/              # 动画组件
│   │   │   ├── SplashCursor.tsx      # 水花光标动画
│   │   │   ├── types.ts             # 动画类型
│   │   │   └── index.ts             # 动画导出
│   │   ├── providers/               # Provider 组件
│   │   │   └── SessionProvider.tsx   # NextAuth Session Provider
│   │   └── ui/                      # shadcn/ui 基础组件
│   │       ├── accordion.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── progress.tsx
│   │       └── textarea.tsx
│   ├── lib/                         # 核心业务逻辑
│   │   ├── auth.ts                  # NextAuth 认证配置
│   │   ├── auth-supabase.ts         # Supabase 认证辅助
│   │   ├── database.ts              # 数据库适配器 (Prisma 风格的 Supabase 封装)
│   │   ├── flux-kontext.ts          # Fal.ai FLUX 模型集成核心
│   │   ├── payment.ts               # 支付通用逻辑
│   │   ├── payment-security.ts      # 支付安全验证 (价格/防重/频率)
│   │   ├── stripe-client.ts         # Stripe 客户端初始化
│   │   ├── user-tiers.ts            # 用户分层系统
│   │   ├── utils.ts                 # 通用工具 (cn 函数)
│   │   ├── payment/                 # 支付模块
│   │   │   ├── router.ts            # 支付智能路由
│   │   │   ├── stripe.ts            # Stripe 集成
│   │   │   └── creem.ts             # Creem 集成
│   │   ├── services/                # 业务服务层
│   │   │   ├── credits.ts           # 积分服务
│   │   │   ├── user.ts              # 用户服务
│   │   │   ├── order.ts             # 订单服务
│   │   │   ├── pricing.ts           # 定价服务
│   │   │   ├── r2-storage.ts        # R2 存储服务
│   │   │   ├── affiliate.ts         # 联盟推广服务
│   │   │   ├── payment-config.ts    # 支付配置服务
│   │   │   └── payment-database.ts  # 支付数据库服务
│   │   ├── config/                  # 配置模块
│   │   │   └── payment.ts           # 支付配置常量
│   │   ├── content/                 # 多语言内容
│   │   │   ├── index.ts             # 内容导出
│   │   │   ├── locale.ts            # 语言定义
│   │   │   ├── home.json            # 首页文案
│   │   │   ├── auth.json            # 认证文案
│   │   │   ├── common.json          # 通用文案
│   │   │   ├── generator.json       # 生成器文案
│   │   │   ├── pricing.json         # 定价文案
│   │   │   └── seo.json             # SEO 文案
│   │   ├── content-safety/          # 内容安全模块
│   │   │   ├── index.ts             # 内容安全服务 (多 API 集成)
│   │   │   └── safe-mode.ts         # 安全模式配置
│   │   ├── i18n/                    # 国际化模块
│   │   │   └── home-config.ts       # 首页多语言配置 (16 种语言)
│   │   ├── seo/                     # SEO 模块
│   │   │   └── metadata-generator.ts # 多语言 SEO 元数据生成器
│   │   ├── supabase/                # Supabase 客户端
│   │   │   ├── client.ts            # 浏览器端客户端
│   │   │   └── server.ts            # 服务器端客户端
│   │   ├── tasks/                   # 定时任务
│   │   │   └── order-cleanup.ts     # 过期订单清理
│   │   ├── types/                   # 类型定义
│   │   │   ├── order.ts             # 订单类型
│   │   │   ├── payment.ts           # 支付类型
│   │   │   ├── pricing.ts           # 定价类型
│   │   │   └── user.ts              # 用户类型
│   │   └── utils/                   # 工具函数
│   │       ├── hash.ts              # UUID/哈希生成
│   │       ├── ip.ts                # IP 地址获取
│   │       ├── response.ts          # API 响应辅助
│   │       └── time.ts              # 时间格式化
│   └── types/                       # 全局类型声明
│       ├── next-auth.d.ts           # NextAuth 类型扩展
│       └── supabase.ts              # Supabase 类型
├── middleware.ts                    # Next.js 中间件 (安全头/速率限制/API 重写)
├── next.config.js                   # Next.js 配置
├── tailwind.config.ts               # Tailwind 配置
├── tsconfig.json                    # TypeScript 配置
├── biome.json                       # Biome 代码格式化配置
├── vercel.json                      # Vercel 部署配置
├── env.example                      # 环境变量模板
└── package.json                     # 项目依赖
```

---

## 4. 路由结构

### 4.1 页面路由

| 路径 | 文件 | 说明 |
|------|------|------|
| `/` | `src/app/page.tsx` | 首页 (英文) |
| `/generate` | `src/app/generate/page.tsx` | AI 图像生成页（核心功能） |
| `/dashboard` | `src/app/dashboard/page.tsx` | 用户仪表盘 |
| `/pricing` | `src/app/pricing/page.tsx` | 定价页 |
| `/auth/signin` | `src/app/auth/signin/page.tsx` | 登录页 |
| `/auth/signup` | `src/app/auth/signup/page.tsx` | 注册页 |
| `/privacy` | `src/app/privacy/page.tsx` | 隐私政策 |
| `/terms` | `src/app/terms/page.tsx` | 服务条款 |
| `/refund` | `src/app/refund/page.tsx` | 退款政策 |
| `/resources` | `src/app/resources/page.tsx` | 资源中心 |
| `/resources/api` | `src/app/resources/api/page.tsx` | API 文档 |
| `/{locale}` | `src/app/{locale}/page.tsx` | 多语言首页 (zh/ja/ko/de/es/fr/it/nl/pl/pt/ru/tr/ar/hi/bn) |

### 4.2 API 路由

| 路径 | 方法 | 说明 |
|------|------|------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth 认证端点 |
| `/api/auth/register` | POST | 邮箱注册 |
| `/api/flux-kontext` | POST | AI 图像生成/编辑核心 API |
| `/api/payment/create-session` | POST | 创建支付会话 |
| `/api/payments/create-checkout` | POST | 创建结账会话 |
| `/api/upload` | POST | 文件上传 |
| `/api/user/credits` | GET | 获取用户积分 |
| `/api/user/credits/consume` | POST | 消耗积分 |
| `/api/user/ensure` | POST | 确保用户存在 |
| `/api/verify-turnstile` | POST | Turnstile 人机验证 |
| `/api/webhooks/stripe` | POST | Stripe Webhook 处理 |
| `/api/webhooks/payments` | POST | Creem Webhook 处理 |
| `/api/admin/maintenance` | POST | 管理员维护模式 |
| `/api/admin/payment-config` | GET/POST | 支付配置管理 |
| `/api/v1/*` | * | 公开 API（中间件重写到 `/api/flux-kontext`） |

---

## 5. 核心功能模块

### 5.1 AI 图像生成

**核心文件**: `src/lib/flux-kontext.ts`、`src/app/api/flux-kontext/route.ts`

#### 支持的模型与端点

| 模型 | 端点 ID | 功能 | 积分消耗 |
|------|---------|------|----------|
| Kontext Pro | `fal-ai/flux-pro/kontext` | 图像编辑 (image-to-image) | 15 |
| Kontext Max | `fal-ai/flux-pro/kontext/max` | 高性能图像编辑 | 30 |
| Kontext Max Multi | `fal-ai/flux-pro/kontext/max/multi` | 多图编辑 (实验性) | 45 |
| Kontext Pro Multi | `fal-ai/flux-pro/kontext/multi` | 多图编辑 Pro | 15 |
| FLUX Pro | `fal-ai/flux-pro` | 文生图 Pro | 15 |
| FLUX 1.1 Pro | `fal-ai/flux-pro/v1.1` | 文生图 Max | 30 |
| FLUX Schnell | `fal-ai/flux/schnell` | 快速文生图 (1-4 步) | 8 |
| FLUX Dev | `fal-ai/flux/dev` | 开发模型文生图 | 12 |
| FLUX Realism | `fal-ai/flux-lora` + LoRA | 照片级真实感 | 20 |
| FLUX Anime | `fal-ai/flux-lora` + LoRA | 动漫风格 | 20 |

#### `FluxKontextService` 类方法

- `editImagePro(input)` — Kontext Pro 单图编辑
- `editImageMax(input)` — Kontext Max 单图编辑
- `editMultiImageMax(input)` — Kontext Max 多图编辑
- `editMultiImagePro(input)` — Kontext Pro 多图编辑
- `textToImageMax(input)` — Max 文生图
- `textToImagePro(input)` — Pro 文生图
- `textToImageSchnell(input)` — Schnell 快速文生图
- `textToImageDev(input)` — Dev 开发模型文生图
- `textToImageRealism(input)` — 真实感文生图 (LoRA)
- `textToImageAnime(input)` — 动漫风格文生图 (LoRA)
- `uploadFile(file)` — 双存储上传 (FAL + R2)
- `saveGeneratedImageToR2(imageUrl, prompt)` — AI 生成图保存到 R2
- `submitToQueue(endpoint, input)` — 队列提交
- `checkQueueStatus(endpoint, requestId)` — 队列状态查询
- `getQueueResult(endpoint, requestId)` — 队列结果获取

#### 生成流程

```
用户提交 Prompt → 前端组件 (FluxKontextGenerator)
  → POST /api/flux-kontext
  → 认证验证 (NextAuth Session)
  → 积分检查 (checkUserCredits)
  → 内容安全检查 (可选)
  → 调用 Fal.ai API (fal.subscribe)
  → 积分扣除 (consumeCreditsForImageGeneration)
  → 图片保存到 R2 (可选)
  → 返回生成结果
```

---

### 5.2 用户认证系统

**核心文件**: `src/lib/auth.ts`

#### 支持的认证方式

| 认证方式 | 开关环境变量 | 说明 |
|----------|-------------|------|
| Google OAuth | `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED` | 主要登录方式，支持 Google One Tap |
| GitHub OAuth | `NEXT_PUBLIC_AUTH_GITHUB_ENABLED` | 可选 |
| 邮箱/密码 | `NEXT_PUBLIC_AUTH_CREDENTIALS_ENABLED` | 通过 Supabase Auth 验证 |

#### 认证流程

1. 用户发起登录 → NextAuth.js 处理
2. `signIn` 回调触发：
   - 查询 Supabase `users` 表，判断是否为新用户
   - **新用户**：创建用户记录，赠送 100 积分，写入 `credit_transactions` 表
   - **老用户**：更新 `last_signin_at`、`signin_count`、头像和昵称
3. 登录成功后重定向到 `/generate` 页面
4. Cookie 配置：`SameSite=lax`，生产环境强制 `Secure`，域名绑定 `fluxkontext.space`

---

### 5.3 支付系统

#### 5.3.1 双通道架构

**核心文件**: `src/lib/payment/router.ts`、`src/lib/payment/stripe.ts`、`src/lib/payment/creem.ts`

系统支持 **Stripe** 和 **Creem** 双支付通道，通过智能路由自动选择：

| 规则 | 优先级 | 推荐通道 |
|------|--------|----------|
| 中国用户 + CNY | 1 | Creem |
| 订阅业务 | 2 | Stripe |
| 大额支付 (>$100) | 3 | Stripe |
| 亚洲地区小额 (<$50) | 4 | Creem |
| 默认 | 10 | Stripe |

#### 路由选择逻辑 (`selectPaymentProvider`)

```
用户偏好 → 环境变量检查 → 路由规则匹配 → 默认回退
```

#### 5.3.2 Stripe 集成

- 创建 Checkout Session（支持 card/link/wechat_pay/alipay）
- Webhook 事件处理：`checkout.session.completed`、`subscription.*`、`invoice.*`
- 5 重订单完整性验证：订单状态、支付状态、金额匹配、用户匹配、邮箱匹配

#### 5.3.3 Creem 集成

- 产品 ID 映射（CREEM 后台名称 → 内部 ID）
- HMAC-SHA256 Webhook 签名验证
- 事件处理：`checkout.completed/failed/cancelled`、`subscription.*`
- 5 重订单完整性验证：订单状态、金额匹配、用户匹配、产品类型匹配、哈希验证

#### 5.3.4 支付安全体系

**核心文件**: `src/lib/payment-security.ts`

| 安全机制 | 说明 |
|----------|------|
| 服务端价格验证 | `STANDARD_PRICING` 权威价格源，防止前端篡改 |
| HMAC-SHA256 验证哈希 | 生成并校验订单验证哈希 |
| 防重复订单 | 5 分钟窗口内检测重复订单 |
| 支付频率限制 | 每小时最多 10 次支付 |
| 订单完整性验证 | 24 小时有效期 + 重新验证价格 |
| 用户存在性验证 | 确认用户在数据库中存在 |

---

### 5.4 积分系统

**核心文件**: `src/lib/services/credits.ts`、`src/lib/user-tiers.ts`

#### 积分操作类型

| 类型 | 说明 |
|------|------|
| `purchase` | 购买获得 |
| `usage` | 使用消耗 |
| `gift` | 系统赠送 |
| `refund` | 退款返还 |
| `bonus` | 奖励 |

#### 积分消耗 (按模型)

| 操作 | 积分 |
|------|------|
| text-to-image-schnell | 8 |
| text-to-image-dev | 12 |
| text-to-image-pro / edit-image-pro / edit-multi-image-pro | 15 |
| text-to-image-realism / text-to-image-anime | 20 |
| text-to-image-max / edit-image-max | 30 |
| edit-multi-image-max | 45 |

#### 标准定价 (payment-security.ts)

**订阅计划**:

| 计划 | 月付 | 月积分 | 年付 | 年积分 |
|------|------|--------|------|--------|
| Basic | $0 | 10 | $0 | 120 |
| Plus | $9.90 | 1,900 | $99 | 24,000 |
| Pro | $29.90 | 8,900 | $299 | 120,000 |

**积分包**:

| 包名 | 价格 | 积分 |
|------|------|------|
| Starter | $4.90 | 600 |
| Creator | $15.00 | 4,000 |
| Business | $60.00 | 18,000 |

#### 用户分层 (`user-tiers.ts`)

| 用户类型 | 最大图片数 | 可用模型 | 每小时限制 | Turnstile | 存储保留 |
|----------|-----------|---------|-----------|-----------|---------|
| Anonymous (匿名) | 2 | pro | 10 次 | 必须 | 7 天 |
| Registered (注册) | 4 | pro, max | 30 次 | 智能 | 30 天 |
| Premium (付费) | 12 | pro, max | 无限 | 免除 | 永久 |

**付费用户专享功能**: 批量生成、私密模式、历史同步、优先队列、模板收藏、API 访问、商业许可

---

### 5.5 文件存储 (Cloudflare R2)

**核心文件**: `src/lib/services/r2-storage.ts`

#### 存储架构

- 使用 AWS S3 兼容 API 连接 Cloudflare R2
- **双存储策略**: 用户上传同时存入 FAL Storage (主) 和 R2 (备份)
- AI 生成图片可选保存到 R2 (长期存储)
- 并发控制队列：限制每秒 1 次写入，避免 R2 并发限制
- 重试机制：指数退避，最多 3 次重试，429 错误特殊处理
- 图片完整性验证：文件头检测 (PNG/JPEG/WebP/GIF)
- URL 可访问性验证：上传后 HEAD 请求验证

#### 文件命名规则

- 用户上传: `flux-kontext-{timestamp}-{random}.{ext}`
- AI 生成: `ai-generated-{timestamp}-{random}.{ext}`

---

### 5.6 国际化 (i18n)

**核心文件**: `src/lib/i18n/home-config.ts`、`src/lib/content/locale.ts`

#### 支持的语言 (16 种)

| 代码 | 语言 | 代码 | 语言 |
|------|------|------|------|
| en | English (默认) | nl | Nederlands |
| zh | 中文 | pl | Polski |
| de | Deutsch | pt | Português |
| es | Español | ru | Русский |
| fr | Français | tr | Türkçe |
| it | Italiano | ar | العربية |
| ja | 日本語 | hi | हिन्दी |
| ko | 한국어 | bn | বাংলা |

#### 实现方式

- 每种语言有独立的页面路由 (`/zh`, `/ja`, `/ko` 等)
- 内容通过 JSON 文件管理 (`src/lib/content/*.json`)
- `HomeDictionary` 接口定义首页所有文案结构
- `LanguageSwitcher` 组件提供语言切换 UI

---

### 5.7 安全体系

#### 5.7.1 中间件安全 (`middleware.ts`)

| 安全头 | 值 |
|--------|-----|
| X-Frame-Options | DENY |
| X-Content-Type-Options | nosniff |
| Referrer-Policy | strict-origin-when-cross-origin |
| X-XSS-Protection | 1; mode=block |
| HSTS | max-age=31536000; includeSubDomains |
| Content-Security-Policy | 完整 CSP 策略 (限制脚本/样式/图片/连接/frame 来源) |

#### 5.7.2 API 速率限制

| API 类型 | 限制 | 时间窗口 |
|----------|------|----------|
| 通用 API | 10 次 | 1 分钟 |
| 认证 API (`/auth/`) | 5 次 | 5 分钟 |
| 支付 API (`/payment/`) | 3 次 | 10 分钟 |

#### 5.7.3 Cloudflare Turnstile

- 可选启用 (`NEXT_PUBLIC_ENABLE_TURNSTILE`)
- 匿名用户必须验证，注册用户智能判断，付费用户免除

#### 5.7.4 内容安全 (`src/lib/content-safety/index.ts`)

三层防护机制：
1. **输入预过滤**: 关键词黑名单 (中英文) + 正则语义模式检测
2. **AI 语义分析**: 多语言可疑模式检测
3. **图像后审核**: 集成多个 API 提供商

支持的审核 API：
- Google Cloud Vision (SafeSearch)
- Azure Content Safety
- OpenAI Moderation (GPT-4V)
- API4AI NSFW Detection
- Sightengine

#### 5.7.5 HTTPS 强制

- 生产环境中间件检测 `x-forwarded-proto`，HTTP 请求 301 重定向到 HTTPS

---

### 5.8 SEO 优化

**核心文件**: `src/lib/seo/metadata-generator.ts`

#### 功能

- `generateMultilingualMetadata(config)` — 自动生成多语言 SEO 元数据
  - Canonical URL 生成
  - hreflang 标签 (16 种语言 + x-default)
  - OpenGraph 元数据 (支持多语言 locale)
  - Twitter Card 配置
  - robots 配置 (index/follow/max-image-preview)
  - Google/Yandex 站点验证
- `generateMultilingualSitemap(pages)` — 动态生成多语言 Sitemap
- `validateHreflangConfig(metadata)` — 开发时 hreflang 配置验证
- JSON-LD 结构化数据 (`StructuredData.tsx`)
- `sitemap.ts` 动态 Sitemap 路由
- `robots.txt` 爬虫规则

---

## 6. 数据库设计

数据库使用 **Supabase (PostgreSQL)**，初始化脚本位于 `scripts/setup-database.sql`。

### 6.1 表结构

#### `users` — 用户表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID (PK) | 主键 |
| email | VARCHAR (UNIQUE) | 邮箱 |
| name | VARCHAR | 昵称 |
| image | VARCHAR | 头像 URL |
| credits | INTEGER (默认 100) | 积分余额 |
| location | VARCHAR | 地理位置 |
| last_signin_at | TIMESTAMPTZ | 最近登录时间 |
| signin_count | INTEGER | 登录次数 |
| signin_type | VARCHAR | 登录类型 |
| signin_provider | VARCHAR | 登录提供商 |
| signin_openid | VARCHAR | 第三方 OpenID |
| signin_ip | VARCHAR | 登录 IP |
| preferred_currency | VARCHAR (默认 USD) | 偏好货币 |
| preferred_payment_provider | VARCHAR | 偏好支付通道 |
| created_at / updated_at | TIMESTAMPTZ | 时间戳 |

#### `payment_orders` — 支付订单表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID (PK) | 主键 |
| user_id | UUID (FK → users) | 用户 ID |
| order_number | VARCHAR (UNIQUE) | 订单号 |
| amount | DECIMAL(10,2) | 金额 |
| currency | VARCHAR(3) | 货币 |
| status | VARCHAR | 状态 (pending/completed/failed/cancelled) |
| payment_provider | VARCHAR | 支付提供商 |
| product_type | VARCHAR | 产品类型 |
| product_id | VARCHAR | 产品 ID |
| product_name | VARCHAR | 产品名称 |
| customer_email | VARCHAR | 客户邮箱 |
| stripe_session_id | VARCHAR | Stripe 会话 ID |
| stripe_payment_intent_id | VARCHAR | Stripe 支付意向 ID |
| creem_checkout_id | VARCHAR | Creem 结账 ID |
| creem_payment_id | VARCHAR | Creem 支付 ID |
| paid_at | TIMESTAMPTZ | 支付时间 |
| metadata | JSONB | 附加数据 |
| created_at / updated_at | TIMESTAMPTZ | 时间戳 |

#### `credit_transactions` — 积分交易记录表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID (PK) | 主键 |
| user_id | UUID (FK → users) | 用户 ID |
| amount | INTEGER | 积分变动量 (正数=获得，负数=消耗) |
| type | VARCHAR | 类型 (purchase/usage/refund/bonus) |
| description | TEXT | 描述 |
| payment_order_id | UUID (FK → payment_orders) | 关联订单 |
| reference_id | VARCHAR | 参考 ID |
| created_at / updated_at | TIMESTAMPTZ | 时间戳 |

#### `subscriptions` — 订阅表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID (PK) | 主键 |
| user_id | UUID (FK → users) | 用户 ID |
| plan_id | VARCHAR | 计划 ID |
| status | VARCHAR | 状态 (active/inactive/cancelled) |
| billing_cycle | VARCHAR | 计费周期 (monthly/yearly) |
| current_period_start | TIMESTAMPTZ | 当前周期开始 |
| current_period_end | TIMESTAMPTZ | 当前周期结束 |
| payment_provider | VARCHAR | 支付提供商 |
| stripe_subscription_id | VARCHAR | Stripe 订阅 ID |
| creem_subscription_id | VARCHAR | Creem 订阅 ID |
| created_at / updated_at | TIMESTAMPTZ | 时间戳 |

#### `payment_configs` — 支付配置表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID (PK) | 主键 |
| stripe_enabled | BOOLEAN | Stripe 启用 |
| creem_enabled | BOOLEAN | Creem 启用 |
| default_provider | VARCHAR | 默认支付商 |
| maintenance_mode | BOOLEAN | 维护模式 |
| last_updated_by | VARCHAR | 最后更新人 |
| notes | TEXT | 备注 |

#### `generations` — 生成记录表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID (PK) | 主键 |
| user_id | UUID (FK → users) | 用户 ID |
| prompt | TEXT | 提示词 |
| model | VARCHAR | 使用模型 |
| credits_used | INTEGER | 消耗积分 |
| image_urls | TEXT[] | 生成图片 URL 数组 |
| settings | JSONB | 生成参数 |
| created_at | TIMESTAMPTZ | 创建时间 |

### 6.2 安全策略

- 所有表启用 **行级安全策略 (RLS)**
- 用户仅可访问和更新自己的数据
- 索引覆盖：`email`、`user_id`、`status` 等高频查询字段
- 自动更新 `updated_at` 触发器

### 6.3 数据库适配器

**文件**: `src/lib/database.ts`

项目使用 `SupabaseAdapter` 类封装数据库操作，对外暴露类似 Prisma 的接口 (`prisma.user.findUnique`、`prisma.paymentOrder.create` 等)，内部将调用转换为 Supabase 查询。导出为 `prisma` 命名以保持代码兼容性。

---

## 7. 环境变量配置

### 7.1 必需配置 (项目无法运行)

| 变量名 | 说明 |
|--------|------|
| `FAL_KEY` | Fal.ai API 密钥 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务角色密钥 |
| `NEXTAUTH_URL` | NextAuth 回调 URL |
| `NEXTAUTH_SECRET` | NextAuth 加密密钥 (≥32 字符) |
| `GOOGLE_ID` | Google OAuth Client ID |
| `GOOGLE_SECRET` | Google OAuth Client Secret |

### 7.2 重要配置 (影响核心功能)

| 变量名 | 说明 |
|--------|------|
| `NEXT_PUBLIC_ENABLE_R2` | 启用 R2 存储 |
| `R2_ACCOUNT_ID` | Cloudflare R2 账户 ID |
| `R2_ACCESS_KEY_ID` | R2 Access Key |
| `R2_SECRET_ACCESS_KEY` | R2 Secret Key |
| `R2_BUCKET_NAME` | R2 存储桶名称 |
| `NEXT_PUBLIC_ENABLE_STRIPE` | 启用 Stripe 支付 |
| `STRIPE_PUBLIC_KEY` | Stripe 公钥 |
| `STRIPE_PRIVATE_KEY` | Stripe 私钥 |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook 密钥 |
| `NEXT_PUBLIC_ENABLE_CREEM` | 启用 Creem 支付 |
| `CREEM_API_KEY` | Creem API 密钥 |
| `CREEM_API_URL` | Creem API 地址 |

### 7.3 可选配置

| 变量名 | 说明 |
|--------|------|
| `NEXT_PUBLIC_AUTH_GITHUB_ENABLED` | 启用 GitHub 登录 |
| `NEXT_PUBLIC_AUTH_CREDENTIALS_ENABLED` | 启用邮箱密码登录 |
| `NEXT_PUBLIC_ENABLE_TURNSTILE` | 启用 Turnstile 人机验证 |
| `NEXT_PUBLIC_ENABLE_CONTENT_SAFETY` | 启用 AI 内容安全 |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | Google Analytics ID |
| `NEXT_PUBLIC_SITE_URL` | 站点 URL |
| `NEXT_PUBLIC_DEFAULT_PAYMENT_PROVIDER` | 默认支付提供商 |
| `ADMIN_EMAILS` | 管理员邮箱列表 |

完整的环境变量模板参见 `env.example`。

---

## 8. 开发与部署命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 (端口 3000) |
| `npm run dev:turbo` | Turbopack 开发模式 |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | ESLint + TypeScript 检查 |
| `npm run format` | Biome 代码格式化 |
| `npm run setup` | 快速配置向导 |
| `npm run setup:env` | 复制环境变量模板 |
| `npm run check` | 配置完整性检查 |
| `npm run check:supabase` | Supabase 连接检查 |
| `npm run seo:check` | SEO 配置检查 |
| `npm run perf` | 性能检查 |
| `npm run test:api` | API 接口测试 |
| `npm run analyze` | 构建 + Bundle 分析 |
| `npm run lighthouse` | Lighthouse 性能审计 |

### 部署

项目通过 **Vercel** 部署，配置文件为 `vercel.json`。部署流程：

1. 在 Supabase 创建项目并执行 `scripts/setup-database.sql`
2. 配置所有必需环境变量
3. 连接 GitHub 仓库到 Vercel
4. Vercel 自动构建并部署

---

## 附录: 关键文件索引

| 模块 | 文件路径 |
|------|---------|
| AI 生成核心 | `src/lib/flux-kontext.ts` |
| AI 生成 API | `src/app/api/flux-kontext/route.ts` |
| 认证配置 | `src/lib/auth.ts` |
| 支付路由 | `src/lib/payment/router.ts` |
| Stripe 集成 | `src/lib/payment/stripe.ts` |
| Creem 集成 | `src/lib/payment/creem.ts` |
| 支付安全 | `src/lib/payment-security.ts` |
| 积分服务 | `src/lib/services/credits.ts` |
| 用户服务 | `src/lib/services/user.ts` |
| 订单服务 | `src/lib/services/order.ts` |
| 定价服务 | `src/lib/services/pricing.ts` |
| 数据库适配 | `src/lib/database.ts` |
| 用户分层 | `src/lib/user-tiers.ts` |
| 中间件 | `middleware.ts` |
| 国际化配置 | `src/lib/i18n/home-config.ts` |
| SEO 元数据 | `src/lib/seo/metadata-generator.ts` |
| R2 存储 | `src/lib/services/r2-storage.ts` |
| 内容安全 | `src/lib/content-safety/index.ts` |
| 主生成组件 | `src/components/FluxKontextGenerator.tsx` |
| 数据库初始化 | `scripts/setup-database.sql` |
| 环境变量模板 | `env.example` |
