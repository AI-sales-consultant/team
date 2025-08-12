
import sys, types, importlib.util, pathlib, shutil, os
REPO_ROOT = pathlib.Path(__file__).resolve().parents[1]
PROJECT_FASTAPI_DIR = REPO_ROOT / "fastapi"
API_DIR = PROJECT_FASTAPI_DIR / "api"
MAIN_FILE = PROJECT_FASTAPI_DIR / "main.py"
def _load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec); sys.modules[name]=mod; spec.loader.exec_module(mod); return mod
def pytest_configure(config):
    os.chdir(str(REPO_ROOT))
    (REPO_ROOT / "api").mkdir(exist_ok=True)
    src = API_DIR / "score_rule.csv"; dst = REPO_ROOT / "api" / "score_rule.csv"
    if src.exists() and not dst.exists():
        try: shutil.copyfile(src, dst)
        except Exception as e: print("Warn:", e)
def pytest_sessionstart(session):
    api = types.ModuleType("api"); api.__path__ = [str(API_DIR)]; sys.modules["api"]=api
    if (API_DIR / "models.py").exists(): _load("api.models", str(API_DIR / "models.py"))
    if (API_DIR / "prompts.py").exists(): _load("api.prompts", str(API_DIR / "prompts.py"))
    cr = types.ModuleType("api.cosmos_retriever")
    def get_answer_text(question_id: str, category: str): return f"[DB:{question_id}|{category}] base_text"
    cr.get_answer_text = get_answer_text; sys.modules["api.cosmos_retriever"] = cr
    class _Msg: 
        def __init__(self, content): self.content = content
    class _Choice:
        def __init__(self, content): self.message = _Msg(content)
    class _ChatCompletions:
        def create(self, *a, **kw):
            last = kw.get("messages", [{}])[-1].get("content","")
            return types.SimpleNamespace(choices=[_Choice("LLM_OK: "+str(last)[:40])])
    class _Chat: 
        def __init__(self): self.completions = _ChatCompletions()
    class _AzureOpenAI:
        def __init__(self,*a,**k): self.chat = _Chat()
    sys.modules["openai"] = types.SimpleNamespace(AzureOpenAI=_AzureOpenAI)
    if MAIN_FILE.exists(): _load("app_main_under_test", str(MAIN_FILE))
