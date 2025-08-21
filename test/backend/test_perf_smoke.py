from __future__ import annotations

import time
from concurrent.futures import ThreadPoolExecutor
from typing import List

import pytest
from fastapi.testclient import TestClient


def _payload() -> dict:
    """Minimal valid request aligned with /api/llm-advice schema."""
    return {
        "userId": "pytest",
        "assessmentData": {
            "serviceOffering": {
                "industry": {"text": "EdTech"},
                "business_challenge": {"text": "Lead Gen"},
                "service_type": {"text": "Marketing"},
                "revenue_type": {"text": "subscription"},
                "R2": {"question_name": "R2", "anwserselete": "A"},
                "R3": {"question_name": "R3", "anwserselete": "A"},
                "R4": {"question_name": "R4", "anwserselete": "B"},
                "R12": {"question_name": "R12", "anwserselete": "C"},
            },
            "section1": {
                "q1": {
                    "question": "Q1",
                    "score": 0.5,
                    "category": "Start_Doing",
                    "catmapping": "Profitable",
                    "anwser": "ans1",
                }
            },
        },
    }


@pytest.fixture(scope="session")
def client() -> TestClient:
    """
    Build a TestClient from the app module.
    The app is imported in conftest.py as 'app_main_under_test'.
    """
    # Import here to ensure conftest hooks ran
    import app_main_under_test  # type: ignore  # noqa: F401

    from app_main_under_test import app  # type: ignore

    return TestClient(app)


def test_llm_advice_p99_latency_under_500ms(client: TestClient) -> None:
    """
    Smoke performance test:
    - 200 requests, up to 20 workers
    - assert p99 latency < 500ms (adjust as needed)
    """
    latencies_ms: List[float] = []

    def call() -> None:
        t0 = time.perf_counter()
        response = client.post("/api/llm-advice", json=_payload())
        assert response.status_code == 200, f"Unexpected {response.status_code}: {response.text}"
        latencies_ms.append((time.perf_counter() - t0) * 1000.0)

    with ThreadPoolExecutor(max_workers=20) as ex:
        for _ in range(200):
            ex.submit(call)

    # Compute p99
    xs = sorted(latencies_ms)
    p99_index = max(0, int(0.99 * len(xs)) - 1)
    p99 = xs[p99_index] if xs else 0.0
    assert p99 < 500.0, f"p99={p99:.2f}ms (n={len(xs)})"
