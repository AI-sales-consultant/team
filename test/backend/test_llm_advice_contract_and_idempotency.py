from starlette.testclient import TestClient
from unittest.mock import patch
import pytest
import app_main_under_test as appmod

client = TestClient(appmod.app)

@pytest.mark.parametrize("bad_payload", [
    {},                      # missing userId and assessmentData
    {"userId": "u1"},        # missing assessmentData
])
def test_llm_advice_request_validation_422(bad_payload):
    """FastAPI/Pydantic should reject invalid payloads with 422."""
    r = client.post("/api/llm-advice", json=bad_payload)
    assert r.status_code == 422

def test_llm_advice_idempotency_same_payload_same_advice():
    """Same input payload should produce the same advice text (idempotency)."""
    async def fake_generate(q, profile):
        return {
            "catmapping": q.get("catmapping", "Profitable"),
            "category": q.get("category", "Marketing"),
            "question": q.get("question", "Q?"),
            "advice": "Fixed advice"
        }

    # Remove weighting impact and fix the async LLM generation
    with patch.object(appmod, "load_score_rules", return_value={}):
        with patch.object(appmod, "generate_advice_for_question", side_effect=fake_generate):
            payload = {
                "userId": "u1",
                "assessmentData": {
                    "serviceOffering": {
                        "industry": {"text": "Tech"},
                        "business-challenge": {"text": "Scaling"},
                        "service-type": {"question": "What you offer", "anwser": "Software", "additionalText": ""}
                    },
                    "sectionA": {
                        "q1": {"question": "How to improve?", "category": "Marketing", "catmapping": "Profitable", "score": 1.0}
                    }
                }
            }
            r1 = client.post("/api/llm-advice", json=payload)
            r2 = client.post("/api/llm-advice", json=payload)
            assert r1.status_code == 200 and r2.status_code == 200
            assert r1.json()["advice"] == r2.json()["advice"]
