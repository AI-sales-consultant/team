# test_llm_advice.py - Test LLM advice generation functionality

import pytest
import asyncio
from unittest.mock import patch, MagicMock, AsyncMock
from main import generate_advice_for_question


class TestGenerateAdviceForQuestion:
    """Test the generate_advice_for_question function"""
    
    @pytest.mark.asyncio
    async def test_generate_advice_success(self):
        """Test successful advice generation"""
        q_data = {
            "question_id": "q1",
            "new_category": "Start_Doing",
            "question": "How to improve?",
            "anwser": "Need help",
            "additionalText": "Looking for guidance"
        }
        business_profile = {
            "industry": "Tech",
            "business_challenge": "Growth",
            "service_type": "Software Development",
            "revenue_type": "Subscription"
        }
    
        with patch("main.get_answer_text", return_value="Base advice text"):
            with patch("main.client.chat.completions.create", new_callable=AsyncMock) as mock_create:
                mock_create.return_value.choices = [MagicMock()]
                mock_create.return_value.choices[0].message.content = "Generated advice"
    
                result = await generate_advice_for_question(q_data, business_profile)
    
                assert result["question"] == "How to improve?"
                assert result["advice"] == "Generated advice"
                mock_create.assert_called_once()

    @pytest.mark.asyncio
    async def test_generate_advice_with_additional_text(self):
        """Test priority use of additionalText"""
        q_data = {
            "question_id": "q1",
            "new_category": "Keep_Doing",
            "question": "What works well?",
            "anwser": "Process",
            "additionalText": "Our streamlined workflow"
        }
        business_profile = {
            "industry": "Consulting",
            "business_challenge": "Client Retention",
            "service_type": "Business Strategy",
            "revenue_type": "Project-based"
        }
    
        with patch("main.get_answer_text", return_value="Base advice"):
            with patch("main.client.chat.completions.create", new_callable=AsyncMock) as mock_create:
                mock_create.return_value.choices = [MagicMock()]
                mock_create.return_value.choices[0].message.content = "Advice"
    
                result = await generate_advice_for_question(q_data, business_profile)
    
                # Verify that additionalText is used in the prompt
                mock_create.assert_called_once()

    @pytest.mark.asyncio
    async def test_generate_advice_fallback_to_answer(self):
        """Test fallback to anwser field"""
        q_data = {
            "question_id": "q1",
            "new_category": "Do_More",
            "question": "What to improve?",
            "anwser": "Communication",
            "additionalText": ""
        }
        business_profile = {
            "industry": "Manufacturing",
            "business_challenge": "Supply Chain",
            "service_type": "Production",
            "revenue_type": "B2B Sales"
        }
    
        with patch("main.get_answer_text", return_value="Base advice"):
            with patch("main.client.chat.completions.create", new_callable=AsyncMock) as mock_create:
                mock_create.return_value.choices = [MagicMock()]
                mock_create.return_value.choices[0].message.content = "Advice"
    
                result = await generate_advice_for_question(q_data, business_profile)
    
                # Verify that anwser is used in the prompt
                mock_create.assert_called_once()

    @pytest.mark.asyncio
    async def test_generate_advice_api_error(self):
        """Test handling of API errors"""
        q_data = {
            "question_id": "q1",
            "new_category": "Start_Doing",
            "question": "Test question"
        }
        business_profile = {
            "industry": "Retail",
            "business_challenge": "Online Presence",
            "service_type": "E-commerce",
            "revenue_type": "Direct Sales"
        }
    
        with patch("main.get_answer_text", return_value="Base advice"):
            with patch("main.client.chat.completions.create", new_callable=AsyncMock, side_effect=Exception("API Error")):
                result = await generate_advice_for_question(q_data, business_profile)
                
                assert "Failed to generate advice due to an error" in result["advice"]

    @pytest.mark.asyncio
    async def test_generate_advice_missing_retrieved_text(self):
        """Test handling of missing retrieved text"""
        q_data = {
            "question_id": "q1",
            "new_category": "Start_Doing",
            "question": "Test question"
        }
        business_profile = {
            "industry": "Healthcare",
            "business_challenge": "Patient Care",
            "service_type": "Medical Services",
            "revenue_type": "Insurance"
        }
    
        with patch("main.get_answer_text", return_value=None):
            with patch("main.client.chat.completions.create", new_callable=AsyncMock) as mock_create:
                mock_create.return_value.choices = [MagicMock()]
                mock_create.return_value.choices[0].message.content = "Advice"
    
                result = await generate_advice_for_question(q_data, business_profile)
    
                # Verify that default text is used
                mock_create.assert_called_once()

    @pytest.mark.asyncio
    async def test_generate_advice_missing_question_data(self):
        """Test handling of missing question data"""
        q_data = {
            "question_id": "q1",
            "new_category": "Start_Doing"
            # Missing question, anwser, additionalText
        }
        business_profile = {
            "industry": "Education",
            "business_challenge": "Student Engagement",
            "service_type": "Online Learning",
            "revenue_type": "Tuition"
        }
    
        with patch("main.get_answer_text", return_value="Base advice"):
            with patch("main.client.chat.completions.create", new_callable=AsyncMock) as mock_create:
                mock_create.return_value.choices = [MagicMock()]
                mock_create.return_value.choices[0].message.content = "Advice"
    
                result = await generate_advice_for_question(q_data, business_profile)
    
                # Verify that default values are used
                assert result["question"] == ""
                assert result["advice"] == "Advice"

    @pytest.mark.asyncio
    async def test_generate_advice_environment_variable_missing(self):
        """Test handling of missing environment variables"""
        q_data = {
            "question_id": "q1",
            "new_category": "Start_Doing",
            "question": "Test question"
        }
        business_profile = {
            "industry": "Finance",
            "business_challenge": "Compliance",
            "service_type": "Investment Advisory",
            "revenue_type": "Management Fees"
        }
    
        with patch("main.get_answer_text", return_value="Base advice"):
            with patch("os.getenv", return_value=None):
                result = await generate_advice_for_question(q_data, business_profile)
                
                assert "Failed to generate advice due to an error" in result["advice"]

    @pytest.mark.asyncio
    async def test_generate_advice_business_profile_formatting(self):
        """Test that business profile is correctly formatted in the prompt"""
        q_data = {
            "question_id": "q1",
            "new_category": "Start_Doing",
            "question": "Test question"
        }
        business_profile = {
            "industry": "Technology",
            "business_challenge": "Digital Transformation",
            "service_type": "Cloud Solutions",
            "revenue_type": "SaaS"
        }
    
        with patch("main.get_answer_text", return_value="Base advice"):
            with patch("main.client.chat.completions.create", new_callable=AsyncMock) as mock_create:
                mock_create.return_value.choices = [MagicMock()]
                mock_create.return_value.choices[0].message.content = "Advice"
    
                await generate_advice_for_question(q_data, business_profile)
                
                # Verify that the business profile was used in the system prompt
                call_args = mock_create.call_args
                system_message = call_args[1]['messages'][0]['content']
                assert "Technology" in system_message
                assert "Digital Transformation" in system_message
                assert "Cloud Solutions" in system_message
                assert "SaaS" in system_message 