from cosmos_retriever import get_answer_text

if __name__ == "__main__":
    print("--- 测试用例 1: 成功找到数据 ---")
    q_id_1 = "question_01"
    cat_1 = "Start_Doing"
    answer_1 = get_answer_text(question_id=q_id_1, category=cat_1)
    
    if answer_1:
        print(f"查询结果 for ('{q_id_1}', '{cat_1}'):")
        print(answer_1)
    else:
        print(f"未找到 ('{q_id_1}', '{cat_1}') 的结果。")

    print("\n" + "="*40 + "\n")

    print("--- 测试用例 2: 数据不存在 ---")
    q_id_2 = "question_99"
    cat_2 = "Non_Existent_Category"
    answer_2 = get_answer_text(question_id=q_id_2, category=cat_2)

    if answer_2:
        print(f"查询结果 for ('{q_id_2}', '{cat_2}'):")
        print(answer_2)
    else:
        print(f"未找到 ('{q_id_2}', '{cat_2}') 的结果。")
        
    print("\n" + "="*40 + "\n")

    print("--- 测试用例 3: 存在重复数据的查询 ---")
    q_id_3 = "question_00"
    cat_3 = "Do_More"
    answer_3 = get_answer_text(question_id=q_id_3, category=cat_3)

    if answer_3:
        print(f"查询结果 for ('{q_id_3}', '{cat_3}'): (应返回第一条)")
        print(answer_3)
    else:
        print(f"未找到 ('{q_id_3}', '{cat_3}') 的结果。")