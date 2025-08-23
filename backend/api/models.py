from pydantic import BaseModel, ConfigDict
from typing import Dict, Any

class AssessmentData(BaseModel):
    serviceOffering: Dict[str, Any]
    model_config = ConfigDict(extra='allow')  # 允许其它任意字段

class LLMAdviceRequest(BaseModel):
    userId: str
    assessmentData: AssessmentData

class SaveReportResponse(BaseModel):
    status: str
    message: str
    timestamp: str

class LLMAdviceResponse(BaseModel):
    advice: str
    timestamp: str
