# retrieval_test/error_test.py

import os
import sys
import pytest
import threading
import importlib

# Keep the minimal path tweak to allow 'cosmos_retriever' import from parent.
# We intentionally avoid introducing a package refactor to keep changes minimal.
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Normalize module identity: ensure we do not keep an alternative alias
# (e.g., 'fastapi.retrieval.cosmos_retriever') that could create a second module instance.
if 'fastapi.retrieval.cosmos_retriever' in sys.modules:
    del sys.modules['fastapi.retrieval.cosmos_retriever']

# Import the module to be tested (single canonical name).
import cosmos_retriever

@pytest.fixture
def fresh_retriever():
    """
    Provides a freshly reloaded module instance to isolate tests that rely on
    a clean global state. This keeps existing tests unchanged.
    """
    importlib.reload(cosmos_retriever)
    return cosmos_retriever

@pytest.fixture
def mock_bad_credentials(monkeypatch):
    """
    Legacy fixture (kept for backward compatibility).
    NOTE: Invalid credentials are not guaranteed to fail at import time because
    the Cosmos SDK defers credential validation. Avoid relying on this for
    startup-failure tests.
    """
    monkeypatch.setenv('COSMOS_ENDPOINT', 'https://invalid-endpoint.documents.azure.com:443/')
    monkeypatch.setenv('COSMOS_KEY', 'invalid-key')

# NEW: deterministic startup failure via fault injection (addresses major defect #1).
@pytest.fixture
def fresh_retriever_with_fail(monkeypatch):
    """
    Provides a module instance whose Cosmos client constructor fails deterministically.
    We stub the SDK constructor so that module-level initialization enters the
    failure path during import/reload.
    """
    class FailingClient:
        def __init__(self, *args, **kwargs):
            raise RuntimeError("init fail")

    # Patch the SDK entry point, not the module-level alias, so the stub survives reload.
    monkeypatch.setattr('azure.cosmos.CosmosClient', FailingClient)

    import cosmos_retriever as m
    importlib.reload(m)  # Re-run one-time init under the failing constructor
    return m

def test_database_connection_failure(fresh_retriever_with_fail):
    """
    Verifies startup failure handling using deterministic fault injection.
    This replaces the unreliable 'bad credentials + reload' approach.
    """
    m = fresh_retriever_with_fail
    # After reload with a failing constructor, the global client must be None.
    assert m.container_client is None

    # Subsequent calls must return None without crashing (graceful degradation).
    result = m.get_answer_text("question_01", "Start_Doing")
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
    Uses a fresh module instance to avoid cross-test contamination.
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
    """Extreme input sizes should not crash and must return None."""
    result = fresh_retriever.get_answer_text(qid, category)
    assert result is None

@pytest.mark.parametrize("qid, category", [
    ("question_01", "中文类别"),
    ("中文问题", "Start_Doing"),
    ("question_01", "😂"),
])
def test_encoding_issues(qid, category, fresh_retriever):
    """Non-ASCII inputs must be handled gracefully and return None."""
    result = fresh_retriever.get_answer_text(qid, category)
    assert result is None

def test_concurrent_access_simulation(fresh_retriever):
    """
    Simulates concurrent access. This test assumes a working client and is
    effectively an integration-style check; it is isolated via 'fresh_retriever'
    but may depend on environment availability.
    """
    errors = []

    def worker():
        try:
            result = fresh_retriever.get_answer_text("question_01", "Start_Doing")
            # We merely assert no exception; result may be None in CI environments.
            assert result is None or isinstance(result, str)
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
    Verifies that a runtime DB error during query is caught and returns None.
    """
    mocker.patch(
        'cosmos_retriever.container_client.query_items',
        side_effect=Exception("Simulated runtime DB error")
    )

    result = fresh_retriever.get_answer_text("any_id", "any_category")
    assert result is None

    # Assert we captured an error-level log; avoid strict message coupling.
    assert any(r.levelname == 'ERROR' for r in caplog.records)
    assert "error" in caplog.text.lower()