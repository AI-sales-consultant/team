# 团队评估系统 - 项目启动指南

## 项目概述

这是一个基于 Next.js 前端和 FastAPI 后端的团队评估系统。系统提供用户评估问卷、数据分析和LLM建议生成功能。

## 技术栈

### 前端
- **框架**: Next.js 15.3.4
- **语言**: TypeScript
- **UI库**: Radix UI + Tailwind CSS
- **状态管理**: React Context
- **表单处理**: React Hook Form + Zod

### 后端
- **框架**: FastAPI
- **语言**: Python 3.10+
- **AI服务**: Azure OpenAI
- **数据库**: Azure Cosmos DB
- **服务器**: Uvicorn

## 环境要求

- **Node.js**: 18.0.0 或更高版本
- **Python**: 3.10 或更高版本
- **包管理器**: npm 或 pnpm

## 当前项目结构

```
team/
├── app/                    # Next.js 前端应用
│   ├── admin/             # 管理员页面
│   ├── api/               # Next.js API路由
│   ├── assessment/        # 评估页面
│   ├── dashboard/         # 仪表板页面
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 布局组件
│   └── page.tsx           # 首页
├── backend/
│   └── Fastapi/          # 完整的FastAPI后端 (推荐使用)
│       ├── main.py       # 主应用文件
│       ├── main_safe.py  # 安全版本 (无需Azure凭据)
│       ├── api/          # API模块
│       │   ├── models.py # 数据模型
│       │   ├── prompts.py # 提示词模板
│       │   ├── cosmos_retriever.py # Cosmos DB检索
│       │   └── score_rule.csv # 评分规则
│       ├── requirements.txt # Python依赖
│       ├── .env          # 环境变量配置
│       └── README.md     # 后端文档
├── components/            # React 组件
│   ├── ui/               # UI组件库
│   ├── assessment-flow.tsx # 评估流程
│   ├── business-dashboard.tsx # 业务仪表板
│   └── ...其他组件
├── contexts/             # React Context
│   └── assessment-context.tsx # 评估上下文
├── lib/                  # 工具函数和配置
│   ├── auth.ts           # 认证工具
│   ├── score-calculator.ts # 评分计算
│   └── utils.ts          # 通用工具
├── data/                 # 数据文件
│   └── scores/           # 评分数据
├── hooks/                # 自定义Hooks
├── public/               # 静态资源
│   └── images/           # 图片资源
├── styles/               # 样式文件
├── backup/               # 备份文件
│   ├── fastapi_backup/   # 原fastapi目录备份
│   └── main_backup.py    # 原main.py备份
├── package.json          # 前端依赖配置
├── next.config.mjs       # Next.js配置
├── tailwind.config.ts    # Tailwind配置
└── tsconfig.json         # TypeScript配置
```

## 启动步骤

### 1. 克隆项目

```bash
git clone <项目仓库地址>
cd team
```

### 2. 前端启动

#### 安装依赖
```bash
# 使用 npm
npm install --legacy-peer-deps

# 或使用 pnpm (推荐)
pnpm install --legacy-peer-deps
```

#### 启动开发服务器
```bash
# 使用 npm
npm run dev

# 或使用 pnpm
pnpm dev
```

前端将在 `http://localhost:3000` 启动

### 3. 后端启动

#### 进入后端目录
```bash
cd backend/Fastapi
```

#### 创建虚拟环境 (推荐)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### 安装依赖
```bash
pip install -r requirements.txt
```

#### 配置环境变量
在 `backend/Fastapi/` 目录下创建 `.env` 文件：

```env
# Azure OpenAI 配置
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your-deployment-name

# Azure Cosmos DB 配置 (注意变量名与代码中的一致)
COSMOS_ENDPOINT=https://your-cosmos-account.documents.azure.com:443/
COSMOS_KEY=your_cosmos_db_master_key_here
```

**重要提示**: 
- 确保 `.env` 文件在 `backend/Fastapi/` 目录下
- Cosmos DB 的变量名是 `COSMOS_ENDPOINT` 和 `COSMOS_KEY`（不是 `AZURE_COSMOS_*`）
- 数据库名称和容器名称在代码中已硬编码为 `PromptEngineeringDB` 和 `answers`

#### 启动后端服务
```bash
# 方式1: 使用完整版本 (需要Azure凭据)
uvicorn main:app --reload --host 127.0.0.1 --port 8000

# 方式2: 使用安全版本 (无需Azure凭据)
python main_safe.py

# 方式3: 直接运行 main.py
python main.py
```

后端将在 `http://127.0.0.1:8000` 启动

### 4. 验证启动

#### 前端验证
访问 `http://localhost:3000`，应该能看到应用首页

#### 后端验证
访问 `http://127.0.0.1:8000`，应该能看到 API 欢迎页面

访问 `http://127.0.0.1:8000/docs` 查看 API 文档

## 开发模式

### 前端开发
- 支持热重载
- 修改代码后自动刷新浏览器
- 支持 TypeScript 类型检查

