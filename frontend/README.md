# 前端应用 (Frontend)

基于Next.js 15和React 19的现代化企业评估系统前端应用。

## 🚀 快速开始

### 安装依赖
```bash
npm install --legacy-peer-deps
```

### 启动开发服务器
```bash
npm run dev
```

应用将在 http://localhost:3000 启动

## 📋 技术栈

- **框架**: Next.js 15 (App Router)
- **UI库**: React 19, TypeScript
- **样式**: Tailwind CSS
- **组件库**: Radix UI
- **图标**: Lucide React
- **状态管理**: React Context + useReducer
- **表单处理**: React Hook Form + Zod

## 📁 详细项目结构

```
frontend/
├── 📁 app/                    # Next.js App Router
│   ├── 📁 admin/             # 管理员页面
│   │   └── page.tsx          # 管理员仪表板
│   ├── 📁 api/               # API路由
│   │   └── 📁 llm-advice/
│   │       └── route.ts      # LLM建议API代理
│   ├── 📁 assessment/        # 评估页面
│   │   └── page.tsx          # 评估问卷页面
│   ├── 📁 dashboard/         # 仪表板页面
│   │   └── page.tsx          # 商业仪表板
│   ├── globals.css           # 全局样式
│   ├── layout.tsx            # 根布局组件
│   └── page.tsx              # 首页 (登录页面)
│
├── 📁 components/            # React组件
│   ├── 📁 ui/               # 基础UI组件 (50个文件)
│   │   ├── accordion.tsx    # 手风琴组件
│   │   ├── alert-dialog.tsx # 警告对话框
│   │   ├── avatar.tsx       # 头像组件
│   │   ├── badge.tsx        # 徽章组件
│   │   ├── button.tsx       # 按钮组件
│   │   ├── calendar.tsx     # 日历组件
│   │   ├── card.tsx         # 卡片组件
│   │   ├── checkbox.tsx     # 复选框组件
│   │   ├── collapsible.tsx  # 可折叠组件
│   │   ├── command.tsx      # 命令组件
│   │   ├── context-menu.tsx # 上下文菜单
│   │   ├── dialog.tsx       # 对话框组件
│   │   ├── dropdown-menu.tsx # 下拉菜单
│   │   ├── form.tsx         # 表单组件
│   │   ├── hover-card.tsx   # 悬停卡片
│   │   ├── input.tsx        # 输入框组件
│   │   ├── label.tsx        # 标签组件
│   │   ├── menubar.tsx      # 菜单栏
│   │   ├── navigation-menu.tsx # 导航菜单
│   │   ├── popover.tsx      # 弹出框
│   │   ├── progress.tsx     # 进度条
│   │   ├── radio-group.tsx  # 单选按钮组
│   │   ├── scroll-area.tsx  # 滚动区域
│   │   ├── select.tsx       # 选择器
│   │   ├── separator.tsx   # 分隔符
│   │   ├── sheet.tsx        # 侧边栏
│   │   ├── skeleton.tsx     # 骨架屏
│   │   ├── slider.tsx       # 滑块
│   │   ├── switch.tsx       # 开关
│   │   ├── table.tsx        # 表格
│   │   ├── tabs.tsx         # 标签页
│   │   ├── textarea.tsx     # 文本域
│   │   ├── toast.tsx        # 消息提示
│   │   ├── toggle.tsx       # 切换按钮
│   │   ├── toggle-group.tsx # 切换按钮组
│   │   ├── tooltip.tsx      # 工具提示
│   │   └── utils.ts         # 工具函数
│   │
│   ├── assembling-team-questions.tsx    # 团队组建问题组件
│   ├── assessment-flow.tsx              # 评估流程主组件
│   ├── assessment-sidebar.tsx           # 评估侧边栏
│   ├── base-camp-questions.tsx          # 基础营地问题组件
│   ├── business-dashboard.tsx           # 商业仪表板组件
│   ├── login-form.tsx                  # 登录表单组件
│   ├── question-card.tsx               # 问题卡片组件
│   ├── scaling-essentials-questions.tsx # 扩展要素问题组件
│   ├── service-offering-questions.tsx  # 服务提供问题组件
│   ├── streamlining-climb-questions.tsx # 优化流程问题组件
│   ├── terms-modal.tsx                 # 条款模态框组件
│   ├── theme-provider.tsx              # 主题提供者
│   ├── theme-switcher.tsx              # 主题切换器
│   ├── theme-toggle.tsx                # 主题切换按钮
│   ├── toaster.tsx                     # 消息提示组件
│   ├── toolbox-success-questions.tsx  # 成功工具箱问题组件
│   └── tracking-climb-questions.tsx    # 跟踪进展问题组件
│
├── 📁 contexts/             # React Context
│   └── assessment-context.tsx # 评估状态管理上下文
│
├── 📁 data/                 # 数据文件
│   └── 📁 scores/
│       └── example_scores.json # 示例分数数据
│
├── 📁 hooks/                # 自定义Hooks
│   ├── use-mobile.tsx      # 移动端检测Hook
│   └── use-toast.ts         # 消息提示Hook
│
├── 📁 lib/                  # 工具函数和配置
│   ├── auth.ts              # 认证相关工具函数
│   ├── pillar-advice.json  # 支柱建议数据
│   ├── score-calculator.ts # 分数计算器
│   └── utils.ts             # 通用工具函数
│
├── 📁 public/               # 静态资源
│   └── 📁 images/
│       ├── ascent-logo-home.png    # 首页Logo
│       ├── ascent-logo.png         # 主Logo
│       ├── dashboard-bg.png        # 仪表板背景
│       ├── login-bg.png           # 登录背景
│       ├── questionnaire-bg.png  # 问卷背景
│       ├── register-form.png     # 注册表单背景
│       └── request-call-form.png # 请求通话表单背景
│
├── 📁 styles/               # 样式文件
│   └── globals.css          # 全局样式
│
├── 📁 user-exports/         # 用户导出数据
│   ├── 953921736@qq.com.json      # 用户评估数据
│   ├── user_default.json         # 默认用户数据
│   └── yzx953921736@gmail.com.json # 用户评估数据
│
├── 📁 backup/               # 备份文件
│   ├── 📁 fastapi_backup/   # FastAPI备份
│   │   ├── 📁 api/          # API备份
│   │   ├── 📁 tests/        # 测试备份
│   │   ├── main.py          # 主文件备份
│   │   ├── requirements.txt # 依赖备份
│   │   └── README.md        # 文档备份
│   └── main_backup.py       # 主文件备份
│
├── components.json          # Radix UI组件配置
├── next-env.d.ts            # Next.js类型定义
├── next.config.mjs         # Next.js配置文件
├── package.json             # 前端依赖配置
├── postcss.config.mjs      # PostCSS配置
├── tailwind.config.ts      # Tailwind CSS配置
├── tsconfig.json           # TypeScript配置
├── test-api.html           # API测试页面
├── test-backend.html       # 后端测试页面
├── test-json-format.html  # JSON格式测试页面
├── README.md               # 前端文档
└── UI_MODIFICATIONS_LOG.md # UI修改日志
```

