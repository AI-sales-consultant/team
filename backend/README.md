
# 后端应用 (Backend)

基于FastAPI和Azure OpenAI的企业评估系统后端API服务。

## 🚀 快速开始

### 安装依赖
```bash
pip install -r requirements.txt
```

### 启动服务
```bash
python main.py
```

服务将在 http://localhost:8000 启动

## 📋 技术栈

- **框架**: FastAPI
- **语言**: Python 3.8+
- **AI服务**: Azure OpenAI
- **数据库**: Azure Cosmos DB (可选)
- **服务器**: Uvicorn
- **数据验证**: Pydantic

## 📁 详细项目结构

```
backend/
├── 📁 api/                  # API模块
│   ├── __init__.py          # 模块初始化
│   ├── api.py               # API路由定义
│   ├── cosmos_retriever.py  # Cosmos DB检索器
│   ├── models.py            # 数据模型 (Pydantic)
│   ├── prompts.py           # LLM提示模板
│   └── score_rule.csv       # 权重规则文件
│
├── 📁 retrieval/            # 数据检索模块
│   ├── answers.jsonl       # 答案数据文件
│   ├── cosmos_retriever.py # Cosmos DB检索器
│   ├── data_load.py        # 数据加载器
│   ├── prepocess_to_json.py # 数据预处理脚本
│   ├── readme-EN.txt       # 检索模块说明文档
│   └── 📁 retrieval_test/  # 检索测试
│       ├── comprehensive_test.py # 综合测试
│       ├── error_test.py         # 错误测试
│       └── TEST_README.txt       # 测试说明
│
├── 📁 tests/                # 测试文件
│   ├── conftest.py          # 测试配置
│   ├── README.md           # 测试说明文档
│   ├── requirements-test.txt # 测试依赖
│   ├── run_tests.py         # 测试运行器
│   ├── test_api_endpoints.py # API端点测试
│   ├── test_integration.py # 集成测试
│   ├── test_llm_advice.py  # LLM建议测试
│   └── test_utils.py       # 工具函数测试
│
├── main.py                  # 主应用文件
├── requirements.txt        # Python依赖
├── README.md               # 后端文档
└── env.example             # 环境变量示例
```

## 🔧 环境配置

在 `backend` 目录下创建 `.env` 文件：

```env
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint_here
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_DEPLOYMENT=your_deployment_name_here

# Cosmos DB Configuration (可选)
COSMOS_ENDPOINT=your_cosmos_endpoint_here
COSMOS_KEY=your_cosmos_key_here

# Server Configuration
PORT=8000
FRONTEND_ORIGIN=http://localhost:3000
```

## 🔌 API接口

### POST `/api/llm-advice`
生成LLM驱动的商业建议

**请求体**:
```json
{
  "userId": "user@example.com",
  "assessmentData": {
    "serviceOffering": {
      "industry": {"text": "Technology"},
      "business-challenge": {"text": "Customer acquisition"},
      "service-type": {
        "question": "How would you describe what you offer?",
        "anwser": "Service",
        "anwserselete": "a"
      }
    },
    "base-camp": {
      "target-niche": {
        "question": "Do you have a clearly defined target niche?",
        "score": 1
      }
    }
  }
}
```

**响应**:
```json
{
  "advice": "Based on your assessment results, here are your business recommendations:\n\n=== Phase 1 (Profitable) ===\n\n【Go to Market】\n- Do you have a clearly defined target niche?\n  For technology companies focusing on customer acquisition challenges, we recommend...",
  "timestamp": "2025-08-31T20:42:59.048252"
}
```

### POST `/api/save-user-report`
保存用户评估报告

### GET `/healthz`
健康检查端点

## 🧠 LLM建议系统

### 工作流程
1. **数据预处理**: 解析前端评估数据 (`main.py`)
2. **分数计算**: 应用权重规则调整分数 (`score_rule.csv`)
3. **分类**: 根据分数将问题分为三类
4. **检索**: 从数据库获取标准建议 (`cosmos_retriever.py`)
5. **生成**: 使用Azure OpenAI生成个性化建议 (`prompts.py`)
6. **组装**: 按阶段和类别组织建议

### 权重规则
系统使用 `api/score_rule.csv` 文件定义权重规则：
- 根据Service Offering的回答动态调整问题权重
- 每个满足的规则增加25%权重
- 支持复杂的条件组合

### 分类系统
- **Start_Doing** (分数 < -1): 需要开始做的
- **Do_More** (-1 ≤ 分数 ≤ 1): 需要做更多的  
- **Keep_Doing** (分数 > 1): 需要继续做的

## 🗄️ 数据库集成

