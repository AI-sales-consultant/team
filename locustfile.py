from locust import HttpUser, task, between, events
import os
import time
import threading
import importlib.util
import pathlib
import requests
import sys
import types
import shutil

try:
    import uvicorn
except Exception:
    uvicorn = None


def _is_up(base: str) -> bool:
    try:
        r = requests.get(base.rstrip("/") + "/docs", timeout=2)
        return r.ok
    except Exception:
        return False


def _install_test_stubs():
    if "openai" not in sys.modules:
        openai_stub = types.ModuleType("openai")

        class _Msg:
            def __init__(self, c): self.content = c

        class _Choice:
            def __init__(self, c): self.message = _Msg(c)

        class _Resp:
            def __init__(self, c): self.choices = [_Choice(c)]

        class _Comps:
            def create(self, **k): return _Resp("Stubbed LLM advice")

        class _Chat:
            def __init__(self): self.completions = _Comps()

        class AzureOpenAI:
            def __init__(self, *a, **k): self.chat = _Chat()

        openai_stub.AzureOpenAI = AzureOpenAI
        sys.modules["openai"] = openai_stub

    if "azure" not in sys.modules:
        sys.modules["azure"] = types.ModuleType("azure")
    if "azure.cosmos" not in sys.modules:
        cosmos_stub = types.ModuleType("azure.cosmos")

        class _Cont:
            def query_items(self, *a, **k): return []

        class _DB:
            def get_container_client(self, *a, **k): return _Cont()

        class CosmosClient:
            def __init__(self, *a, **k): ...
            def get_database_client(self, *a, **k): return _DB()

        cosmos_stub.CosmosClient = CosmosClient
        sys.modules["azure.cosmos"] = cosmos_stub
        setattr(sys.modules["azure"], "cosmos", cosmos_stub)


def _ensure_imports_resolve(root: pathlib.Path) -> None:
    fastapi_layer = str(root / "fastapi")
    if fastapi_layer not in sys.path:
        sys.path.insert(0, fastapi_layer)


def _ensure_runtime_assets(root: pathlib.Path, cwd: pathlib.Path) -> None:
    src = root / "fastapi" / "api" / "score_rule.csv"
    dst_dir = cwd / "api"
    dst = dst_dir / "score_rule.csv"
    if dst.exists():
        return
    dst_dir.mkdir(parents=True, exist_ok=True)
    if src.exists():
        try:
            dst.symlink_to(src)
        except Exception:
            shutil.copy2(src, dst)
    else:
        dst.write_text("", encoding="utf-8")


@events.init.add_listener
def _maybe_boot_local_api(environment, **_):
    host = (environment.host or os.getenv("LOCUST_HOST") or "").rstrip("/")
    if host and _is_up(host):
        print(f"[locust] Target {host} is up, using it.")
        return

    repo_root = pathlib.Path(__file__).resolve().parent
    main_py = repo_root / "fastapi" / "main.py"
    if not main_py.exists() or uvicorn is None:
        print(f"[locust] WARN: cannot self-boot API (main.py/uvicorn missing).")
        return

    os.chdir(str(repo_root))
    _ensure_imports_resolve(repo_root)
    _install_test_stubs()
    _ensure_runtime_assets(repo_root, pathlib.Path.cwd())

    spec = importlib.util.spec_from_file_location("app_main_under_test", str(main_py))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)

    port = int(os.getenv("APP_PORT", "8000"))
    config = uvicorn.Config(mod.app, host="127.0.0.1", port=port, log_level="warning")
    server = uvicorn.Server(config)

    t = threading.Thread(target=server.run, daemon=True)
    t.start()

    base = f"http://127.0.0.1:{port}"
    for _ in range(30):
        if _is_up(base):
            environment.host = base
            globals()["_LOCUST_UVICORN"] = server
            print(f"[locust] Booted local API at {base}")
            return
        time.sleep(1)

    raise RuntimeError("Failed to boot local API for Locust")


@events.quitting.add_listener
def _shutdown_local_api(environment, **_):
    server = globals().get("_LOCUST_UVICORN")
    if server:
        server.should_exit = True


class APILoad(HttpUser):
    wait_time = between(0.1, 0.5)

    @task
    def advice(self):
        payload = {
            "userId": "locust",
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
        with self.client.post("/api/llm-advice", json=payload, catch_response=True) as r:
            try:
                ok = (r.status_code == 200) and ("advice" in r.json())
            except Exception:
                ok = False
            if ok:
                r.success()
            else:
                r.failure(f"Unexpected {r.status_code}: {r.text[:200]}")