### 后端开发
- 支持热重载 (使用 `--reload` 参数)
- 自动重新加载代码变更
- 实时查看 API 文档

## 常用命令

### 前端命令
```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

### 后端命令
```bash
# 开发模式启动
uvicorn main:app --reload

# 或使用安全版本
python main_safe.py

# 运行测试
python -m pytest tests/
```

## 环境配置说明

### 必需的环境变量

1. **Azure OpenAI 配置**
   - `AZURE_OPENAI_API_KEY`: Azure OpenAI API 密钥
   - `AZURE_OPENAI_ENDPOINT`: Azure OpenAI 端点 (格式: `https://your-resource.openai.azure.com/`)
   - `AZURE_OPENAI_DEPLOYMENT`: 部署名称

2. **Azure Cosmos DB 配置**
   - `COSMOS_ENDPOINT`: Cosmos DB 端点 (格式: `https://your-cosmos-account.documents.azure.com:443/`)
   - `COSMOS_KEY`: Cosmos DB 主密钥
   - 数据库名称: `PromptEngineeringDB` (硬编码)
   - 容器名称: `answers` (硬编码)

### 获取环境变量

1. 联系项目管理员获取 Azure 服务配置信息
2. 在 Azure 门户中创建相应的服务
3. 将配置信息添加到 `.env` 文件中

## 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查找占用端口的进程
   netstat -ano | findstr :3000
   netstat -ano | findstr :8000
   
   # 终止进程
   taskkill /PID <进程ID> /F
   ```

2. **依赖安装失败**
   ```bash
   # 清除缓存重新安装
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

3. **Python 虚拟环境问题**
   ```bash
   # 重新创建虚拟环境
   deactivate
   rm -rf venv
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   pip install -r requirements.txt
   ```

4. **CORS 错误**
   - 确保前端运行在 `http://localhost:3000`
   - 确保后端运行在 `http://127.0.0.1:8000`
   - 检查后端 CORS 配置

5. **Azure OpenAI 凭据错误**
   ```
   openai.OpenAIError: Missing credentials. Please pass one of `api_key`, `azure_ad_token`, `azure_ad_token_provider`, or the `AZURE_OPENAI_API_KEY` or `AZURE_OPENAI_AD_TOKEN` environment variables.
   ```
   **解决方案**:
   - 确保在 `backend/Fastapi/.env` 文件中正确设置了 Azure OpenAI 凭据
   - 检查环境变量名称是否正确（注意大小写）
   - 确保 `.env` 文件在正确的目录中

6. **Cosmos DB 客户端初始化失败**
   ```
   ERROR:root:Failed to initialize Cosmos DB client: Unrecognized credential type
   ```
   **解决方案**:
   - 检查 `backend/Fastapi/.env` 文件中的 Cosmos DB 配置
   - 确保使用了正确的环境变量名称（注意代码中使用的是 `COSMOS_ENDPOINT` 和 `COSMOS_KEY`）
   - 验证 Azure Cosmos DB 的访问密钥是否正确

7. **环境变量配置问题**
   **正确的 `.env` 文件格式**:
   ```env
   # Azure OpenAI 配置
   AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
   AZURE_OPENAI_DEPLOYMENT=your-deployment-name
   
   # Azure Cosmos DB 配置 (注意变量名)
   COSMOS_ENDPOINT=https://your-cosmos-account.documents.azure.com:443/
   COSMOS_KEY=your_cosmos_db_master_key_here
   ```

### 日志查看

- **前端日志**: 在浏览器开发者工具中查看
- **后端日志**: 在终端中查看启动信息

## 部署说明

### 生产环境部署

1. **前端部署**
   ```bash
   npm run build
   npm start
   ```

2. **后端部署**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

## 快速检查清单

在启动项目前，请确保：

- [ ] Node.js 已安装 (版本 18.0.0+)
- [ ] Python 已安装 (版本 3.10+)
- [ ] 项目已克隆到本地
- [ ] 后端 `.env` 文件已正确配置
- [ ] 端口 3000 和 8000 未被占用

## 联系信息

如有问题，请联系项目维护者或查看项目文档。

---

**注意**: 首次启动时，请确保所有环境变量都已正确配置，否则某些功能可能无法正常工作。

## 常见错误解决

### 如果您遇到 "Missing credentials" 错误：

1. 确保在 `backend/Fastapi/.env` 文件中设置了正确的 Azure OpenAI 凭据
2. 检查环境变量名称是否正确（注意大小写）
3. 确保 `.env` 文件在正确的目录中

### 如果您遇到 "Failed to initialize Cosmos DB client" 错误：

1. 检查 `backend/Fastapi/.env` 文件中的 Cosmos DB 配置
2. 确保使用了正确的环境变量名称（`COSMOS_ENDPOINT` 和 `COSMOS_KEY`）
3. 验证 Azure Cosmos DB 的访问密钥是否正确 