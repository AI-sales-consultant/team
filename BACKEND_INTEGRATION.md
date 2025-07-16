# 后端集成文档

## 概述
前端已完成JSON生成和API调用逻辑，等待后端实现对应的API接口。

## API接口规范

### 1. 保存用户报告 API
```
POST http://127.0.0.1:8000/api/save-user-report
```

**请求头：**
```
Content-Type: application/json
```

**请求体格式：**
```json
{
  "serviceOffering": {
    "industry": { "text": "Technology" },
    "business-challenge": { "text": "Scaling operations" },
    "service-type": {
      "question": "How would you describe what you offer?",
      "question_name": "R1",
      "anwser": "Service",
      "anwserselete": "a",
      "additionalText": ""
    }
    // ... 更多Service Offering题目 (R1-R16)
  },
  "Base camp for success (go to market GTM)": {
    "target-niche": {
      "question_name": "GTM1",
      "category": "go to market",
      "catmapping": "Profitable",
      "question": "We know exactly which niche sector(s), and in which geographies, to target",
      "anwser": "Strongly Agree",
      "score": 2
    }
    // ... 更多题目 (GTM2-GTM10)
  },
  "Tracking the climb (Performance Metrics PM)": {
    "commercial-performance": {
      "question_name": "PM1",
      "category": "performance metrics",
      "question": "We have a good grasp of our current commercial performance including revenue, gross profit, average deal value",
      "anwser": "Strongly Disagree",
      "score": -2
    }
    // ... 更多题目 (PM2-PM6)
  },
  "Scaling essentials (Commercial Essentials CE)": {
    // 类似结构 (CE1-CE4)
  },
  "Streamlining the climb (Optimal Processes OP)": {
    // 类似结构 (OP1-OP4)
  },
  "Assembling the team (People, Structure & Culture PSC)": {
    // 类似结构 (PSC1-PSC5)
  },
  "Toolbox for success (Systems & Tools ST)": {
    // 类似结构 (ST1-ST5)
  }
}
```

**期望响应：**
```json
{
  "status": "success",
  "message": "Report saved successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 2. LLM建议 API
```
POST /api/llm-advice
```

**请求体：**
```json
{
  "userId": "user@example.com",
  "assessmentData": {
    // 完整的评估数据（同上）
  }
}
```

**期望响应：**
```json
{
  "advice": "Based on your assessment results, I provide the following business recommendations:\n\n🎯 **Key Findings**\nYour business performs well...",
  "timestamp": "2024-01-15T10:35:00Z",
  "confidence_score": 0.85
}
```

## 数据结构详解

### Service Offering 部分
- **题目编号**：R1, R2, R3... R16
- **选项字母**：a, b, c... (对应选项顺序)
- **文本题**：industry, business-challenge
- **选择题**：其他14题

### 其他问卷部分
- **题目编号**：使用各自的前缀+递增编号
- **分数映射**：
  - Strongly Disagree: -2
  - Disagree: -1
  - N/A: 0
  - Agree: 1
  - Strongly Agree: 2
- **能力分类映射**：
  - Profitable: 盈利性能力
  - Repeatable: 可重复性能力
  - Scalable: 可扩展性能力

### 分类信息和题目编号
- **Go To Market (GTM)**: GTM1, GTM2, GTM3... GTM10
- **Performance Metrics (PM)**: PM1, PM2, PM3... PM6
- **Commercial Essentials (CE)**: CE1, CE2, CE3, CE4
- **Optimal Processes (OP)**: OP1, OP2, OP3, OP4
- **People Structure Culture (PSC)**: PSC1, PSC2, PSC3, PSC4, PSC5
- **Systems Tools (ST)**: ST1, ST2, ST3, ST4, ST5

## 前端调用逻辑

### 触发时机
1. 用户完成所有评估步骤
2. 生成标准化JSON格式
3. 自动下载JSON文件
4. POST到后端API
5. 设置完成标记
6. 跳转到dashboard

### 错误处理
- 网络错误不影响用户体验
- 控制台显示详细日志
- 继续执行后续流程

## 测试方法

### 1. 使用测试页面
访问：`http://localhost:3000/test-backend.html`

### 2. 浏览器开发者工具
- 按F12打开
- 查看Console标签页
- 完成评估后观察日志

### 3. 预期日志
```
🚀 开始发送数据到后端...
📤 发送的数据: {完整的JSON数据}
📥 后端响应状态: 200
✅ 数据成功发送到后端
```

## 技术细节

