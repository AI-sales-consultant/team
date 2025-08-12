
from locust import HttpUser, task, between
class APILoad(HttpUser):
    wait_time = between(0.1, 0.5)
    @task
    def advice(self):
        self.client.post("/api/llm-advice", json={"userId":"locust","assessmentData":{"serviceOffering":{"industry":{"text":"EdTech"},"business_challenge":{"text":"Lead Gen"},"service_type":{"text":"Marketing"},"revenue_type":{"text":"subscription"},"R2":{"question_name":"R2","anwserselete":"A"},"R3":{"question_name":"R3","anwserselete":"A"},"R4":{"question_name":"R4","anwserselete":"B"},"R12":{"question_name":"R12","anwserselete":"C"}},"section1":{"q1":{"question":"Q1","score":0.5,"category":"Start_Doing","catmapping":"Profitable","anwser":"ans1"}}}})
