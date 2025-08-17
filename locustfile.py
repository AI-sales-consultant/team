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

# Only needed when we have to spin up the API inside Locust
try:
    import uvicorn  # Installed in CI (e.g., pip install uvicorn locust)
except Exception:
    uvicorn = None


def _is_up(base: str) -> bool:
    """Return True if the target base URL looks alive (checks /docs)."""
    try:
        r = requests.get(base.rstrip("/") + "/docs", timeout=2)
        return r.ok
    except Exception:
        return False


def _install_test_stubs():
    """
    Install lightweight stub modules for third-party deps that may not exist in CI:
    - 'openai' with AzureOpenAI client exposing chat.completions.create(...)
    - 'azure.cosmos' with CosmosClient that returns empty query results
    These stubs are just enough for the app to import and run without real I/O.
    """
    # ---- openai stub ----
    if "openai" not in sys.modules:
        openai_stub = types.ModuleType("openai")

        class _StubMsg:
            def __init__(self, content: str):
                self.content = content

        class _StubChoice:
            def __init__(self, content: str):
                self.message = _StubMsg(content)

        class _StubResponse:
            def __init__(self, content: str):
                self.choices = [_StubChoice(content)]

        class _StubCompletions:
            def create(self, **kwargs):
                # Always return a deterministic response
                return _StubResponse("Stubbed LLM advice")

        class _StubChat:
            def __init__(self):
                self.completions = _StubCompletions()

        class AzureOpenAI:
            def __init__(self, *args, **kwargs):
                self.chat = _StubChat()

        openai_stub.AzureOpenAI = AzureOpenAI
        sys.modules["openai"] = openai_stub

    # ---- azure.cosmos stub ----
    if "azure" not in sys.modules:
        sys.modules["azure"] = types.ModuleType("azure")
    if "azure.cosmos" not in sys.modules:
        cosmos_stub = types.ModuleType("azure.cosmos")

        class _StubContainer:
            def query_items(self, *args, **kwargs):
                return []

        class _StubDatabase:
            def get_container_client(self, *_args, **_kwargs):
                return _StubContainer()

        class CosmosClient:
            def __init__(self, *args, **kwargs):
                pass

            def get_database_client(self, *_args, **_kwargs):
                return _StubDatabase()

        cosmos_stub.CosmosClient = CosmosClient
        sys.modules["azure.cosmos"] = cosmos_stub
        setattr(sys.modules["azure"], "cosmos", cosmos_stub)


def _ensure_imports_resolve_for_project_layout(root: pathlib.Path) -> None:
    """
    Make absolute imports used by fastapi/main.py resolve correctly.
    We insert <PROJECT_ROOT>/fastapi into sys.path so 'import api' finds fastapi/api.
    This does NOT shadow third-party 'fastapi' package.
    """
    fastapi_layer = str(root / "fastapi")
    if fastapi_layer not in sys.path:
        sys.path.insert(0, fastapi_layer)


def _ensure_runtime_assets(root: pathlib.Path) -> None:
    """
    Ensure files the app opens via relative paths exist at runtime.
    Specifically map fastapi/api/score_rule.csv -> ./api/score_rule.csv
    to satisfy load_score_rules('api/score_rule.csv').
    """
    src = root / "fastapi" / "api" / "score_rule.csv"
    dst_dir = root / "api"
    dst = dst_dir / "score_rule.csv"
    if dst.exists():
        return
    dst_dir.mkdir(parents=True, exist_ok=True)
    if src.exists():
        try:
            # Prefer symlink (fast, keeps file in sync)
            dst.symlink_to(src)
        except Exception:
            # Fallback to copy (works everywhere)
            shutil.copy2(src, dst)
    else:
        # Last-resort: create an empty file so code that only checks existence won't crash.
        # If your loader requires real content, keep the copy/symlink path above by ensuring src exists.
        dst.write_text("", encoding="utf-8")


@events.init.add_listener
def _maybe_boot_local_api(environment, **_):
    """
    If the configured host is unreachable in CI, start a uvicorn server
    in-process by loading fastapi/main.py via importlib, then point Locust
    to this local instance. No changes to CI workflow or app source required.
    """
    host = (environment.host or os.getenv("LOCUST_HOST") or "").rstrip("/")
    if host and _is_up(host):
        print(f"[locust] Target {host} is up, using it.")
        return

    # Self-bootstrap: locate and load fastapi/main.py
    root = pathlib.Path(__file__).resolve().parent
    main_py = root / "fastapi" / "main.py"
    if not main_py.exists():
        print(f"[locust] WARN: {main_py} not found; cannot self-boot API.")
        return

    if uvicorn is None:
        raise RuntimeError("uvicorn not installed, cannot self-boot API")

    _ensure_imports_resolve_for_project_layout(root)
    _install_test_stubs()
    _ensure_runtime_assets(root)

    spec = importlib.util.spec_from_file_location("app_main_under_test", str(main_py))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)  # Load your FastAPI app module

    port = int(os.getenv("APP_PORT", "8000"))
    config = uvicorn.Config(mod.app, host="127.0.0.1", port=port, log_level="warning")
    server = uvicorn.Server(config)

    t = threading.Thread(target=server.run, daemon=True)
    t.start()

    base = f"http://127.0.0.1:{port}"
    # Wait up to 30s for readiness
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
    """Gracefully stop the embedded uvicorn server when Locust exits."""
    server = globals().get("_LOCUST_UVICORN")
    if server:
        server.should_exit = True


class APILoad(HttpUser):
    wait_time = between(0.1, 0.5)

    @task
    def advice(self):
        # Minimal valid payload aligned with the backend route schema
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
        # Explicitly mark success/failure for clean metrics
        with self.client.post("/api/llm-advice", json=payload, catch_response=True) as r:
            try:
                ok = (r.status_code == 200) and ("advice" in r.json())
            except Exception:
                ok = False
            if ok:
                r.success()
            else:
                r.failure(f"Unexpected {r.status_code}: {r.text[:200]}")