### Azure Cosmos DB
- **数据库**: PromptEngineeringDB
- **容器**: answers
- **用途**: 存储标准建议模板

### 检索逻辑
```python
def get_answer_text(question_id: str, category: str) -> Optional[str]:
    """
    根据问题ID和分类从数据库检索标准建议
    """
```

### 数据文件
- `retrieval/answers.jsonl`: 答案数据
- `api/score_rule.csv`: 权重规则

## 🧪 测试

### 运行测试
```bash
# 运行所有测试
python -m pytest tests/

# 运行特定测试文件
python -m pytest tests/test_api_endpoints.py

# 运行性能测试
python -m pytest tests/test_perf_smoke.py

# 运行检索测试
python -m pytest retrieval/retrieval_test/
```

### 测试覆盖
- API端点测试 (`test_api_endpoints.py`)
- 分数计算逻辑测试 (`test_utils.py`)
- LLM建议生成测试 (`test_llm_advice.py`)
- 错误处理测试 (`test_integration.py`)

### 测试配置
- `conftest.py`: 测试配置和fixture
- `requirements-test.txt`: 测试专用依赖

## 🔍 故障排除

### 常见问题

1. **Azure OpenAI配置错误**
   ```
   ValueError: AZURE_OPENAI_ENDPOINT environment variable is required
   ```
   **解决方案**: 检查 `.env` 文件中的环境变量配置

2. **Cosmos DB连接失败**
   ```
   Failed to initialize Cosmos DB client
   ```
   **解决方案**: 检查Cosmos DB配置或使用可选模式

3. **CORS错误**
   ```
   CORS policy: No 'Access-Control-Allow-Origin' header
   ```
   **解决方案**: 检查 `FRONTEND_ORIGIN` 环境变量

4. **端口冲突**
   ```
   OSError: [Errno 98] Address already in use
   ```
   **解决方案**: 更改端口或终止占用进程

5. **依赖安装失败**
   ```
   pip install -r requirements.txt
   ```

### 调试模式

启动时添加详细日志：
```bash
python main.py --debug
```

## 📊 性能优化

### 异步处理
- 使用 `asyncio.gather()` 并发处理多个LLM请求
- 异步数据库查询
- 非阻塞API响应

### 缓存策略
- 客户端连接复用
- 环境变量懒加载
- 数据库连接池

### 数据检索优化
- 参数化查询防止SQL注入
- 连接池管理
- 错误重试机制

## 🔒 安全考虑

### 输入验证
- 使用Pydantic模型验证请求数据 (`models.py`)
- SQL注入防护 (`cosmos_retriever.py`)
- 参数化查询

### 错误处理
- 优雅的错误响应
- 敏感信息过滤
- 详细的错误日志

### 环境变量管理
- 敏感信息不硬编码
- 环境变量验证
- 配置分离

## 📈 监控和日志

### 日志级别
- INFO: 正常操作日志
- WARNING: 警告信息
- ERROR: 错误信息

### 健康检查
- `/healthz` 端点
- 服务状态监控
- 依赖服务检查

### 性能监控
- API响应时间
- 数据库查询性能
- 内存使用情况

## 🚀 部署

### 开发环境
```bash
python main.py
```

### 生产环境
```bash
# 使用Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker

# 使用Uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Docker部署
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```

## 📝 开发指南

### 添加新API端点
```python
@app.post("/api/new-endpoint")
async def new_endpoint(data: NewModel):
    # 实现逻辑
    return {"status": "success"}
```

### 修改LLM提示
编辑 `api/prompts.py` 文件中的提示模板：
- `SYSTEM_PROMPT_TEMPLATE`: 系统提示模板
- `USER_PROMPT_TEMPLATE`: 用户提示模板

### 更新数据模型
在 `api/models.py` 中定义新的Pydantic模型：
```python
class NewModel(BaseModel):
    field1: str
    field2: int
```

### 添加新测试
```python
# tests/test_new_feature.py
def test_new_feature():
    # 测试逻辑
    assert True
```

## 🔧 工具和脚本

### 数据预处理
```bash
python retrieval/prepocess_to_json.py
```

### 数据加载
```bash
python retrieval/data_load.py
```

### 检索测试
```bash
python retrieval/retrieval_test/comprehensive_test.py
```

## 📊 数据流

### 请求处理流程
1. 接收前端请求 (`main.py`)
2. 验证数据格式 (`models.py`)
3. 处理业务逻辑 (`main.py`)
4. 调用LLM服务 (`prompts.py`)
5. 返回响应

### 数据存储
- 用户数据: 本地存储 (前端)
- 配置数据: `score_rule.csv`
- 标准建议: Cosmos DB
- 测试数据: `retrieval/answers.jsonl`

