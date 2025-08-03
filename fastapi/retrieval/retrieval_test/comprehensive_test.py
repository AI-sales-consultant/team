
"""
Azure Cosmos DB Data Retrieval Module Comprehensive Test Suite
Designed for the final year project, providing comprehensive yet not overly complex test coverage.

Test Categories:
1. Basic Functionality Test - Validates core retrieval functions.
2. Boundary Condition Test - Tests parameter boundaries and special values.
3. Data Validation Test - Verifies the accuracy and integrity of returned data.
4. Exception Handling Test - Tests handling of error scenarios.
5. Performance Baseline Test - Simple validation of response times.
"""

import os
import sys
import time
import logging
from typing import List, Tuple, Optional

# Add the parent directory to the Python path to allow importing the cosmos_retriever module.
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from cosmos_retriever import get_answer_text

# Configure test logging.
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('test_suite')

class TestResult:
    """A class to record test results."""
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
    
    def add_pass(self):
        self.passed += 1
    
    def add_fail(self, test_name: str, error: str):
        self.failed += 1
        self.errors.append(f"{test_name}: {error}")
    
    def print_summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"Test Summary:")
        print(f"Total Tests: {total}")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        print(f"Success Rate: {(self.passed/total*100):.1f}%" if total > 0 else "No tests executed")
        
        if self.errors:
            print(f"\nFailure Details:")
            for error in self.errors:
                print(f"  - {error}")
        print(f"{'='*60}")

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
    ("question_33", "Keep_Doing")  # Last record
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

def test_basic_functionality(result: TestResult):
    """Tests basic functionality: verifies the retrieval of known data."""
    print("\n1. Basic Functionality Test")
    print("-" * 40)
    
    for i, (qid, category) in enumerate(VALID_TEST_CASES, 1):
        try:
            answer = get_answer_text(qid, category)
            
            if answer is None:
                result.add_fail(f"Basic Functionality {i}", f"Expected data but got None: ({qid}, {category})")
                print(f"[FAIL] Test {i}: ({qid}, {category}) - Data not found")
            elif not isinstance(answer, str):
                result.add_fail(f"Basic Functionality {i}", f"Incorrect return type, expected str, got {type(answer)}")
                print(f"[FAIL] Test {i}: ({qid}, {category}) - Type error")
            elif len(answer.strip()) == 0:
                result.add_fail(f"Basic Functionality {i}", f"Returned an empty string")
                print(f"[FAIL] Test {i}: ({qid}, {category}) - Empty string")
            else:
                result.add_pass()
                print(f"[OK] Test {i}: ({qid}, {category}) - Success ({len(answer)} chars)")
                
        except Exception as e:
            result.add_fail(f"Basic Functionality {i}", f"Exception: {str(e)}")
            print(f"[FAIL] Test {i}: ({qid}, {category}) - Exception: {e}")

def test_invalid_cases(result: TestResult):
    """Tests invalid inputs: verifies the correct handling of non-existent data."""
    print("\n2. Invalid Input Test")
    print("-" * 40)
    
    for i, (qid, category, description) in enumerate(INVALID_TEST_CASES, 1):
        try:
            answer = get_answer_text(qid, category)
            
            if answer is None:
                result.add_pass()
                print(f"[OK] Test {i}: {description} - Correctly returned None")
            else:
                result.add_fail(f"Invalid Input {i}", f"{description} - Expected None, but got: {type(answer)}")
                print(f"[FAIL] Test {i}: {description} - Unexpectedly returned data")
                
        except Exception as e:
            result.add_fail(f"Invalid Input {i}", f"{description} - Exception: {str(e)}")
            print(f"[FAIL] Test {i}: {description} - Exception: {e}")

def test_data_integrity(result: TestResult):
    """Tests data integrity: verifies the content correctness of specific data."""
    print("\n3. Data Integrity Test")
    print("-" * 40)
    
    # Test for known data fragments
    integrity_tests = [
        ("question_01", "Start_Doing", "specific clients who need your offering"),
        ("question_00", "Start_Doing", "Identifying your ideal niche"),
        ("question_33", "Keep_Doing", "effective CRM system"),
    ]
    
    for i, (qid, category, expected_fragment) in enumerate(integrity_tests, 1):
        try:
            answer = get_answer_text(qid, category)
            
            if answer is None:
                result.add_fail(f"Data Integrity {i}", f"Data missing: ({qid}, {category})")
                print(f"[FAIL] Integrity {i}: ({qid}, {category}) - Data missing")
            elif expected_fragment.lower() not in answer.lower():
                result.add_fail(f"Data Integrity {i}", f"Content mismatch, fragment not found: {expected_fragment}")
                print(f"[FAIL] Integrity {i}: ({qid}, {category}) - Content mismatch")
            else:
                result.add_pass()
                print(f"[OK] Integrity {i}: ({qid}, {category}) - Content validated")
                
        except Exception as e:
            result.add_fail(f"Data Integrity {i}", f"Exception: {str(e)}")
            print(f"[FAIL] Integrity {i}: ({qid}, {category}) - Exception: {e}")

