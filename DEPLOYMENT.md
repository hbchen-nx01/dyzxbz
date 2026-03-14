# Vercel 部署指南

本指南将帮助您将仪表班组管理系统V1.0部署到 Vercel 平台。

## 前置准备

1. **安装 Node.js**
   - 下载并安装 Node.js 18.x 或更高版本
   - 访问 [nodejs.org](https://nodejs.org/) 下载

2. **创建 Vercel 账户**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub、GitLab 或 Bitbucket 账户登录

## 部署步骤

### 方法一：通过 Vercel CLI 部署（推荐）

#### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

按照提示完成登录流程。

#### 3. 进入项目目录

```bash
cd c:\Users\Administrator\Desktop\20260308
```

#### 4. 安装项目依赖

```bash
npm install
```

#### 5. 部署到预览环境

```bash
vercel
```

按照提示操作：
- ? Set up and deploy "~/Desktop/20260308"? [Y/n] `Y`
- ? Which scope do you want to deploy to? `选择您的账户`
- ? Link to existing project? [y/N] `N`
- ? What's your project's name? `instrument-maintenance-system`
- ? In which directory is your code located? `./`
- ? Want to modify these settings? [y/N] `N`

Vercel 会自动构建并部署您的应用。部署完成后，您会获得一个预览 URL。

#### 6. 部署到生产环境

```bash
vercel --prod
```

### 方法二：通过 Vercel Dashboard 部署

#### 1. 推送代码到 GitHub

```bash
# 初始化 Git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交更改
git commit -m "Initial commit"

# 创建 GitHub 仓库并推送
# 访问 github.com/new 创建新仓库
# 然后执行以下命令：
git remote add origin https://github.com/your-username/instrument-maintenance-system.git
git branch -M main
git push -u origin main
```

#### 2. 在 Vercel 导入项目

1. 访问 [vercel.com/dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 选择 "Import Git Repository"
4. 选择您的 GitHub 仓库
5. 点击 "Import"

#### 3. 配置项目设置

Vercel 会自动检测 Next.js 项目并配置构建设置：

- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

#### 4. 环境变量（可选）

在 "Environment Variables" 部分添加：

```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### 5. 部署

点击 "Deploy" 按钮开始部署。部署完成后，您会获得一个生产环境 URL。

## 部署后配置

### 自定义域名

1. 访问项目设置
2. 点击 "Domains"
3. 添加您的自定义域名
4. 按照提示配置 DNS 记录

### 环境变量管理

在 Vercel Dashboard 中：

1. 访问项目设置
2. 点击 "Environment Variables"
3. 添加或更新环境变量
4. 重新部署以应用更改

### 查看部署日志

1. 访问项目 Dashboard
2. 点击 "Deployments"
3. 选择任意部署查看日志

## 常见问题

### 1. 构建失败

**问题**: 构建过程中出现错误

**解决方案**:
- 检查 `package.json` 中的依赖是否正确
- 确保所有依赖都已安装
- 查看构建日志了解具体错误

### 2. 部署后页面空白

**问题**: 部署成功但页面显示空白

**解决方案**:
- 检查浏览器控制台是否有错误
- 确保所有 API 路由正确配置
- 检查环境变量是否正确设置

### 3. 数据丢失

**问题**: 重启后数据丢失

**说明**: 当前版本使用内存数据存储，数据在应用重启后会重置。

**解决方案**:
- 在生产环境中集成真实数据库（如 PostgreSQL、MongoDB）
- 实现数据持久化

### 4. 图片上传失败

**问题**: 图片上传功能不工作

**说明**: 当前版本使用 Base64 编码存储图片，不适合生产环境。

**解决方案**:
- 集成对象存储服务（如 AWS S3、Cloudinary）
- 实现文件上传 API

## 性能优化

### 1. 启用图片优化

Next.js 自动优化图片，确保使用 `next/image` 组件：

```tsx
import Image from 'next/image';

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={500}
  height={300}
/>
```

### 2. 启用静态生成

对于不经常变化的页面，使用静态生成：

```tsx
export const dynamic = 'force-static';
```

### 3. 配置缓存

在 `vercel.json` 中配置缓存策略：

```json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## 监控和分析

### 1. Vercel Analytics

启用 Vercel Analytics 来监控网站性能：

1. 访问项目设置
2. 点击 "Analytics"
3. 点击 "Enable Analytics"

### 2. 错误监控

集成错误监控服务（如 Sentry）：

```bash
npm install @sentry/nextjs
```

## 更新部署

### 自动部署

连接 GitHub 仓库后，每次推送到主分支都会自动触发部署。

### 手动部署

```bash
vercel --prod
```

## 回滚部署

如果新版本有问题，可以快速回滚：

1. 访问项目 Dashboard
2. 点击 "Deployments"
3. 找到之前的稳定版本
4. 点击 "..." 菜单
5. 选择 "Promote to Production"

## 支持

如遇到问题，请访问：

- [Vercel 文档](https://vercel.com/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [Vercel 社区](https://vercel.com/community)

## 下一步

部署成功后，建议：

1. 集成真实数据库
2. 实现用户认证和授权
3. 添加单元测试和集成测试
4. 配置 CI/CD 流程
5. 实现日志和监控
