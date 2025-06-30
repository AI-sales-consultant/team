import os
import json
import logging
import uuid
from dotenv import load_dotenv
from azure.cosmos import CosmosClient, PartitionKey
from azure.cosmos.exceptions import CosmosResourceExistsError

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
load_dotenv()

ENDPOINT = os.getenv("COSMOS_ENDPOINT")
KEY = os.getenv("COSMOS_KEY")
DATABASE_NAME = "PromptEngineeringDB"
CONTAINER_NAME = "answers"
SOURCE_FILE = "answers.jsonl"

if not all([ENDPOINT, KEY]):
    raise ValueError("请在 .env 文件中设置 COSMOS_ENDPOINT 和 COSMOS_KEY")

def upload_data():
    client = CosmosClient(url=ENDPOINT, credential=KEY)
    
    try:
        database = client.create_database(id=DATABASE_NAME)
    except CosmosResourceExistsError:
        database = client.get_database_client(database=DATABASE_NAME)

    # 分区键使用源数据中的 'id' 字段，这对于查询是最高效的
    partition_key_path = PartitionKey(path="/question_id")
    try:
        container = database.create_container(id=CONTAINER_NAME, partition_key=partition_key_path)
    except CosmosResourceExistsError:
        container = database.get_container_client(container=CONTAINER_NAME)

    logging.info(f"开始从 '{SOURCE_FILE}' 读取并上传数据...")
    uploaded_count = 0
    with open(SOURCE_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            if not line.strip():
                continue
            
            item_from_source = json.loads(line)
            
            # 检查源数据中是否存在 'id' 字段
            if 'id' not in item_from_source:
                logging.warning(f"跳过缺少 'id' 字段的行: {line.strip()}")
                continue

            # 准备要上传到 Cosmos DB 的文档
            # 1. 将源数据中的 'id' 字段重命名为 'question_id'，以避免与 Cosmos DB 的主键 'id' 冲突
            item_to_upload = {
                "question_id": item_from_source["id"],
                "category": item_from_source["category"],
                "text": item_from_source["text"]
            }
            
            # 2. 为 Cosmos DB 的主键 'id' 生成一个唯一的 UUID
            item_to_upload['id'] = str(uuid.uuid4())

            try:
                container.upsert_item(body=item_to_upload)
                uploaded_count += 1
                logging.info(f"成功上传项: cosmos_id='{item_to_upload['id']}', question_id='{item_to_upload['question_id']}'")
            except Exception as e:
                logging.error(f"上传项失败: {e}")
    
    logging.info(f"数据上传完成。总共处理了 {uploaded_count} 条记录。")

if __name__ == "__main__":
    upload_data()