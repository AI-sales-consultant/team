
import time
from concurrent.futures import ThreadPoolExecutor
from starlette.testclient import TestClient
import importlib

def payload():
    return {
        "userId":"u123",
        "assessmentData":{
            "serviceOffering":{
                "industry":{"text":"EdTech"},
                "business_challenge":{"text":"Lead Gen"},
                "service_type":{"text":"Marketing"},
                "revenue_type":{"text":"subscription"},
                "R2":{"question_name":"R2","anwserselete":"A"},
                "R3":{"question_name":"R3","anwserselete":"A"},
                "R4":{"question_name":"R4","anwserselete":"B"},
                "R12":{"question_name":"R12","anwserselete":"C"}
            },
            "section1":{
                "q1":{"question":"Q1","score":0.5,"category":"Start_Doing","catmapping":"Profitable","anwser":"ans1"}
            }
        }
    }

def test_perf_smoke_p99_under_500ms():
    appmod = importlib.import_module("app_main_under_test")
    lat = []
    with TestClient(appmod.app) as client:
        def call():
            t0=time.perf_counter()
            r=client.post("/api/llm-advice", json=payload()); assert r.status_code==200
            lat.append((time.perf_counter()-t0)*1000)
        with ThreadPoolExecutor(max_workers=20) as ex:
            for _ in range(200): ex.submit(call)
    xs = sorted(lat); p99 = xs[max(0,int(0.99*len(xs))-1)]
    assert p99 < 500.0, f"p99={p99}ms"
