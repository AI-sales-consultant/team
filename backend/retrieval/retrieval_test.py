from cosmos_retriever import get_answer_text

if __name__ == "__main__":
    print("--- Test Case 1: Successful data retrieval ---")
    q_id_1 = "question_01"
    cat_1 = "Start_Doing"
    answer_1 = get_answer_text(question_id=q_id_1, category=cat_1)
    
    if answer_1:
        print(f"Query result for ('{q_id_1}', '{cat_1}'):")
        print(answer_1)
    else:
        print(f"Result for ('{q_id_1}', '{cat_1}') not found.")

    print("\n" + "="*40 + "\n")

    print("--- Test Case 2: Data does not exist ---")
    q_id_2 = "question_99"
    cat_2 = "Non_Existent_Category"
    answer_2 = get_answer_text(question_id=q_id_2, category=cat_2)

    if answer_2:
        print(f"Query result for ('{q_id_2}', '{cat_2}'):")
        print(answer_2)
    else:
        print(f"Result for ('{q_id_2}', '{cat_2}') not found.")
        
    print("\n" + "="*40 + "\n")

    print("--- Test Case 3: Query for data with potential duplicates ---")
    q_id_3 = "question_00"
    cat_3 = "Do_More"
    answer_3 = get_answer_text(question_id=q_id_3, category=cat_3)

    if answer_3:
        print(f"Query result for ('{q_id_3}', '{cat_3}'): (Should return the first match)")
        print(answer_3)
    else:
        print(f"Result for ('{q_id_3}', '{cat_3}') not found.")