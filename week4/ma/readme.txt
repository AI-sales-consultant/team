
1. 模块概述

本模块 cosmos_retriever.py 提供一个独立的函数 get_answer_text，用于从 Azure Cosmos DB 的 answers 容器中检索预定义的泛化回答文本。

功能: 根据 question_id 和 category 精确匹配并返回唯一的 text 字段。

技术栈: Python, azure-cosmos SDK。

2. 先决条件

后端服务环境需要满足以下条件：

Python 3.8+ 环境。

能够访问公网 Azure Cosmos DB 服务。

已获取 Cosmos DB 账户的 Endpoint URI 和 Primary Key。

3. 安装与配置

3.1. 依赖安装

将以下依赖项添加到你的 requirements.txt 文件中，或通过 pip 直接安装：
azure-cosmos
python-dotenv


3.2. 环境变量配置

本模块通过环境变量加载数据库凭据。请在你的后端应用运行环境中配置以下两个变量：

COSMOS_ENDPOINT: 你的 Azure Cosmos DB 账户的 URI。
COSMOS_KEY: 你的 Azure Cosmos DB 账户的主密钥。

示例 .env 文件:
COSMOS_ENDPOINT="https://<你的账户名>.documents.azure.com:443/"
COSMOS_KEY="<你的主密钥>"

模块在加载时会自动初始化一个全局的数据库客户端，以复用连接，提高性能。

4. 接口调用说明

4.1. 导入函数

在你的后端代码中，从模块导入核心函数：
from cosmos_retriever import get_answer_text


4.2. 函数签名
def get_answer_text(question_id: str, category: str) -> str | None:


参数:
question_id (str): 问题的业务ID，例如 "question_00"。对应数据源中的 question_id 字段。
category (str): 回答的类别，例如 "Start_Doing"。对应数据源中的 category 字段。

返回值 (str | None):
成功: 如果找到完全匹配的记录，返回其 text 字段的内容 (一个字符串)。
失败或未找到: 如果没有找到匹配的记录，或在查询过程中发生数据库连接等错误，返回 None。

4.3. 调用示例

以下是如何在你的 FastAPI 端点或其他业务逻辑中调用此函数：

# 这是一个在 FastAPI 中调用的简化示例

from fastapi import FastAPI, HTTPException
from cosmos_retriever import get_answer_text
# 假设你的请求体模型
from pydantic import BaseModel

class EnhanceRequest(BaseModel):
    question_id: str
    category: str
    # ... 其他字段

app = FastAPI()

@app.post("/enhance-answer")
async def enhance_answer(request: EnhanceRequest):
    # 1. 从请求中获取参数
    q_id = request.question_id
    cat = request.category

    # 2. 调用数据访问函数
    retrieved_text = get_answer_text(question_id=q_id, category=cat)

    # 3. 处理返回结果
    if retrieved_text is None:
        # 如果未找到，可以根据业务需求返回 404 或其他错误
        # 日志中会记录详细原因（未找到 或 数据库错误）
        raise HTTPException(
            status_code=404, 
            detail=f"Answer not found for question_id='{q_id}' and category='{cat}'"
        )

    # 4. 使用获取到的文本进行后续处理（例如构建提示）
    # ...
    # prompt = f"Context: {retrieved_text}\nUser Situation: ..."
    # ...

    return {"retrieved_text": retrieved_text, "status": "success"}

5. 数据约定

本模块依赖于 Cosmos DB 中特定的数据结构。

数据库: PromptEngineeringDB
容器: answers
分区键: /question_id

文档结构约定:
{
    "question_id": "question_00", // 查询字段
    "category": "Start_Doing",    // 查询字段
    "text": "...",                 // 返回的字段
    "id": "...",                  // Cosmos DB 内部唯一主键
    // ... 其他元数据字段
}


6. 错误处理

本模块的错误处理逻辑很简单：
任何异常（数据库连接失败、权限问题、查询超时等）都会被捕获。
异常的详细信息会被 logging 模块记录到标准错误输出。
在任何异常或未找到数据的情况下，函数统一返回 None。
调用方只需判断返回值是否为 None 即可确定操作是否成功获取数据。

