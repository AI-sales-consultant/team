# conftest.py - Test configuration and shared fixtures

import pytest
from unittest.mock import MagicMock
from typing import Dict, Any


@pytest.fixture
def sample_service_offering():
    """Sample service offering data"""
    return {
        "industry": {"text": "Technology"},
        "business-challenge": {"text": "Scaling"},
        "service-type": {
            "question": "What do you offer?",
            "anwser": "Software",
            "additionalText": "SaaS platform"
        },
        "revenue-type": {
            "question": "What revenue do you mainly have?",
            "anwser": "Subscription",
            "additionalText": "Monthly billing"
        }
    }


@pytest.fixture
def sample_assessment_data():
    """Sample assessment data"""
    return {
        "serviceOffering": {
            "industry": {"text": "Technology"},
            "field1": {"question_name": "R1", "anwserselete": "A"}
        },
        "Phase 1 (Profitable)": {
            "q1": {
                "score": 0.5,
                "question": "How to improve?",
                "catmapping": "Profitable",
                "category": "Marketing"
            }
        }
    }


@pytest.fixture
def sample_score_rules():
    """Sample score rules"""
    return {
        "question_00": ["R1-A or B"],
        "question_01": ["R2-C or D"]
    }


@pytest.fixture
def sample_business_profile():
    """Sample business profile"""
    return {
        "industry": "Technology",
        "business_challenge": "Scaling",
        "service_type": "Software: SaaS platform",
        "revenue_type": "Subscription: Monthly billing"
    }


@pytest.fixture
def sample_question_data():
    """Sample question data"""
    return {
        "question_id": "question_00",
        "new_category": "Start_Doing",
        "question": "How to improve marketing?",
        "catmapping": "Profitable",
        "category": "Marketing",
        "score": 0.5,
        "anwser": "Need help",
        "additionalText": "Looking for guidance"
    }


@pytest.fixture
def mock_openai_client():
    """Mock OpenAI client"""
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = "Generated advice"
    mock_client.chat.completions.create.return_value = mock_response
    return mock_client


@pytest.fixture
def mock_cosmos_retriever():
    """Mock Cosmos retriever"""
    mock_retriever = MagicMock()
    mock_retriever.get_answer_text.return_value = "Standard advice text"
    return mock_retriever


@pytest.fixture
def sample_csv_data():
    """Sample CSV data"""
    return """question_id,rule1,rule2,rule3
question_00,R1-A or B,R2-C or D,
question_01,R3-E or F,R4-G or H,
question_02,R5-I or J,,R6-K or L"""


@pytest.fixture
def sample_weighting_rules():
    """Sample weighting rules"""
    return [
        "R1-A or B",
        "R2-C or D",
        "R3-E or F"
    ]


@pytest.fixture
def sample_service_offering_for_weighting():
    """Service offering data for weighting tests"""
    return {
        "field1": {
            "question_name": "R1",
            "anwserselete": "A"
        },
        "field2": {
            "question_name": "R2",
            "anwserselete": "C"
        },
        "field3": {
            "question_name": "R3",
            "anwserselete": "E"
        }
    }


@pytest.fixture
def mock_environment_variables(monkeypatch):
    """Mock environment variables"""
    monkeypatch.setenv("AZURE_OPENAI_API_KEY", "test-api-key")
    monkeypatch.setenv("AZURE_OPENAI_ENDPOINT", "https://test-endpoint.openai.azure.com/")
    monkeypatch.setenv("AZURE_OPENAI_DEPLOYMENT", "test-deployment")
    monkeypatch.setenv("FRONTEND_ORIGIN", "http://localhost:3000")
    monkeypatch.setenv("PORT", "8000")


@pytest.fixture
def mock_file_operations(monkeypatch):
    """Mock file operations"""
    def mock_open(file_path, mode='r', **kwargs):
        if 'score_rule.csv' in file_path:
            mock_file = MagicMock()
            mock_file.__enter__.return_value = [
                "question_id,rule1,rule2",
                "question_00,R1-A or B,R2-C or D",
                "question_01,R3-E or F,R4-G or H"
            ]
            return mock_file
        else:
            raise FileNotFoundError(f"File not found: {file_path}")
    
    monkeypatch.setattr("builtins.open", mock_open)


@pytest.fixture
def sample_llm_response():
    """Sample LLM response"""
    return {
        "choices": [
            {
                "message": {
                    "content": "Based on your assessment, I recommend focusing on digital marketing strategies and improving customer communication processes."
                }
            }
        ]
    }


@pytest.fixture
def sample_advice_result():
    """Sample advice result"""
    return {
        "catmapping": "Profitable",
        "category": "Marketing",
        "question": "How to improve marketing?",
        "advice": "Focus on digital marketing strategies and improve customer communication processes."
    }


@pytest.fixture
def sample_phase_grouped_results():
    """Sample phase grouped results"""
    return {
        "Profitable": {
            "Marketing": [
                {
                    "catmapping": "Profitable",
                    "category": "Marketing",
                    "question": "How to improve marketing?",
                    "advice": "Focus on digital marketing"
                }
            ],
            "Sales": [
                {
                    "catmapping": "Profitable",
                    "category": "Sales",
                    "question": "How to increase sales?",
                    "advice": "Improve lead generation"
                }
            ]
        },
        "Repeatable": {
            "Operations": [
                {
                    "catmapping": "Repeatable",
                    "category": "Operations",
                    "question": "How to streamline processes?",
                    "advice": "Implement automation"
                }
            ]
        }
    } 