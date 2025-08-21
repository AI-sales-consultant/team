"""
Pytest bootstrap for backend tests.

- Ensures repository working directory and import paths are correct.
- Makes `fastapi/api` resolvable as the `api` package for absolute imports.
- Provides tiny stubs for OpenAI and Cosmos retriever so tests do not depend
  on external services or secrets.
- Ensures runtime asset `api/score_rule.csv` exists at CWD for code that uses
  relative path loading.
"""

from __future__ import annotations

import importlib.util
import os
import pathlib
import shutil
import sys
import types


REPO_ROOT = pathlib.Path(__file__).resolve().parents[1]
PROJECT_FASTAPI_DIR = REPO_ROOT / "fastapi"
MAIN_FILE = PROJECT_FASTAPI_DIR / "main.py"
API_DIR = PROJECT_FASTAPI_DIR / "api"


def _load(name: str, path: str):
    """Import module from source file path under the given name."""
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load module {name} from {path}")
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    spec.loader.exec_module(mod)
    return mod


def pytest_configure(config):  # noqa: ARG001  (pytest hook signature)
    """
    Prepare runtime environment before any tests are collected:
    - chdir to repo root;
    - ensure ./api/score_rule.csv exists (copy from fastapi/api if needed).
    """
    os.chdir(str(REPO_ROOT))
    (REPO_ROOT / "api").mkdir(exist_ok=True)
    src = API_DIR / "score_rule.csv"
    dst = REPO_ROOT / "api" / "score_rule.csv"
    if src.exists() and not dst.exists():
        try:
            shutil.copyfile(src, dst)
        except Exception as exc:  # pragma: no cover - non-critical
            print("Warn: could not copy score_rule.csv:", exc)


def pytest_sessionstart(session):  # noqa: ARG001  (pytest hook signature)
    """
    Make application imports resolvable and install test doubles:
    - alias fastapi/api as top-level package 'api';
    - install a minimal cosmos retriever and openai client stub;
    - (optionally) import the FastAPI app to catch import errors early.
    """
    # Alias `fastapi/api` as package "api"
    api_pkg = types.ModuleType("api")
    api_pkg.__path__ = [str(API_DIR)]
    sys.modules["api"] = api_pkg

    # Load optional submodules if they exist in the repo
    models_py = API_DIR / "models.py"
    if models_py.exists():
        _load("api.models", str(models_py))
    prompts_py = API_DIR / "prompts.py"
    if prompts_py.exists():
        _load("api.prompts", str(prompts_py))

    # Provide a tiny cosmos retriever: api.cosmos_retriever.get_answer_text(...)
    cr = types.ModuleType("api.cosmos_retriever")

    def get_answer_text(question_id: str, category: str) -> str:  # noqa: D401
        """Return deterministic base text for tests."""
        return f"[DB:{question_id}|{category}] base_text"

    cr.get_answer_text = get_answer_text  # type: ignore[attr-defined]
    sys.modules["api.cosmos_retriever"] = cr

    # Provide a tiny OpenAI stub compatible with app usage
    class _Msg:
        def __init__(self, content: str) -> None:
            self.content = content

    class _Choice:
        def __init__(self, content: str) -> None:
            self.message = _Msg(content)

    class _Resp:
        def __init__(self, content: str) -> None:
            self.choices = [_Choice(content)]

    class _Completions:
        def create(self, **kwargs):  # noqa: ANN003
            return _Resp("Stubbed LLM advice")

    class _Chat:
        def __init__(self) -> None:
            self.completions = _Completions()

    class _AzureOpenAI:
        def __init__(self, *args, **kwargs) -> None:  # noqa: ANN002, ANN003
            self.chat = _Chat()

    sys.modules["openai"] = types.SimpleNamespace(AzureOpenAI=_AzureOpenAI)

    # Optionally preload the app to fail fast on import issues.
    if MAIN_FILE.exists():
        _load("app_main_under_test", str(MAIN_FILE))
