# SecondMe Integration Project

## 项目概述
这是一个集成 SecondMe API 的 Next.js 项目，支持 OAuth 登录和多种 SecondMe 功能。

## 技术栈
- **框架**: Next.js 14 (App Router)
- **数据库**: SQLite + Prisma ORM
- **样式**: Tailwind CSS
- **语言**: TypeScript

## 已启用模块
- ✅ Auth - OAuth 2.0 登录
- ✅ Profile - 用户个人资料
- ✅ Note - 笔记功能
- ✅ Soft Memory - 软记忆
- ✅ Interest Tags - 兴趣标签

## 暂时禁用模块
- ❌ Chat - AI 对话（暂不上线）
- ❌ Encyclopedia - 鸟类百科（暂不上线）

## SecondMe API 端点
- 授权: `https://app.second.me/oauth/authorize`
- Token: `https://app.second.me/oauth/token`
- API: `https://api.second.me`

## 项目结构
```
├── .secondme/          # SecondMe 配置（敏感，勿提交）
├── prisma/             # 数据库 Schema
├── src/
│   ├── app/            # Next.js App Router
│   ├── components/     # React 组件
│   ├── lib/            # 工具函数
│   └── types/          # TypeScript 类型
└── .env.local          # 环境变量（敏感，勿提交）
```

## 开发规范
- 界面语言：中文
- 主题：仅亮色主题
- 设计风格：简约优雅
- 动画：仅使用简单过渡效果

## 敏感文件
以下文件包含敏感信息，请勿提交到版本控制：
- `.secondme/`
- `.env.local`
- `prisma/dev.db`
