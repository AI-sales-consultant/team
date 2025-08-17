from locust import HttpUser, task, between, events
import os
import time
import threading
import importlib.util
import pathlib
import requests
import sys
import types

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
    # Provide azure and azure.cosmos namespaces, plus CosmosClient with minimal surface
    if "azure" not in sys.modules:
        sys.modules["azure"] = types.ModuleType("azure")
    if "azure.cosmos" not in sys.modules:
        cosmos_stub = types.ModuleType("azure.cosmos")

        class _StubContainer:
            def query_items(self, *args, **kwargs):
                # Return empty iterable to simulate "not found"
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
        # Ensure azure.cosmos is reachable as attribute
        setattr(sys.modules["azure"], "cosmos", cosmos_stub)


def _ensure_imports_resolve_for_project_layout(root: pathlib.Path) -> None:
    """
    Make absolute imports used by fastapi/main.py resolve correctly.
    We insert <PROJECT_ROOT>/fastapi into sys.path so 'import api' finds fastapi/api.
    This does NOT shadow third-party 'fastapi' package, because we are NOT adding the project root.
    """
    fastapi_layer = str(root / "fastapi")
    if fastapi_layer not in sys.path:
        sys.path.insert(0, fastapi_layer)


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

    # Ensure absolute imports like "from api.models ..." resolve to fastapi/api/...
    _ensure_imports_resolve_for_project_layout(root)

    # Install stubs so that importing your app won't fail on missing deps
    _install_test_stubs()

    spec = importlib.util.spec_from_file_location("app_main_under_test", str(main_py))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)  # This loads your FastAPI app module

    port = int(os.getenv("APP_PORT", "8000"))
    config = uvicorn.Config(mod.app, host="127.0.0.1", port=port, log_level="warning")
    server = uvicorn.Server(config)

    # Run uvicorn in a background thread so Locust can continue
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
