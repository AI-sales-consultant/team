from pathlib import Path
import json
import re
from langchain.text_splitter import MarkdownHeaderTextSplitter
from typing import List

def load_cleaned_data(file_path: Path) -> List[dict]:
    if file_path.suffix == ".jsonl":
        with open(file_path, 'r', encoding='utf-8') as f:
            return [json.loads(line) for line in f]
    else:  
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)

def split_content(entry, max_chunk_size=500):
    content = entry.get("content") or entry.get("text", "")
    title = entry.get("title", "")
    full_text = f"# {title}\n\n{content}" if title else content

    splitter = MarkdownHeaderTextSplitter(headers_to_split_on=[("#", "header")])
    chunks = splitter.split_text(full_text)

    split_records = []
    for i, chunk in enumerate(chunks):
        text = chunk.page_content.strip()
        if not text:
            continue

    
        sentences = re.split(r'(?<=[。！？!?;\.])\s*', text)
        for j, sentence in enumerate(sent for sent in sentences if sent.strip()):
            split_records.append({
                "id": f"{entry['id']}_chunk{i}_{j}",
                "industry":"tech_service",
                "source_document_name": entry.get("source_document_name", ""),
                "document_type": entry.get("document_type", ""),
                "text": sentence.strip(),
                "category": entry.get("category", ""),
                "advice_type": entry.get("advice_type", ""),
                "task_items": entry.get("task_items", [])
            })
    return split_records

def main():
    input_path = Path("output/AI Recruit sales plan.xlsx - Sales Plan.jsonl")
    output_path = Path("chunk") / f"{input_path.stem}_chunk.jsonl"
    output_path.parent.mkdir(exist_ok=True)

    data = load_cleaned_data(input_path)
    all_chunks = []

    for entry in data:
        chunks = split_content(entry)
        all_chunks.extend(chunks)

    with open(output_path, 'w', encoding='utf-8') as f:
        for chunk in all_chunks:
            f.write(json.dumps(chunk, ensure_ascii=False) + "\n")

    print(f" all {len(all_chunks)} chunks ，to {output_path}")

if __name__ == "__main__":
    main()
