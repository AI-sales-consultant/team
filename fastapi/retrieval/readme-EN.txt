Version: 1.0
Delivery Date: 2025-06-30
Owner: Data Access Engineer

1. Module Overview

This module, cosmos_retriever.py, provides a standalone function, get_answer_text, to retrieve predefined, generalized answer text from the answers container in Azure Cosmos DB.

Functionality: Performs an exact match based on question_id and category to return the corresponding text field.

Tech Stack: Python, azure-cosmos SDK.

2. Prerequisites

The backend service environment must meet the following requirements:

Python 3.8+ environment.

Network access to the public Azure Cosmos DB service endpoint.

Possession of the Cosmos DB account's Endpoint URI and Primary Key.

3. Installation and Configuration

3.1. Dependency Installation

Add the following dependencies to your requirements.txt file or install them directly via pip:

azure-cosmos
python-dotenv


3.2. Environment Variable Configuration

This module loads database credentials from environment variables. Configure the following two variables in your backend application's runtime environment:

COSMOS_ENDPOINT: The URI of your Azure Cosmos DB account.

COSMOS_KEY: The Primary Key of your Azure Cosmos DB account.

Example .env file:


COSMOS_ENDPOINT="https://<your-account-name>.documents.azure.com:443/"
COSMOS_KEY="<your-primary-key>"


The module automatically initializes a global database client upon loading to reuse connections and improve performance.

4. API Usage Guide

4.1. Importing the Function

Import the core function from the module into your backend code:


from cosmos_retriever import get_answer_text


4.2. Function Signature


def get_answer_text(question_id: str, category: str) -> str | None:


Parameters:

question_id (str): The business ID for the question, e.g., "question_00". This corresponds to the question_id field in the data source.

category (str): The category of the answer, e.g., "Start_Doing". This corresponds to the category field in the data source.

Return Value (str | None):

Success: If a matching record is found, returns the content of its text field (a string).

Failure or Not Found: If no matching record is found, or if a database error (e.g., connection issue) occurs during the query, returns None.

4.3. Usage Example

The following is a simplified example of how to call this function within a FastAPI endpoint:


# Simplified example of usage in FastAPI

from fastapi import FastAPI, HTTPException
from cosmos_retriever import get_answer_text
# Assuming a Pydantic model for the request body
from pydantic import BaseModel

class EnhanceRequest(BaseModel):
    question_id: str
    category: str
    # ... other fields

app = FastAPI()

@app.post("/enhance-answer")
async def enhance_answer(request: EnhanceRequest):
    # 1. Get parameters from the request
    q_id = request.question_id
    cat = request.category

    # 2. Call the data access function
    retrieved_text = get_answer_text(question_id=q_id, category=cat)

    # 3. Handle the result
    if retrieved_text is None:
        # If not found, return a 404 or other appropriate error
        # The logs will contain details (not found vs. database error)
        raise HTTPException(
            status_code=404, 
            detail=f"Answer not found for question_id='{q_id}' and category='{cat}'"
        )

    # 4. Use the retrieved text for subsequent processing (e.g., building a prompt)
    # ...
    # prompt = f"Context: {retrieved_text}\nUser Situation: ..."
    # ...

    return {"retrieved_text": retrieved_text, "status": "success"}

5. Data Contract

This module relies on a specific data structure within Cosmos DB.

Database: PromptEngineeringDB

Container: answers

Partition Key: /question_id

Expected Document Structure:


{
    "question_id": "question_00", // Query field
    "category": "Start_Doing",    // Query field
    "text": "...",                 // Returned field
    "id": "...",                  // Cosmos DB internal unique primary key
    // ... other metadata fields
}

6. Error Handling

Any exception (database connection failure, permission issues, query timeout, etc.) is caught.
Detailed information about the exception is logged to standard error via the logging module.
In all cases of an exception or if no data is found, the function uniformly returns None.

The caller only needs to check if the return value is None to determine if the data was successfully retrieved.