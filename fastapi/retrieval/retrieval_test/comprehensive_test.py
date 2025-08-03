import os
import sys
import time
import pytest

# Add the parent directory to the Python path to allow importing the cosmos_retriever module.
# Pytest handles this better, but it's kept for compatibility if run directly.
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from cosmos_retriever import get_answer_text

# Test Data: Known existing records selected from the source data.
VALID_TEST_CASES = [
    ("question_00", "Start_Doing"),
    ("question_00", "Do_More"),
    ("question_00", "Keep_Doing"),
    ("question_01", "Start_Doing"),
    ("question_05", "Do_More"),
    ("question_10", "Keep_Doing"),
    ("question_15", "Start_Doing"),
    ("question_20", "Do_More"),
    ("question_25", "Keep_Doing"),
    ("question_33", "Keep_Doing")
]

# Invalid Test Cases.
INVALID_TEST_CASES = [
    ("question_99", "Start_Doing", "Non-existent question_id"),
    ("question_00", "Invalid_Category", "Non-existent category"),
    ("question_999", "Non_Existent", "Completely non-existent pair"),
    ("", "Start_Doing", "Empty question_id"),
    ("question_00", "", "Empty category"),
    ("", "", "Both parameters empty")
]

# Data Integrity Test Cases
INTEGRITY_TEST_CASES = [
    ("question_01", "Start_Doing", "specific clients who need your offering"),
    ("question_00", "Start_Doing", "Identifying your ideal niche"),
    ("question_33", "Keep_Doing", "effective CRM system"),
]

# Boundary Condition Test Cases
BOUNDARY_TEST_CASES = [
    ("question_00", "Start_Doing" + " " * 100, "Long category name"),
    ("question_" + "0" * 100, "Start_Doing", "Long ID"),
]

@pytest.mark.parametrize("qid, category", VALID_TEST_CASES)
def test_basic_functionality(qid, category):
    """Tests basic functionality: verifies the retrieval of known data."""
    answer = get_answer_text(qid, category)
    
    assert answer is not None, f"Expected data but got None for ({qid}, {category})"
    assert isinstance(answer, str), f"Expected str, got {type(answer)} for ({qid}, {category})"
    assert answer.strip(), f"Returned an empty string for ({qid}, {category})"

@pytest.mark.parametrize("qid, category, description", INVALID_TEST_CASES)
def test_invalid_cases(qid, category, description):
    """Tests invalid inputs: verifies the correct handling of non-existent data."""
    answer = get_answer_text(qid, category)
    assert answer is None, f"For {description}, expected None but got a value."

@pytest.mark.parametrize("qid, category, expected_fragment", INTEGRITY_TEST_CASES)
def test_data_integrity(qid, category, expected_fragment):
    """Tests data integrity: verifies the content correctness of specific data."""
    answer = get_answer_text(qid, category)
    
    assert answer is not None, f"Data missing for integrity check on ({qid}, {category})"
    assert expected_fragment.lower() in answer.lower(), f"Content mismatch for ({qid}, {category})"

@pytest.mark.parametrize("qid, category, description", BOUNDARY_TEST_CASES)
def test_boundary_conditions(qid, category, description):
    """Tests boundary conditions: unusual parameters and edge values should not crash."""
    # The main goal is to ensure no exception is raised.
    # The function should gracefully return None for these invalid formats.
    answer = get_answer_text(qid, category)
    assert answer is None, f"Boundary test '{description}' should return None."

def test_performance_baseline():
    """Tests performance baseline: verifies that response times are within a reasonable range."""
    test_cases = VALID_TEST_CASES[:5]
    response_times = []
    
    for qid, category in test_cases:
        start_time = time.time()
        answer = get_answer_text(qid, category)
        end_time = time.time()
        
        assert answer is not None, f"Performance test failed to retrieve data for ({qid}, {category})"
        
        response_time_ms = (end_time - start_time) * 1000
        response_times.append(response_time_ms)
        
        assert response_time_ms <= 5000, f"Response time too long: {response_time_ms:.1f}ms for ({qid}, {category})"

    if response_times:
        avg_time = sum(response_times) / len(response_times)
        print(f"\nPerformance Stats: Avg Response Time: {avg_time:.1f}ms")

def test_duplicate_handling():
    """
    Tests that different categories for the same question_id return distinct content.
    This verifies the query logic correctly uses both parameters.
    """
    duplicate_tests = [
        ("question_00", "Start_Doing"),
        ("question_00", "Do_More"),
        ("question_00", "Keep_Doing"),
    ]
    
    results = {}
    for qid, category in duplicate_tests:
        answer = get_answer_text(qid, category)
        assert answer is not None, f"Data not found for duplicate handling test on ({qid}, {category})"
        results[category] = answer
    
    # Verify that different categories returned different content
    unique_answers = set(results.values())
    assert len(unique_answers) == len(duplicate_tests), "Different categories returned identical content."

# NEW TEST TO COVER THE if len(items) > 1 BRANCH
def test_handles_duplicate_results_gracefully(mocker, caplog):
    """
    Tests the defensive check for multiple query results.
    This test mocks the database client to simulate it returning two items,
    verifying that the function logs a warning and returns the first item.
    """
    # Arrange: Mock the container_client's query_items method
    mock_items = [
        {'text': 'first item text'},
        {'text': 'second item text'}
    ]
    mocker.patch('cosmos_retriever.container_client.query_items', return_value=mock_items)
    
    # Act: Call the function that will use the mocked method
    result = get_answer_text("any_id", "any_category")
    
    # Assert: Check that the function returned the first item's text
    assert result == 'first item text'
    
    # Assert: Check that a warning was logged
    assert "Found 2 matches, but expected 1" in caplog.text
    assert caplog.records[0].levelname == 'WARNING'