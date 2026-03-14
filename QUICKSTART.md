# 快速启动指南

本指南将帮助您在本地快速启动电仪中心班组管理系统V1.0。

## 前置要求

在开始之前，请确保您的系统已安装：

- **Node.js** 18.x 或更高版本
- **npm**（通常随 Node.js 一起安装）

### 检查 Node.js 版本

打开终端或命令提示符，运行：

```bash
node --version
```

如果显示版本号低于 18.x，请访问 [nodejs.org](https://nodejs.org/) 下载并安装最新版本。

## 安装步骤

### 1. 安装项目依赖

在项目根目录下运行：

```bash
npm install
```

这将安装所有必需的依赖包，包括：
- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts（图表库）
- xlsx（Excel 处理）
- 其他工具库

### 2. 启动开发服务器

安装完成后，运行：

```bash
npm run dev
```

### 3. 访问应用

打开浏览器，访问：

```
http://localhost:3000
```

您应该能看到仪表维护管理系统的首页。

## 功能导航

首页展示了 12 个功能模块，点击任意模块即可进入对应功能：

### 已实现功能

1. **人员信息管理** (`/personnel`)
   - 管理员工信息
   - 上传员工照片
   - 导入/导出 Excel

2. **经验分享** (`/experiences`)
   - 发布维护经验
   - 浏览和评论
   - 点赞功能

3. **每日工作安排** (`/daily-work`)
   - 创建工作任务
   - 更新任务状态
   - 上传工作图片

4. **仪表维护工单** (`/work-orders`)
   - 创建维护工单
   - 跟踪工单状态
   - 分配负责人

5. **统计报表** (`/statistics`)
   - 查看维护完成率
   - 故障频次统计
   - 工时统计
   - 数据可视化图表

6. **仪表基础信息** (`/instruments`)
   - 管理仪表信息
   - 查询仪表数据
   - 导入/导出 Excel

7. **设备故障处理** (`/faults`)
   - 上报设备故障
   - 跟踪处理进度
   - 记录解决方案

## 使用示例

### 示例 1：添加人员

1. 点击首页的"人员信息管理"
2. 点击"添加人员"按钮
3. 填写人员信息：
   - 姓名：张三
   - 工号：EMP001
   - 部门：维护部
   - 职位：高级工程师
   - 电话：13800138001
   - 邮箱：zhangsan@example.com
4. 点击"添加"保存

### 示例 2：创建工单

1. 点击首页的"仪表维护工单"
2. 点击"创建工单"按钮
3. 填写工单信息：
   - 工单号：WO-2024-001
   - 仪表名称：压力变送器
   - 仪表位置：车间A-1
   - 故障描述：显示值波动异常
   - 优先级：高
4. 点击"创建"保存

### 示例 3：查看统计报表

1. 点击首页的"统计报表"
2. 查看各项统计数据：
   - 维护完成率
   - 故障频次
   - 总工时
   - 平均响应时间
3. 查看图表可视化
4. 点击"导出Excel"下载报表

## 开发模式特性

在开发模式下，您可以使用以下特性：

### 热重载

修改代码后，浏览器会自动刷新显示最新更改。

### 错误提示

代码错误会在浏览器中显示详细的错误信息。

### TypeScript 类型检查

TypeScript 会在编辑时提供类型提示和错误检查。

## 常用命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 运行代码检查
npm run lint
```

## 故障排除

### 问题 1：端口被占用

**错误信息**：`Port 3000 is already in use`

**解决方案**：

方法 1：关闭占用端口的程序

方法 2：使用其他端口：

```bash
PORT=3001 npm run dev
```

### 问题 2：依赖安装失败

**错误信息**：`npm ERR!`

**解决方案**：

1. 清除 npm 缓存：

```bash
npm cache clean --force
```

2. 删除 `node_modules` 和 `package-lock.json`：

```bash
rm -rf node_modules package-lock.json
```

3. 重新安装依赖：

```bash
npm install
```

### 问题 3：构建失败

**错误信息**：`Build failed`

**解决方案**：

1. 检查 TypeScript 错误：

```bash
npx tsc --noEmit
```

2. 检查 ESLint 错误：

```bash
npm run lint
```

3. 修复所有错误后重新构建

### 问题 4：图片上传不工作

**说明**：当前版本使用 Base64 编码存储图片，适合演示但不适合生产环境。

**解决方案**：

- 图片会以 Base64 格式存储在内存中
- 重启应用后图片会丢失
- 生产环境建议使用对象存储服务

## 数据说明

### 数据存储

当前版本使用内存数据存储（DataStore），特点：

- ✅ 快速响应
- ✅ 适合开发和演示
- ❌ 应用重启后数据丢失
- ❌ 不适合生产环境

### 示例数据

应用启动时会自动加载示例数据：

- 2 个人员记录
- 2 个仪表信息
- 1 个工单
- 1 个经验分享

### 数据持久化

如需数据持久化，建议：

1. 集成数据库（PostgreSQL、MongoDB）
2. 实现数据备份
3. 添加数据迁移功能

## 下一步

### 学习资源

- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev)
- [TypeScript 文档](https://www.typescriptlang.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

### 部署到生产环境

参考 [DEPLOYMENT.md](./DEPLOYMENT.md) 了解如何部署到 Vercel。

### 扩展功能

考虑添加以下功能：

1. 用户认证和授权
2. 真实数据库集成
3. 文件上传服务
4. 实时通知
5. 移动端适配

## 获取帮助

如遇到问题：

1. 查看本文档的故障排除部分
2. 检查浏览器控制台错误
3. 查看 [README.md](./README.md) 了解更多信息
4. 提交 Issue 寻求帮助

## 技术支持

- 项目文档：[README.md](./README.md)
- 部署指南：[DEPLOYMENT.md](./DEPLOYMENT.md)
- Next.js 支持：[nextjs.org](https://nextjs.org)
- Vercel 支持：[vercel.com/docs](https://vercel.com/docs)