### JSON生成逻辑
- 位置：`components/assessment-flow.tsx` 第165行
- 函数：`generateNewJsonFormat()`
- 处理：标准化所有问卷数据
- **重要更新**：
  - 字段名从 `question_id` 改为 `question_name`
  - 新增 `catmapping` 字段，显示三大能力分类
  - Service Offering: R1-R16
  - GTM: GTM1-GTM10
  - PM: PM1-PM6
  - CE: CE1-CE4
  - OP: OP1-OP4
  - PSC: PSC1-PSC5
  - ST: ST1-ST5

### API调用逻辑
- 位置：`components/assessment-flow.tsx` 第383行
- 方法：`fetch()` POST请求
- 错误处理：try-catch包装

### 数据验证
- 只处理有答案的题目
- 跳过空答案或未选择的题目
- 确保必要字段存在

## 开发建议

### 1. 后端实现步骤
1. 创建FastAPI应用
2. 实现 `/api/save-user-report` 接口
3. 实现 `/api/llm-advice` 接口
4. 添加CORS支持
5. 添加数据验证

### 2. 示例FastAPI代码
```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any

app = FastAPI()

# 添加CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AssessmentData(BaseModel):
    serviceOffering: Dict[str, Any]
    # ... 其他字段

@app.post("/api/save-user-report")
async def save_user_report(data: AssessmentData):
    # 处理数据
    return {"status": "success", "message": "Report saved"}

@app.post("/api/llm-advice")
async def generate_llm_advice(data: Dict[str, Any]):
    # 调用LLM服务
    return {
        "advice": "Your personalized business advice...",
        "timestamp": "2024-01-15T10:35:00Z"
    }
```

### 3. 启动命令
```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## 完整JSON示例

```json
{
  "serviceOffering": {
    "industry": { "text": "Technology" },
    "business-challenge": { "text": "Scaling operations" },
    "service-type": {
      "question": "How would you describe what you offer?",
      "question_name": "R1",
      "anwser": "Service",
      "anwserselete": "a",
      "additionalText": ""
    },
    "opportunity-type": {
      "question": "How would you describe the opportunity you have?",
      "question_name": "R2",
      "anwser": "First mover",
      "anwserselete": "a",
      "additionalText": ""
    }
  },
  "Base camp for success (go to market GTM)": {
    "target-niche": {
      "question_name": "GTM1",
      "category": "go to market",
      "question": "We know exactly which niche sector(s), and in which geographies, to target",
      "anwser": "Strongly Agree",
      "score": 2
    },
    "pinpoint-clients": {
      "question_name": "GTM2",
      "category": "go to market",
      "question": "We could pinpoint specific clients right now who need our offering",
      "anwser": "Agree",
      "score": 1
    }
  },
  "Tracking the climb (Performance Metrics PM)": {
    "commercial-performance": {
      "question_name": "PM1",
      "category": "performance metrics",
      "question": "We have a good grasp of our current commercial performance including revenue, gross profit, average deal value",
      "anwser": "Strongly Disagree",
      "score": -2
    },
    "revenue-profit-targets": {
      "question_name": "PM2",
      "category": "performance metrics",
      "question": "Everyone, that needs to know, has clarity on what our revenue & profit targets are for this current financial year",
      "anwser": "Agree",
      "score": 1
    }
  },
  "Scaling essentials (Commercial Essentials CE)": {
    "objections-techniques": {
      "question_name": "CE1",
      "category": "commercial essentials",
      "question": "We know all of the objections prospects or clients may come up with, and have clear techniques to overcome them",
      "anwser": "Agree",
      "score": 1
    }
  },
  "Streamlining the climb (Optimal Processes OP)": {
    "outbound-sales-approach": {
      "question_name": "OP1",
      "category": "optimal processes",
      "question": "We have a proven approach to bringing new leads into this business via an outbound sales approach",
      "anwser": "N/A",
      "score": 0
    }
  },
  "Assembling the team (People, Structure & Culture PSC)": {
    "team-structure": {
      "question_name": "PSC1",
      "category": "people structure culture",
      "question": "We have the right team structure in place to support our growth ambitions",
      "anwser": "Strongly Agree",
      "score": 2
    }
  },
  "Toolbox for success (Systems & Tools ST)": {
    "central-shared-drive": {
      "question_name": "ST1",
      "category": "systems tools",
      "question": "Anyone involved in sales has access to a central shared drive, where they can easily access any information they might need",
      "anwser": "Strongly Agree",
      "score": 2
    }
  }
}
```

## 注意事项

1. **端口配置**：确保后端运行在 `127.0.0.1:8000`
2. **CORS设置**：允许前端域名访问
3. **数据验证**：验证必要字段存在
4. **错误处理**：返回适当的HTTP状态码
5. **日志记录**：记录API调用和错误信息
6. **字段名称**：注意使用 `question_name` 而不是 `question_id`

## 联系信息
如有问题，请查看前端控制台日志或使用测试页面进行调试。 