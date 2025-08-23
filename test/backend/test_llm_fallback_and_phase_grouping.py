from starlette.testclient import TestClient
from unittest.mock import patch
import app_main_under_test as appmod

client = TestClient(appmod.app)

def test_fallback_message_and_phase_grouping():
    """If the LLM call fails, the API should include fallback advice and still group items by phase."""
    # Provide a fixed retrieval text to avoid None branches
    with patch.object(appmod, "get_answer_text", return_value="Standard answer text"):
        # Force the OpenAI client to raise to trigger fallback path
        class Boom(Exception): ...
        with patch.object(appmod, "get_openai_client") as fake_get_client:
            fake_client = fake_get_client.return_value
            fake_client.chat.completions.create.side_effect = Boom("boom")
            with patch.object(appmod, "load_score_rules", return_value={}):
                payload = {
                    "userId": "u1",
                    "assessmentData": {
                        "serviceOffering": {
                            "industry": {"text": "Tech"},
                            "business-challenge": {"text": "Growth"},
                            "service-type": {"question": "What you offer", "anwser": "Software", "additionalText": ""}
                        },
                        "sectionX": {
                            "q1": {
                                "question": "How to improve?",
                                "category": "Marketing",
                                "catmapping": "Profitable",
                                "score": 0.5
                            }
                        }
                    }
                }
                r = client.post("/api/llm-advice", json=payload)
                assert r.status_code == 200
                text = r.json()["advice"]
                assert "Phase 1 (Profitable)" in text
                assert "Failed to generate advice due to an error" in text
