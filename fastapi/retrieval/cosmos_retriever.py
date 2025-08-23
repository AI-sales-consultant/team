# --- Configuration ---
import os
import logging
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv
from azure.cosmos import CosmosClient, ContainerProxy

load_dotenv()
ENDPOINT = os.getenv("COSMOS_ENDPOINT")
KEY = os.getenv("COSMOS_KEY")
DATABASE_NAME = "PromptEngineeringDB"
CONTAINER_NAME = "answers"

# --- Global Client Instance ---
# In a production environment (e.g., a FastAPI application), the CosmosClient instance
# should be initialized once at application startup and reused globally. This singleton-like
# pattern is a best practice that prevents the performance overhead of creating a new
# database connection for each request.
client: Optional[CosmosClient] = None
container_client: Optional[ContainerProxy] = None

try:
    if ENDPOINT and KEY:
    client = CosmosClient(url=ENDPOINT, credential=KEY)
    database_client = client.get_database_client(DATABASE_NAME)
    container_client = database_client.get_container_client(CONTAINER_NAME)
    logging.info("Cosmos DB client initialized successfully for cosmos_retriever module.")
    else:
        logging.error("Missing required environment variables: COSMOS_ENDPOINT or COSMOS_KEY")
except Exception as e:
    client = None
    container_client = None
    logging.error(f"Failed to initialize Cosmos DB client: {e}")

def get_answer_text(question_id: str, category: str) -> Optional[str]:
    """
    Retrieves a unique, generalized answer text from Cosmos DB based on question_id and category.

    Args:
        question_id (str): The ID of the question, e.g., 'question_00'.
        category (str): The category of the answer, e.g., 'Start_Doing'.

    Returns:
        Optional[str]: The answer text if found, otherwise None.
    """
    if not container_client:
        logging.error("Database client is not initialized; cannot execute query.")
        return None

    # 1. Construct a parameterized SQL query to prevent SQL injection.
    query = (
        "SELECT c.text FROM c "
        "WHERE c.question_id = @question_id AND c.category = @category"
    )
    parameters: List[Dict[str, Any]] = [
        {"name": "@question_id", "value": question_id},
        {"name": "@category", "value": category},
    ]
    try:
        # 2. Execute the query.
        items = list(container_client.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        ))
        # 3. Process and validate the query results.
        if not items:
            logging.warning(f"No match found for: question_id='{question_id}', category='{category}'")
            return None
        # This check is a safeguard for data integrity. We expect only one unique answer.
        if len(items) > 1:
            logging.warning(
                f"Found {len(items)} matches, but expected 1. Returning the first result. "
                f"Query: question_id='{question_id}', category='{category}'"
            )
        # Return the 'text' field from the first record.
        return items[0].get("text")

    except Exception as e:
        logging.error(f"An error occurred during database query execution: {e}")
        return None