# retrieval_test/error_test.py

import os
import sys
import pytest
import threading
import time
import importlib

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the module to be tested
import cosmos_retriever

@pytest.fixture
def fresh_retriever():
    """
    A pytest fixture that provides a freshly reloaded instance of the
    cosmos_retriever module. This is crucial for tests that need a clean
    global state, isolating them from side effects of other tests that
    might poison the module's global client.
    """
    # Reload the module to ensure the global client is re-initialized
    importlib.reload(cosmos_retriever)
    return cosmos_retriever

@pytest.fixture
def mock_bad_credentials(monkeypatch):
    """A pytest fixture to simulate bad credentials."""
    monkeypatch.setenv('COSMOS_ENDPOINT', 'https://invalid-endpoint.documents.azure.com:443/')
    monkeypatch.setenv('COSMOS_KEY', 'invalid-key')

def test_database_connection_failure(mock_bad_credentials, fresh_retriever):
    """
    Tests that the module handles connection failure during initialization.
    The 'fresh_retriever' fixture is used here to ensure we are reloading
    the module in a controlled way.
    """
    # The fixture mock_bad_credentials is automatically applied.
    # The fresh_retriever fixture has already reloaded the module with the bad credentials.
    
    # After reload with bad credentials, the global client should be None.
    assert fresh_retriever.container_client is None
    
    # A call to the function should now return None immediately.
    result = fresh_retriever.get_answer_text("question_01", "Start_Doing")
    assert result is None

@pytest.mark.parametrize("qid, category", [
    (None, "Start_Doing"),
    ("question_01", None),
    (123, "Start_Doing"),
    ("question_01", 456),
    ([], "Start_Doing"),
    ("question_01", {}),
])
def test_invalid_parameter_types(qid, category, fresh_retriever):
    """
    Tests that invalid parameter types are handled gracefully.
    Uses a fresh_retriever instance to ensure the client is initialized.
    """
    result = fresh_retriever.get_answer_text(qid, category)
    assert result is None

@pytest.mark.parametrize("qid, category", [
    ("", ""),
    ("a" * 1000, "Start_Doing"),
    ("question_01", "b" * 1000),
    ("question_01", "Start_Doing" + "\n" * 100),
    ("question_01", "Start_Doing" + "\x00" * 10),
])
def test_extreme_input_sizes(qid, category, fresh_retriever):
    """Tests that extreme input sizes are handled gracefully and return None."""
    result = fresh_retriever.get_answer_text(qid, category)
    assert result is None

@pytest.mark.parametrize("qid, category", [
    ("question_01", "中文类别"),
    ("中文问题", "Start_Doing"),
    ("question_01", "😂"),
])
def test_encoding_issues(qid, category, fresh_retriever):
    """Tests that non-ASCII characters are handled gracefully and return None."""
    result = fresh_retriever.get_answer_text(qid, category)
    assert result is None

def test_concurrent_access_simulation(fresh_retriever):
    """
    Simulates concurrent access to ensure thread safety of the global client.
    This test now depends on the 'fresh_retriever' fixture to guarantee it
    receives a module with a working, initialized database client,
    isolating it from the connection failure test.
    """
    errors = []
    
    def worker():
        try:
            # Each thread calls the function from the clean module instance
            result = fresh_retriever.get_answer_text("question_01", "Start_Doing")
            assert result is not None
        except Exception as e:
            errors.append(e)
    
    threads = [threading.Thread(target=worker) for _ in range(5)]
    
    for t in threads:
        t.start()
    
    for t in threads:
        t.join()
        
    assert not errors, f"Concurrent access test failed with errors: {errors}"

def test_handles_query_execution_exception(mocker, caplog, fresh_retriever):
    """
    Tests the general exception handler during a query.
    This test mocks the database client to raise an exception when a query is executed,
    verifying that the function catches it, logs an error, and returns None.
    """
    # Arrange: Mock the query_items method on the clean module's client
    mocker.patch(
        'cosmos_retriever.container_client.query_items', 
        side_effect=Exception("Simulated runtime DB error")
    )
    
    # Act: Call the function from the clean module instance
    result = fresh_retriever.get_answer_text("any_id", "any_category")
    
    # Assert: Check that the function returned None as per the except block
    assert result is None
    
    # Assert: Check that an error was logged
    assert "An error occurred during database query execution" in caplog.text
    assert "Simulated runtime DB error" in caplog.text
    assert caplog.records[0].levelname == 'ERROR'