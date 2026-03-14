# 仪表班组管理系统V1.0

基于 Next.js 14 + TypeScript + Tailwind CSS 构建。

## 功能特性

### 已实现功能

1. **人员信息管理**
   - 人员信息的增删改查
   - 照片上传
   - Excel 导入导出
   - 搜索和筛选功能

2. **经验分享**
   - 发布经验分享
   - 浏览和搜索
   - 评论和点赞功能
   - 照片上传
   - Excel 导出

3. **每日工作安排**
   - 工作任务创建
   - 状态更新
   - 图片上传
   - 工时管理

4. **仪表维护工单**
   - 工单创建、跟踪、处理全流程
   - 优先级管理
   - 状态跟踪
   - 分配管理

5. **统计报表**
   - 维护完成率统计
   - 故障频次统计
   - 工时统计
   - 数据可视化图表
   - Excel 导出

6. **仪表基础信息**
   - 仪表信息管理
   - 快速查询和搜索
   - 技术规格管理
   - Excel 导入导出

7. **设备故障处理**
   - 故障上报
   - 故障处理和跟踪
   - 严重程度管理
   - 解决方案记录
   - Excel 导出

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **编程语言**: TypeScript
- **样式框架**: Tailwind CSS
- **图表库**: Recharts
- **图标库**: Lucide React
- **Excel 处理**: xlsx
- **日期处理**: date-fns

## 快速开始

### 环境要求

- Node.js 18.x 或更高版本
- npm 或 yarn 或 pnpm

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 部署到 Vercel

### 方法一：通过 Vercel CLI 部署

1. 安装 Vercel CLI
```bash
npm install -g vercel
```

2. 登录 Vercel
```bash
vercel login
```

3. 部署项目
```bash
vercel
```

4. 部署到生产环境
```bash
vercel --prod
```

### 方法二：通过 Vercel Dashboard 部署

1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击 "Add New Project"
3. 导入你的 GitHub 仓库
4. Vercel 会自动检测 Next.js 项目并配置构建设置
5. 点击 "Deploy" 开始部署

### 环境变量

在 Vercel 项目设置中配置以下环境变量（可选）：

```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## 项目结构

```
instrument-maintenance-system/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── api/               # API 路由
│   │   │   ├── personnel/     # 人员信息 API
│   │   │   ├── experiences/   # 经验分享 API
│   │   │   ├── daily-works/   # 每日工作 API
│   │   │   ├── work-orders/   # 工单管理 API
│   │   │   ├── instruments/   # 仪表信息 API
│   │   │   ├── faults/        # 故障处理 API
│   │   │   └── statistics/    # 统计数据 API
│   │   ├── personnel/         # 人员管理页面
│   │   ├── experiences/       # 经验分享页面
│   │   ├── daily-work/        # 每日工作页面
│   │   ├── work-orders/       # 工单管理页面
│   │   ├── statistics/        # 统计报表页面
│   │   ├── instruments/       # 仪表信息页面
│   │   ├── faults/            # 故障处理页面
│   │   ├── layout.tsx         # 根布局
│   │   ├── page.tsx           # 首页
│   │   └── globals.css        # 全局样式
│   ├── components/            # 共享组件
│   │   └── Navbar.tsx         # 导航栏组件
│   ├── lib/                   # 工具库
│   │   ├── dataStore.ts       # 数据存储（内存数据库）
│   │   └── utils.ts           # 工具函数
│   └── types/                 # TypeScript 类型定义
│       └── index.ts           # 类型定义
├── public/                    # 静态资源
├── package.json               # 项目依赖
├── tsconfig.json             # TypeScript 配置
├── tailwind.config.ts        # Tailwind CSS 配置
├── next.config.ts            # Next.js 配置
├── vercel.json               # Vercel 部署配置
└── README.md                 # 项目说明
```

## 数据存储

当前版本使用内存数据存储（DataStore），数据在应用重启后会重置。在生产环境中，建议：

1. 使用数据库（如 PostgreSQL、MongoDB）
2. 实现数据持久化
3. 添加用户认证和授权

## 待实现功能

- 维护计划管理
- 培训计划管理
- 修旧利废管理
- 排班计划管理
- 文档管理
- 用户认证和授权
- 数据库集成

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送 Pull Request
- 联系项目维护者
