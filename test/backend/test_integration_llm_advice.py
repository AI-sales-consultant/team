
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

def test_llm_advice_end2end():
    appmod = importlib.import_module("app_main_under_test")
    with TestClient(appmod.app) as client:
        r = client.post("/api/llm-advice", json=payload())
        assert r.status_code == 200
        assert "Based on your assessment results" in r.json().get("advice","")