def test_boundary_conditions(result: TestResult):
    """Tests boundary conditions: unusual parameters and edge values."""
    print("\n4. Boundary Condition Test")
    print("-" * 40)
    
    boundary_tests = [
        # (param1, param2, description)
        ("question_00", "Start_Doing", "Normal lower boundary"),  # Min valid question_id
        ("question_33", "Keep_Doing", "Normal upper boundary"),   # Max valid question_id  
        ("question_00", "Start_Doing" + " " * 100, "Long category name"),
        ("question_" + "0" * 100, "Start_Doing", "Long ID"),
    ]
    
    for i, (qid, category, description) in enumerate(boundary_tests, 1):
        try:
            answer = get_answer_text(qid, category)
            
            # For boundary conditions, we mainly care about not raising an exception.
            result.add_pass()
            status = "Returned data" if answer else "Returned None"
            print(f"[OK] Boundary {i}: {description} - {status}")
            
        except Exception as e:
            result.add_fail(f"Boundary Condition {i}", f"{description} - Exception: {str(e)}")
            print(f"[FAIL] Boundary {i}: {description} - Exception: {e}")

def test_performance_baseline(result: TestResult):
    """Tests performance baseline: verifies that response times are within a reasonable range."""
    print("\n5. Performance Baseline Test")
    print("-" * 40)
    
    test_cases = VALID_TEST_CASES[:5]  # Use the first 5 valid cases
    response_times = []
    
    for i, (qid, category) in enumerate(test_cases, 1):
        try:
            start_time = time.time()
            answer = get_answer_text(qid, category)
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000  # Convert to milliseconds
            response_times.append(response_time)
            
            if answer is None:
                result.add_fail(f"Performance {i}", f"Data retrieval failed")
                print(f"[FAIL] Performance {i}: ({qid}, {category}) - Retrieval failed")
            elif response_time > 5000:  # 5-second timeout
                result.add_fail(f"Performance {i}", f"Response time too long: {response_time:.1f}ms")
                print(f"[FAIL] Performance {i}: ({qid}, {category}) - Timeout: {response_time:.1f}ms")
            else:
                result.add_pass()
                print(f"[OK] Performance {i}: ({qid}, {category}) - {response_time:.1f}ms")
                
        except Exception as e:
            result.add_fail(f"Performance {i}", f"Exception: {str(e)}")
            print(f"[FAIL] Performance {i}: ({qid}, {category}) - Exception: {e}")
    
    if response_times:
        avg_time = sum(response_times) / len(response_times)
        max_time = max(response_times)
        min_time = min(response_times)
        print(f"\nPerformance Statistics:")
        print(f"  Average Response Time: {avg_time:.1f}ms")
        print(f"  Min Response Time: {min_time:.1f}ms")
        print(f"  Max Response Time: {max_time:.1f}ms")

def test_duplicate_handling(result: TestResult):
    """Tests duplicate data handling: verifies the handling of records with the same question_id but different categories."""
    print("\n6. Duplicate Data Handling Test")
    print("-" * 40)
    
    # question_00 exists for multiple categories
    duplicate_tests = [
        ("question_00", "Start_Doing"),
        ("question_00", "Do_More"),
        ("question_00", "Keep_Doing"),
    ]
    
    results = {}
    for i, (qid, category) in enumerate(duplicate_tests, 1):
        try:
            answer = get_answer_text(qid, category)
            results[category] = answer
            
            if answer is None:
                result.add_fail(f"Duplicate Handling {i}", f"Data not found: ({qid}, {category})")
                print(f"[FAIL] Duplicate {i}: ({qid}, {category}) - Not found")
            else:
                result.add_pass()
                print(f"[OK] Duplicate {i}: ({qid}, {category}) - Retrieved successfully")
                
        except Exception as e:
            result.add_fail(f"Duplicate Handling {i}", f"Exception: {str(e)}")
            print(f"[FAIL] Duplicate {i}: ({qid}, {category}) - Exception: {e}")
    
    # Verify that different categories return different content
    unique_answers = set(answer for answer in results.values() if answer)
    if len(unique_answers) == len([a for a in results.values() if a]):
        print(f"[OK] Duplicate Data Validation: Different categories return distinct content.")
    else:
        print(f"[WARN] Duplicate Data Validation: Some categories may share the same content.")

