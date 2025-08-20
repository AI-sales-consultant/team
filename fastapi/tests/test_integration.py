# test_integration.py - Integration tests

import pytest
from unittest.mock import patch, MagicMock
from main import app
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock

client = TestClient(app)


class TestFullWorkflow:
    """Test complete LLM workflow"""
    
    @patch("main.load_score_rules")
    @patch("main.get_answer_text")
    @patch("main.client.chat.completions.create")
    def test_complete_llm_workflow(self, mock_llm, mock_get_answer, mock_load_rules):
        """Test complete LLM workflow"""
        # Mock score rules
        mock_load_rules.return_value = {
            "question_00": ["R1-A or B"],
            "question_01": ["R2-C or D"]
        }
        
        # Mock base advice text
        mock_get_answer.return_value = "Standard advice text"
        
        # Mock LLM response
        mock_llm.return_value.choices = [MagicMock()]
        mock_llm.return_value.choices[0].message.content = "Generated advice"
        
        # Test request data
        test_request = {
            "userId": "test_user",
            "assessmentData": {
                "serviceOffering": {
                    "industry": {"text": "Technology"},
                    "field1": {
                        "question_name": "R1",
                        "anwserselete": "A"
                    }
                },
                "Phase 1 (Profitable)": {
                    "q1": {
                        "score": 0.5,
                        "question": "How to improve?",
                        "catmapping": "Profitable",
                        "category": "Marketing"
                    },
                    "q2": {
                        "score": -0.5,
                        "question": "What to start?",
                        "catmapping": "Profitable",
                        "category": "Sales"
                    }
                }
            }
        }
        
        response = client.post("/api/llm-advice", json=test_request)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify advice content
        assert "Profitable" in data["advice"]
        assert "Marketing" in data["advice"]
        assert "Sales" in data["advice"]
        
        # Verify LLM was called 2 times (once for each question)
        assert mock_llm.call_count == 2
    
    @patch("main.load_score_rules")
    @patch("main.get_answer_text")
    @patch("main.client.chat.completions.create")
    def test_workflow_with_weighting_rules(self, mock_llm, mock_get_answer, mock_load_rules):
        """Test workflow with weighting rules"""
        # Mock score rules
        mock_load_rules.return_value = {
            "question_00": ["R1-A or B"],
            "question_01": ["R2-C or D"]
        }
        
        mock_get_answer.return_value = "Standard advice text"
        mock_llm.return_value.choices = [MagicMock()]
        mock_llm.return_value.choices[0].message.content = "Generated advice"
        
        test_request = {
            "userId": "test_user",
            "assessmentData": {
                "serviceOffering": {
                    "industry": {"text": "Technology"},
                    "field1": {
                        "question_name": "R1",
                        "anwserselete": "A"
                    },
                    "field2": {
                        "question_name": "R2",
                        "anwserselete": "C"
                    }
                },
                "Phase 1 (Profitable)": {
                    "q1": {
                        "score": 0.5,
                        "question": "Test question 1",
                        "catmapping": "Profitable",
                        "category": "Marketing"
                    },
                    "q2": {
                        "score": 0.8,
                        "question": "Test question 2",
                        "catmapping": "Profitable",
                        "category": "Sales"
                    }
                }
            }
        }
        
        response = client.post("/api/llm-advice", json=test_request)
        
        assert response.status_code == 200
        data = response.json()
        assert "advice" in data


class TestBusinessProfileExtraction:
    """Test business profile extraction integration"""
    
    def test_business_profile_integration(self):
        """Test business profile extraction integration in the entire workflow"""
        test_request = {
            "userId": "test_user",
            "assessmentData": {
                "serviceOffering": {
                    "industry": {"text": "Finance"},
                    "business-challenge": {"text": "Regulatory Compliance"},
                    "field1": {
                        "question": "what you offer",  # Match exact string from main.py
                        "anwser": "Consulting Services",
                        "additionalText": "Financial advisory and compliance consulting"
                    },
                    "field2": {
                        "question": "revenue do you mainly have",  # Match exact string from main.py
                        "anwser": "Project-based",
                        "additionalText": "Fixed-fee consulting projects"
                    }
                },
                "Phase 1 (Profitable)": {
                    "q1": {
                        "score": 0.5,
                        "question": "How to improve?",
                        "catmapping": "Profitable",
                        "category": "Operations"
                    }
                }
            }
        }
    
        with patch("main.load_score_rules", return_value={}):
            with patch("main.get_answer_text", return_value="Standard advice"):
                with patch("main.client.chat.completions.create", new_callable=AsyncMock) as mock_llm:
                    mock_llm.return_value.choices = [MagicMock()]
                    mock_llm.return_value.choices[0].message.content = "Generated advice"
    
                    response = client.post("/api/llm-advice", json=test_request)
    
                    assert response.status_code == 200
    
                    # Verify that LLM call contains business profile information
                    mock_llm.assert_called_once()
                    call_args = mock_llm.call_args
                    system_content = call_args[1]["messages"][0]["content"]
    
                    # Verify business profile is correctly passed
                    assert "Finance" in system_content
                    assert "Regulatory Compliance" in system_content
                    # Check for the combined service type (answer + additionalText)
                    assert "Consulting Services: Financial advisory and compliance consulting" in system_content
                    assert "Project-based: Fixed-fee consulting projects" in system_content


