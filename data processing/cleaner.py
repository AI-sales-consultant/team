# data_processing/cleaner.py

import os
import json
import pandas as pd
from pathlib import Path
from bs4 import BeautifulSoup

def clean_txt(file_path: Path):
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read().strip()
    return [{"content": text}]

def clean_json(file_path: Path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    cleaned = []
    for item in data:
        if "instruction" in item and "response" in item:
            content = f"Instruction: {item.get('instruction', '')}\nInput: {item.get('input', '')}\nResponse: {item.get('response', '')}"
        else:
            content = item.get("content", "") or item.get("text", "")
        if content:
            cleaned.append({"content": content})
    return cleaned

def clean_csv(file_path: Path):
    try:
        df = pd.read_csv(file_path)
        print("actually name：", df.columns.tolist())
    except Exception as e:
        print(f"{file_path.name}，wrong: {e}")
        return []

    df.dropna(how="all", inplace=True)

    cleaned = []
    for idx, row in df.iterrows():
        for category in ["Start_Doing", "Do_More", "Keep_Doing"]:  
            # confirm this is not empty
            if category in df.columns and pd.notna(row[category]) and str(row[category]).strip():
                cleaned.append({
                    "id": f"question_{idx:02d}",
                    "category": category,
                    "text": str(row[category]).strip()
                })

    return cleaned


def clean_excel(file_path: Path):
    try:
        df = pd.read_excel(file_path, engine="openpyxl")
    except Exception as e:
        print(f"cannot read excel {file_path.name}，wrong: {e}")
        return []

    cleaned = []
    for _, row in df.iterrows():
        cleaned.append({
            "content": row.get("content", "") or row.get("text", "")
        })
    return cleaned

def clean_html(file_path: Path):
    with open(file_path, 'r', encoding='utf-8') as f:
        html = f.read()

    soup = BeautifulSoup(html, 'html.parser')

    # delete useless label
    for tag in soup(["script", "style", "nav", "footer", "header", "noscript"]):
        tag.decompose()

    body_text = soup.body.get_text(separator=' ', strip=True) if soup.body else soup.get_text(separator=' ', strip=True)
    return [{"content": body_text}]

def main():
    input_dir = Path("data")
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)

    for file_path in input_dir.iterdir():
        print(f"Processing: {file_path.name}")
        ext = file_path.suffix.lower()
        records = []

        if ext == ".txt":
            records = clean_txt(file_path)
        elif ext == ".json":
            records = clean_json(file_path)
        elif ext == ".csv":
            records = clean_csv(file_path)
        elif ext in [".xls", ".xlsx"]:
            records = clean_excel(file_path)
        elif ext in [".html", ".htm"]:
            records = clean_html(file_path)
        else:
            print(f"Skip unsupported file types: {file_path.name}")
            continue

        #Output as a JSONL file (one JSON object per line)
        output_path = output_dir / f"{file_path.stem}.jsonl"
        with open(output_path, 'w', encoding='utf-8') as f:
            for rec in records:
                f.write(json.dumps(rec, ensure_ascii=False) + "\n")

        print(f"finish cleaning：{file_path.name} → {output_path}(Total {len(records)} records)")

if __name__ == "__main__":
    main()