def run_comprehensive_test():
    """Runs the complete test suite."""
    print("Azure Cosmos DB Data Retrieval Module - Comprehensive Test Suite")
    print("="*60)
    
    result = TestResult()
    
    # Check environment
    endpoint = os.getenv("COSMOS_ENDPOINT")
    key = os.getenv("COSMOS_KEY")
    
    if not endpoint or not key:
        print("[FAIL] Environment check failed: Missing COSMOS_ENDPOINT or COSMOS_KEY environment variables.")
        print("Please ensure the .env file is configured correctly.")
        return
    
    print("[OK] Environment check passed: Database connection credentials found.")
    
    # Execute test suite
    try:
        test_basic_functionality(result)
        test_invalid_cases(result)
        test_data_integrity(result)
        test_boundary_conditions(result)
        test_performance_baseline(result)
        test_duplicate_handling(result)
        
    except Exception as e:
        print(f"[FAIL] Test suite execution error: {e}")
        result.add_fail("Test Suite", f"Execution error: {str(e)}")
    
    # Print summary
    result.print_summary()
    
    # Return success flag
    return result.failed == 0

if __name__ == "__main__":
    success = run_comprehensive_test()
    exit(0 if success else 1)```
---
### **File: `cosmos_retriever.py` (Translated)**
```python
import os
import logging
from typing import Optional
from dotenv import load_dotenv
from azure.cosmos import CosmosClient

# --- Configuration ---
load_dotenv()
ENDPOINT = os.getenv("COSMOS_ENDPOINT")
KEY = os.getenv("COSMOS_KEY")
DATABASE_NAME = "PromptEngineeringDB"
CONTAINER_NAME = "answers"

# --- Global Client Instance ---
# In a production environment (e.g., a FastAPI application), the CosmosClient instance should be
# created once at application startup and reused globally to avoid the overhead of establishing
# a new connection for each request.
try:
    client = CosmosClient(url=ENDPOINT, credential=KEY)
    database_client = client.get_database_client(DATABASE_NAME)
    container_client = database_client.get_container_client(CONTAINER_NAME)
    logging.info("Cosmos DB client initialized successfully for cosmos_retriever module.")
except Exception as e:
    client = None
    container_client = None
    logging.error(f"Failed to initialize Cosmos DB client: {e}")
    # In a real application, more robust handling should be implemented for database connection failures.
    # This is for logging purposes only.

def get_answer_text(question_id: str, category: str) -> Optional[str]:
    """
    Retrieves the unique generalized answer text from Cosmos DB based on question_id and category.

    Args:
        question_id (str): The question ID, e.g., 'question_00'.
        category (str): The answer category, e.g., 'Start_Doing'.

    Returns:
        Optional[str]: The answer text if found; otherwise, None.
    """
    if not container_client:
        logging.error("Database client is not initialized; cannot execute query.")
        return None

    # 1. Construct a parameterized SQL query to prevent SQL injection.
    query = (
        "SELECT c.text FROM c "
        "WHERE c.question_id = @question_id AND c.category = @category"
    )
    
    parameters = [
        {"name": "@question_id", "value": question_id},
        {"name": "@category", "value": category},
    ]

    logging.info(f"Executing query: {query} with params: {parameters}")

    try:
        # 2. Execute the query.
        # Setting enable_cross_partition_query to True is a good practice,
        # although this specific query will hit a single partition due to the partition key design.
        items = list(container_client.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        ))
        
        # 3. Process the query results.
        if not items:
            logging.warning(f"No match found: question_id='{question_id}', category='{category}'")
            return None
        
        if len(items) > 1:
            logging.warning(
                f"Found {len(items)} matching items, but expected 1. Returning the first item. "
                f"Query: question_id='{question_id}', category='{category}'"
            )
        
        # Return the 'text' field from the first record.
        return items[0].get("text")

    except Exception as e:
        logging.error(f"An error occurred during the database query: {e}")
        return None