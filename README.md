# 游戏托管管理平台 - 前端项目

基于 Vue 3 + Vite + TypeScript 的游戏托管管理平台前端应用。

## 技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite 6
- **语言**: TypeScript
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **UI 框架**: Element Plus
- **HTTP 客户端**: Axios
- **时间处理**: Day.js

## 功能模块

### 1. 用户认证
- 用户注册
- 用户登录
- Token 自动存储和注入
- 路由守卫（未登录自动跳转）

### 2. 游戏账号管理
- 查看已绑定的游戏账号列表
- 绑定新的游戏账号
- 查看账号下的角色列表
- 同步角色数据

### 3. 角色配置管理
- 查看所有角色的配置列表
- 编辑角色配置详情
- 功能开关管理（每日任务、自动战斗、自动升级等9个功能）
- 批量更新配置

### 4. 任务管理
- 查看所有任务列表
- 创建新任务（购买魅力、战役续费等）
- 启用/禁用任务
- 删除任务
- 查看任务执行统计

### 5. 任务监控
- 实时查看系统健康状态
- 调度器状态监控
- 任务执行统计和成功率分析
- 手动触发任务执行

### 6. Dashboard 仪表板
- 账号数量统计
- 任务状态统计
- 系统状态总览
- 快速操作入口

## 项目结构

```
agents-front/
├── public/                    # 静态资源
├── src/
│   ├── api/                  # API 接口封装
│   │   ├── modules/         # 按模块划分的 API
│   │   │   ├── auth.ts      # 用户认证
│   │   │   ├── account.ts   # 游戏账号管理
│   │   │   ├── roleConfig.ts # 角色配置
│   │   │   ├── task.ts      # 任务管理
│   │   │   └── game.ts      # 游戏操作
│   │   └── request.ts       # Axios 实例配置
│   ├── assets/              # 资源文件
│   │   └── styles/          # 全局样式
│   ├── components/          # 公共组件
│   │   └── layout/          # 布局组件
│   ├── router/              # 路由配置
│   ├── stores/              # Pinia 状态管理
│   │   ├── user.ts          # 用户状态
│   │   ├── account.ts       # 游戏账号状态
│   │   └── task.ts          # 任务状态
│   ├── types/               # TypeScript 类型定义
│   │   ├── api.ts           # API 类型
│   │   └── models.ts        # 数据模型类型
│   ├── utils/               # 工具函数
│   │   ├── auth.ts          # 认证工具
│   │   └── format.ts        # 格式化工具
│   ├── views/               # 页面组件
│   │   ├── auth/            # 登录/注册
│   │   ├── dashboard/       # 仪表板
│   │   ├── accounts/        # 账号管理
│   │   ├── config/          # 角色配置
│   │   └── tasks/           # 任务管理
│   ├── App.vue              # 根组件
│   └── main.ts              # 入口文件
├── .env.development         # 开发环境配置
├── .env.production          # 生产环境配置
├── index.html               # HTML 模板
├── vite.config.ts           # Vite 配置
├── tsconfig.json            # TypeScript 配置
└── package.json             # 项目配置

```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000（或显示的端口）

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 环境配置

### 开发环境 (.env.development)

```env
VITE_API_BASE_URL=http://localhost:7001
VITE_APP_TITLE=游戏托管管理平台
```

### 生产环境 (.env.production)

```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_TITLE=游戏托管管理平台
```

## API 接口说明

后端接口地址: http://localhost:7001

所有接口使用 Bearer Token 认证：
```
Authorization: Bearer <token>
```

### 统一响应格式

```typescript
{
  "code": 200,
  "msg": "success",
  "data": {}
}
```

### 主要接口

#### 用户认证
- POST /user/register - 用户注册
- POST /user/login - 用户登录

#### 游戏账号
- POST /user/get_bind_list - 获取绑定列表
- POST /user/bind - 绑定账号
- POST /user/game_role - 获取角色列表
- POST /user/sync_role_data - 同步角色数据

#### 角色配置
- POST /role-config/list - 获取配置列表
- POST /role-config/detail - 获取配置详情
- POST /role-config/save - 保存配置
- POST /role-config/batch-update - 批量更新

#### 任务管理
- GET /game/task/list - 获取任务列表
- POST /game/task/{taskId}/toggle - 启用/禁用任务
- DELETE /game/task/{taskId} - 删除任务
- POST /game/task/charm-buy - 创建购买魅力任务
- POST /game/task/battle-renewal-hangup - 创建战役续费任务

#### 任务监控
- GET /daily-task/status - 获取调度器状态
- GET /daily-task/health - 健康检查
- GET /daily-task/config - 获取调度器配置
- POST /daily-task/execute-all - 执行所有任务

完整的 API 文档请查看 api.json 或访问 Swagger UI。

## 项目特点

### 1. 类型安全
- 完整的 TypeScript 类型定义
- API 请求/响应类型化
- Store 状态类型化

### 2. 模块化设计
- API 按功能模块划分
- 组件按页面功能组织
- 状态管理模块化

### 3. 简约式 UI
- 蓝色主色调
- 卡片式布局
- 充足的留白和间距
- 清晰的视觉层次

### 4. 用户体验
- 加载状态提示
- 操作确认对话框
- Toast 消息提醒
- 表单验证反馈
- 错误统一处理

### 5. 开发体验
- Vite 快速热更新
- TypeScript 智能提示
- 模块化代码组织
- 清晰的目录结构

## 开发说明

### 添加新页面

1. 在 `src/views/` 下创建页面组件
2. 在 `src/router/index.ts` 中添加路由配置
3. 如需侧边栏显示，在 `src/components/layout/Layout.vue` 中添加菜单项

### 添加新 API

1. 在 `src/types/api.ts` 中定义请求/响应类型
2. 在对应的 `src/api/modules/` 文件中添加 API 函数
3. 在组件或 Store 中调用

### 添加新状态

1. 在 `src/stores/` 中创建新的 store 文件
2. 使用 Composition API 风格定义状态和方法
3. 在组件中使用 `const xxxStore = useXxxStore()`

## 待办事项

- [ ] 添加单元测试
- [ ] 添加 E2E 测试
- [ ] 优化移动端适配
- [ ] 添加国际化支持
- [ ] 添加主题切换功能
- [ ] 优化性能（虚拟滚动、懒加载等）

## 已知问题

1. 某些接口可能需要后端补充（如用户退出登录、获取当前用户信息等）
2. 任务执行日志/历史记录功能需要后端补充接口
3. 部分列表接口可能需要添加分页支持

## 浏览器支持

- Chrome >= 90
- Firefox >= 90
- Safari >= 14
- Edge >= 90

## 许可证

Private

## 更新日志

### v1.0.0 (2025-12-27)
- 初始版本发布
- 实现所有核心功能模块
- 完成 UI/UX 设计
- 集成后端 API
