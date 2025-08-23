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
    raise ValueError("Please set COSMOS_ENDPOINT and COSMOS_KEY in the .env file.")

def upload_data():
    client = CosmosClient(url=ENDPOINT, credential=KEY)
    
    try:
        database = client.create_database(id=DATABASE_NAME)
    except CosmosResourceExistsError:
        database = client.get_database_client(database=DATABASE_NAME)

    # The partition key uses the 'question_id' field, which is most efficient for our queries.
    partition_key_path = PartitionKey(path="/question_id")
    try:
        container = database.create_container(id=CONTAINER_NAME, partition_key=partition_key_path)
    except CosmosResourceExistsError:
        container = database.get_container_client(container=CONTAINER_NAME)

    logging.info(f"Starting to read and upload data from '{SOURCE_FILE}'...")
    uploaded_count = 0
    with open(SOURCE_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            if not line.strip():
                continue
            
            item_from_source = json.loads(line)
            
            # Check if the 'id' field exists in the source item.
            if 'id' not in item_from_source:
                logging.warning(f"Skipping line due to missing 'id' field: {line.strip()}")
                continue

            # Prepare the document to be uploaded to Cosmos DB.
            # 1. Rename the 'id' field from the source data to 'question_id' to avoid conflicts
            #    with Cosmos DB's primary key 'id'.
            item_to_upload = {
                "question_id": item_from_source["id"],
                "category": item_from_source["category"],
                "text": item_from_source["text"]
            }
            
            # 2. Generate a unique UUID for the Cosmos DB primary key 'id'.
            item_to_upload['id'] = str(uuid.uuid4())

            try:
                container.upsert_item(body=item_to_upload)
                uploaded_count += 1
                logging.info(f"Successfully upserted item: cosmos_id='{item_to_upload['id']}', question_id='{item_to_upload['question_id']}'")
            except Exception as e:
                logging.error(f"Failed to upsert item: {e}")
    
    logging.info(f"Data upload complete. A total of {uploaded_count} records were processed.")

if __name__ == "__main__":
    upload_data()