class TestScoringAndCategorization:
    """Test scoring and categorization integration"""
    
    @patch("main.load_score_rules")
    @patch("main.get_answer_text")
    @patch("main.client.chat.completions.create")
    def test_scoring_categorization_integration(self, mock_llm, mock_get_answer, mock_load_rules):
        """Test scoring and categorization integration in the entire workflow"""
        # Mock score rules
        mock_load_rules.return_value = {
            "question_00": ["R1-A or B"],
            "question_01": ["R2-C or D"]
        }
        
        mock_get_answer.return_value = "Standard advice text"
        mock_llm.return_value.choices = [MagicMock()]
        mock_llm.return_value.choices[0].message.content = "Generated advice"
        
        test_request = {
            "userId": "test_user",
            "assessmentData": {
                "serviceOffering": {
                    "field1": {
                        "question_name": "R1",
                        "anwserselete": "A"
                    },
                    "field2": {
                        "question_name": "R2",
                        "anwserselete": "C"
                    }
                },
                "Phase 1 (Profitable)": {
                    "q1": {
                        "score": 0.5,
                        "question": "Question 1",
                        "catmapping": "Profitable",
                        "category": "Marketing"
                    },
                    "q2": {
                        "score": -0.8,
                        "question": "Question 2",
                        "catmapping": "Profitable",
                        "category": "Sales"
                    }
                }
            }
        }
        
        response = client.post("/api/llm-advice", json=test_request)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify advice text contains categorization information
        assert "Profitable" in data["advice"]
        assert "Marketing" in data["advice"]
        assert "Sales" in data["advice"]


class TestConcurrentProcessing:
    """Test concurrent processing"""
    
    @patch("main.load_score_rules")
    @patch("main.get_answer_text")
    @patch("main.client.chat.completions.create")
    def test_concurrent_llm_calls(self, mock_llm, mock_get_answer, mock_load_rules):
        """Test concurrent LLM calls"""
        mock_load_rules.return_value = {}
        mock_get_answer.return_value = "Standard advice text"
        mock_llm.return_value.choices = [MagicMock()]
        mock_llm.return_value.choices[0].message.content = "Generated advice"
        
        test_request = {
            "userId": "test_user",
            "assessmentData": {
                "serviceOffering": {"industry": {"text": "Tech"}},
                "Phase 1 (Profitable)": {
                    "q1": {
                        "score": 0.5,
                        "question": "Question 1",
                        "catmapping": "Profitable",
                        "category": "Marketing"
                    },
                    "q2": {
                        "score": 0.3,
                        "question": "Question 2",
                        "catmapping": "Profitable",
                        "category": "Sales"
                    },
                    "q3": {
                        "score": -0.2,
                        "question": "Question 3",
                        "catmapping": "Profitable",
                        "category": "Operations"
                    }
                }
            }
        }
        
        response = client.post("/api/llm-advice", json=test_request)
        
        assert response.status_code == 200
        
        # Verify LLM was called 3 times (once for each question)
        assert mock_llm.call_count == 3


class TestErrorHandlingIntegration:
    """Test error handling integration"""
    
    @patch("main.load_score_rules")
    def test_missing_score_rules_file(self, mock_load_rules):
        """Test missing score rules file scenario"""
        mock_load_rules.side_effect = FileNotFoundError("Score rules file not found")
    
        test_request = {
            "userId": "test_user",
            "assessmentData": {
                "serviceOffering": {"industry": {"text": "Tech"}},
                "Phase 1 (Profitable)": {
                    "q1": {
                        "score": 0.5,
                        "question": "Test question",
                        "catmapping": "Profitable",
                        "category": "Marketing"
                    }
                }
            }
        }
    
        # This should raise an exception since load_score_rules fails
        with pytest.raises(FileNotFoundError):
            response = client.post("/api/llm-advice", json=test_request)

    @patch("main.load_score_rules")
    @patch("main.extract_business_profile")
    @patch("main.asyncio.gather", new_callable=AsyncMock)
    def test_llm_service_unavailable(self, mock_gather, mock_extract, mock_load_rules):
        """Test LLM service unavailable scenario"""
        mock_load_rules.return_value = {}
        mock_extract.return_value = {"industry": "Tech"}
        mock_gather.side_effect = Exception("LLM service unavailable")
    
        test_request = {
            "userId": "test_user",
            "assessmentData": {
                "serviceOffering": {"industry": {"text": "Tech"}},
                "Phase 1 (Profitable)": {
                    "q1": {
                        "score": 0.5,
                        "question": "Test question",
                        "catmapping": "Profitable",
                        "category": "Marketing"
                    }
                }
            }
        }
    
        # This should raise an exception since asyncio.gather fails
        with pytest.raises(Exception, match="LLM service unavailable"):
            response = client.post("/api/llm-advice", json=test_request) 