## 🎨 主要功能

### 1. 用户认证
- 登录表单 (`login-form.tsx`)
- 用户会话管理 (`auth.ts`)
- 本地存储用户信息

### 2. 评估问卷
- 7个核心业务模块问题组件
- 实时进度保存 (`assessment-context.tsx`)
- 响应式设计

### 3. 结果展示
- 动态仪表板 (`business-dashboard.tsx`)
- 雷达图可视化
- LLM建议展示

### 4. 数据导出
- JSON格式导出 (`user-exports/`)
- 用户报告生成

## 🔧 开发指南

### 添加新组件
```tsx
// components/MyComponent.tsx
"use client"

import { useState } from "react"

export function MyComponent() {
  const [state, setState] = useState()
  
  return (
    <div>
      {/* 组件内容 */}
    </div>
  )
}
```

### 使用Context
```tsx
import { useAssessment } from "@/contexts/assessment-context"

function MyComponent() {
  const { state, dispatch } = useAssessment()
  
  // 使用状态和分发器
}
```

### 样式指南
- 使用Tailwind CSS类名
- 支持深色/浅色主题
- 响应式设计优先

### 添加新页面
```tsx
// app/new-page/page.tsx
export default function NewPage() {
  return (
    <div>
      {/* 页面内容 */}
    </div>
  )
}
```

## 🧪 测试

```bash
# 运行单元测试
npm test

# 运行E2E测试
npm run test:e2e
```

## 📦 构建

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 🔍 故障排除

### 常见问题

1. **依赖安装失败**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **端口冲突**
   - 检查3000端口是否被占用
   - 修改 `package.json` 中的启动脚本

3. **API连接失败**
   - 确认后端服务在8000端口运行
   - 检查CORS配置

4. **TypeScript错误**
   - 检查类型定义
   - 运行 `npm run type-check`

## 📝 环境变量

创建 `.env.local` 文件：

```env
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📊 性能优化

### 代码分割
- 使用动态导入
- 组件懒加载
- 路由级别分割

### 缓存策略
- 静态资源缓存
- API响应缓存
- 用户数据缓存

## 🔒 安全考虑

### 输入验证
- 使用Zod进行表单验证
- XSS防护
- CSRF保护

### 数据保护
- 敏感信息不暴露
- 本地存储加密
- API密钥保护