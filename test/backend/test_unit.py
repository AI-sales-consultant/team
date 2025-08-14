
import importlib
def test_models_validation():
    m = importlib.import_module("api.models")
    assert hasattr(m, "LLMAdviceRequest")
def test_prompts_templates():
    p = importlib.import_module("api.prompts")
    assert isinstance(getattr(p, "SYSTEM_PROMPT", ""), str)
