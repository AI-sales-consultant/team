from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import json
from datetime import datetime

app = FastAPI(title="Assessment Backend API")

# 添加CORS支持
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AssessmentData(BaseModel):
    serviceOffering: Dict[str, Any]
    # 其他字段会在运行时动态处理

@app.get("/")
async def root():
    return {"message": "Assessment Backend API is running!"}

@app.post("/api/save-user-report")
async def save_user_report(data: Dict[str, Any]):
    """保存用户评估报告"""
    try:
        # 记录接收到的数据
        print(f"📥 接收到评估数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
        
        # 这里可以添加数据保存逻辑
        # 例如保存到数据库或文件
        
        return {
            "status": "success",
            "message": "Report saved successfully",
            "timestamp": datetime.now().isoformat(),
            "data_received": True
        }
    except Exception as e:
        print(f"❌ 保存报告时出错: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/llm-advice")
async def generate_llm_advice(data: Dict[str, Any]):
    """生成LLM建议"""
    try:
        user_id = data.get("userId", "unknown")
        assessment_data = data.get("assessmentData", {})
        
        print(f"🤖 为用户 {user_id} 生成LLM建议")
        print(f"📊 评估数据: {json.dumps(assessment_data, indent=2, ensure_ascii=False)}")
        
        # 这里可以调用真实的LLM服务
        # 目前返回模拟建议
        mock_advice = f"""Based on your assessment results, I provide the following business recommendations:

🎯 **Key Findings**
Your business performs well across multiple dimensions, particularly in customer service and team collaboration. Here are targeted improvement suggestions:

📈 **Priority Improvement Areas**
1. **Process Optimization**: Recommend implementing more systematic project management processes
2. **Technology Upgrade**: Consider introducing automation tools to improve efficiency
3. **Market Expansion**: Explore new market opportunities based on existing advantages

💡 **Specific Action Recommendations**
• Establish weekly team review meeting mechanisms
• Invest in customer relationship management systems
• Develop quarterly goal tracking systems

🚀 **Expected Outcomes**
After implementing these recommendations, you can expect to see significant efficiency improvements and customer satisfaction enhancements within 3-6 months.

*This advice is generated based on your assessment data. Regular re-assessment is recommended to track progress.*"""

        return {
            "advice": mock_advice,
            "timestamp": datetime.now().isoformat(),
            "confidence_score": 0.85,
            "user_id": user_id
        }
    except Exception as e:
        print(f"❌ 生成LLM建议时出错: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)