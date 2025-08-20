# test_utils.py - Test utility functions

import pytest
import tempfile
import os
from unittest.mock import patch, mock_open
from main import load_score_rules, check_weighting, extract_business_profile


class TestLoadScoreRules:
    """Test load_score_rules function"""
    
    def test_load_score_rules_success(self):
        """Test successful loading of score rules"""
        mock_csv_data = "question_id,rule1,rule2\nq1,R1-A or B,R2-C\nq2,R3-D"
        with patch("builtins.open", mock_open(read_data=mock_csv_data)):
            rules = load_score_rules("dummy_path.csv")
            assert rules["q1"] == ["R1-A or B", "R2-C"]
            assert rules["q2"] == ["R3-D"]
    
    def test_load_score_rules_empty_file(self):
        """Test handling of empty file"""
        # 模拟一个只有标题行的空文件
        mock_csv_data = "question_id,rule1,rule2\n"  # 只有标题，没有数据行
        with patch("builtins.open", mock_open(read_data=mock_csv_data)):
            rules = load_score_rules("empty.csv")
            assert rules == {}  # 空文件应该返回空字典
    
    def test_load_score_rules_missing_file(self):
        """Test handling of missing file"""
        with pytest.raises(FileNotFoundError):
            load_score_rules("nonexistent.csv")


class TestCheckWeighting:
    """Test check_weighting function"""
    
    def test_check_weighting_single_rule_satisfied(self):
        """Test single rule satisfaction"""
        rules = ["R1-A or B"]
        service_offering = {
            "field1": {"question_name": "R1", "anwserselete": "A"}
        }
        result = check_weighting(rules, service_offering)
        assert result == 1
    
    def test_check_weighting_multiple_rules_satisfied(self):
        """Test multiple rules satisfaction"""
        rules = ["R1-A or B", "R2-C or D"]
        service_offering = {
            "field1": {"question_name": "R1", "anwserselete": "A"},
            "field2": {"question_name": "R2", "anwserselete": "C"}
        }
        result = check_weighting(rules, service_offering)
        assert result == 2
    
    def test_check_weighting_no_rules_satisfied(self):
        """Test no rules satisfaction"""
        rules = ["R1-A or B"]
        service_offering = {
            "field1": {"question_name": "R1", "anwserselete": "X"}
        }
        result = check_weighting(rules, service_offering)
        assert result == 0
    
    def test_check_weighting_invalid_rule_format(self):
        """Test handling of invalid rule format"""
        rules = ["invalid_rule", "R1-A or B"]
        service_offering = {
            "field1": {"question_name": "R1", "anwserselete": "A"}
        }
        result = check_weighting(rules, service_offering)
        assert result == 1
    
    def test_check_weighting_empty_rules(self):
        """Test empty rules list"""
        rules = []
        service_offering = {"field1": {"question_name": "R1", "anwserselete": "A"}}
        result = check_weighting(rules, service_offering)
        assert result == 0


class TestExtractBusinessProfile:
    """Test extract_business_profile function"""
    
    def test_extract_business_profile_direct_fields(self):
        """Test direct field extraction"""
        service_offering = {
            "industry": {"text": "Technology"},
            "business-challenge": {"text": "Scaling"}
        }
        profile = extract_business_profile(service_offering)
        assert profile["industry"] == "Technology"
        assert profile["business_challenge"] == "Scaling"
    
    def test_extract_business_profile_smart_matching(self):
        """Test smart field matching"""
        service_offering = {
            "field1": {
                "question": "what you offer",  # 使用原始函数能识别的关键词
                "anwser": "Software",
                "additionalText": "SaaS platform"
            },
            "field2": {
                "question": "revenue do you mainly have",  # 使用原始函数能识别的关键词
                "anwser": "Subscription",
                "additionalText": "Monthly billing"
            }
        }
        profile = extract_business_profile(service_offering)
        assert profile["service_type"] == "Software: SaaS platform"
        assert profile["revenue_type"] == "Subscription: Monthly billing"
    
    def test_extract_business_profile_missing_fields(self):
        """Test handling of missing fields"""
        service_offering = {}
        profile = extract_business_profile(service_offering)
        assert profile["industry"] == "N/A"
        assert profile["service_type"] == "N/A"
    
    def test_extract_business_profile_partial_data(self):
        """Test partial data handling"""
        service_offering = {
            "industry": {"text": "Finance"}
        }
        profile = extract_business_profile(service_offering)
        assert profile["industry"] == "Finance"
        assert profile["business_challenge"] == "N/A"
        assert profile["service_type"] == "N/A"
        assert profile["revenue_type"] == "N/A"
    
    def test_extract_business_profile_with_additional_text(self):
        """Test handling with additional text"""
        service_offering = {
            "field1": {
                "question": "what you offer",  # 使用原始函数能识别的关键词
                "anwser": "Consulting",
                "additionalText": "Business strategy consulting"
            }
        }
        profile = extract_business_profile(service_offering)
        assert profile["service_type"] == "Consulting: Business strategy consulting"
    
    def test_extract_business_profile_no_additional_text(self):
        """Test handling without additional text"""
        service_offering = {
            "field1": {
                "question": "what you offer",  # 使用原始函数能识别的关键词
                "anwser": "Training",
                "additionalText": ""
            }
        }
        profile = extract_business_profile(service_offering)
        assert profile["service_type"] == "Training"  # 原始函数会移除冒号和空格 