# main.py (Completely Refactored for Performance and Frontend Adaptation)

import os
import csv
import openai
import asyncio
from fastapi import FastAPI, HTTPException
from api.models import AssessmentData, SaveReportResponse, LLMAdviceRequest, LLMAdviceResponse
from dotenv import load_dotenv
from api.prompts import SYSTEM_PROMPT_TEMPLATE, USER_PROMPT_TEMPLATE
from api.cosmos_retriever import get_answer_text
from collections import defaultdict
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Dict, Any, List

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# NEW: Use the async client for concurrent API calls
client = openai.AsyncAzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_version="2024-02-15-preview"
)

def load_score_rules(csv_path: str) -> Dict[str, List[str]]:
    rules = {}
    with open(csv_path, newline='') as csvfile:
        reader = csv.reader(csvfile)
        next(reader)  # Skip headers
        for row in reader:
            qid = row[0]
            rules[qid] = row[1:]
    return rules

def check_weighting(rules: List[str], service_offering: Dict[str, Any]) -> bool:
    if not rules:
        return False
    for rule in rules:
        if not rule or '-' not in rule:
            continue
        r_name, r_opts_str = rule.split('-', 1)
        r_name = r_name.strip()
        r_opts = [opt.strip().lower() for opt in r_opts_str.replace(' ', '').split('or')]
        
        found_match = False
        for key, so_value in service_offering.items():
            if isinstance(so_value, dict) and so_value.get('question_name') == r_name:
                user_ans = so_value.get('anwserselete', '').lower()
                if user_ans in r_opts:
                    found_match = True
                    break
        if not found_match:
            return False # If any rule is not satisfied, the condition fails
    return True

# NEW HELPER: Extracts business profile, adapting to frontend's structure
def extract_business_profile(service_offering: Dict[str, Any]) -> Dict[str, str]:
    profile = {
        "industry": "N/A",
        "business_challenge": "N/A",
        "service_type": "N/A",
        "revenue_type": "N/A"
    }
    # Adapt to frontend keys (e.g., 'business-challenge') and structure
    profile['industry'] = service_offering.get('industry', {}).get('text', 'N/A')
    profile['business_challenge'] = service_offering.get('business-challenge', {}).get('text', 'N/A')

    # For other fields, iterate to find the matching question
    for key, value in service_offering.items():
        if isinstance(value, dict):
            question = value.get('question', '').lower()
            answer = value.get('anwser', '')
            additional_text = value.get('additionalText', '')
            full_answer = f"{answer}: {additional_text}".strip().strip(':').strip()

            if "what you offer" in question:
                profile['service_type'] = full_answer
            elif "revenue do you mainly have" in question:
                profile['revenue_type'] = full_answer
    return profile

# NEW ASYNC FUNCTION: Generates advice for a single question
async def generate_advice_for_question(q_data: Dict[str, Any], business_profile: Dict[str, str]) -> Dict[str, Any]:
    question_id = q_data['question_id']
    new_category = q_data['new_category']
    
    retrieved_text = get_answer_text(question_id, new_category)
    if retrieved_text is None:
        retrieved_text = "No standard advice found."

    # Smartly choose the user's answer: prefer detailed text over simple rating
    user_answer = q_data.get('additionalText', '').strip()
    if not user_answer:
        user_answer = q_data.get('anwser', 'N/A')

    prompt = USER_PROMPT_TEMPLATE.format(
        retrieved_text=retrieved_text,
        original_question=q_data.get('question', ''),
        user_answer=user_answer,
        advice_type=new_category
    )

    try:
        response = await client.chat.completions.create(
            model=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT_TEMPLATE.format(**business_profile)},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_tokens=512
        )
        llm_response = response.choices[0].message.content
    except Exception as e:
        print(f"Error generating advice for {question_id}: {e}")
        llm_response = f"Failed to generate advice due to an error: {e}"

    return {
        "catmapping": q_data.get("catmapping", ""),
        "category": q_data.get("category", ""),
        "question": q_data.get("question", ""),
        "advice": llm_response
    }

@app.post("/api/save-user-report", response_model=SaveReportResponse)
async def save_user_report(data: AssessmentData):
    # This endpoint is not the main focus of the change, but it's good practice.
    return {
        "status": "success",
        "message": "Report saved successfully",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/llm-advice", response_model=LLMAdviceResponse)
async def get_llm_advice(request: LLMAdviceRequest):
    assessment_data = request.assessmentData.dict()
    service_offering = assessment_data.get('serviceOffering', {})
    score_rules = load_score_rules('api/score_rule.csv')
    
    # 1. MODIFIED: Extract business profile using the new adaptive helper
    business_profile = extract_business_profile(service_offering)
    
    # 2. MODIFIED: Collect all questions by adapting to the frontend's structure
    all_questions = []
    section_keys = [k for k in assessment_data if k != "serviceOffering"]
    for section_key in section_keys:
        section_content = assessment_data[section_key]
        if isinstance(section_content, dict):
            for question_key, q_value in section_content.items():
                if isinstance(q_value, dict):
                    all_questions.append(q_value)

    # 3. Process scoring and categorization for each question
    for idx, q in enumerate(all_questions):
        q['question_id'] = f"question_{idx:02d}"
        rules = score_rules.get(q['question_id'], [])
        original_score = q.get('score', 0)
        
        add_weight = check_weighting(rules, service_offering)
        new_score = original_score * 1.25 if add_weight else original_score
        q['new_score'] = new_score

        if new_score < -1:
            q['new_category'] = 'Start_Doing'
        elif new_score > 1:
            q['new_category'] = 'Keep_Doing'
        else:
            q['new_category'] = 'Do_More'

    # 4. NEW: Create and run all LLM advice generation tasks concurrently
    tasks = [generate_advice_for_question(q, business_profile) for q in all_questions]
    results = await asyncio.gather(*tasks)

    # 5. Group results into phases and categories
    phase_map = {
        "Profitable": "Phase 1 (Profitable)",
        "Repeatable": "Phase 2 (Repeatable)",
        "Scalable": "Phase 3 (Scalable)"
    }
    phase_order = ["Profitable", "Repeatable", "Scalable"]
    phase_grouped = {phase: defaultdict(list) for phase in phase_order}

    for item in results:
        phase = item.get("catmapping")
        category = item.get("category")
        if phase in phase_grouped and category:
            phase_grouped[phase][category].append(item)

    # 6. Assemble the final advice text
    advice_text = "Based on your assessment results, here are your business recommendations:\n\n"
    for phase in phase_order:
        if not phase_grouped[phase]: continue
        phase_title = phase_map[phase]
        advice_text += f"=== {phase_title} ===\n"
        for category, items in sorted(phase_grouped[phase].items()):
            advice_text += f"\n【{category}】\n"
            for item in items:
                advice_text += f"- {item['question']}\n  {item['advice']}\n"
        advice_text += "\n"

    return LLMAdviceResponse(
        advice=advice_text,
        timestamp=datetime.utcnow().isoformat()
    )