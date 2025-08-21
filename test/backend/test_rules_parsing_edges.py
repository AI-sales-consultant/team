import builtins
from unittest.mock import patch, mock_open
import app_main_under_test as appmod

def test_load_rules_handles_bom_and_header_skip():
    """CSV with BOM and header: rows should be parsed and header skipped."""
    bom_csv = "\ufeffquestion_id,rule1,rule2\nq1,R2 - A or B,R3 - C\nq2,R4 - B,\n"
    with patch.object(builtins, "open", mock_open(read_data=bom_csv)):
        rules = appmod.load_score_rules("any.csv")
    assert rules["q1"] == ["R2 - A or B", "R3 - C"]
    # Second row has empty rule2; implementation keeps an empty string for row[1:]
    assert rules["q2"] == ["R4 - B", ""]

def test_duplicate_question_id_last_wins():
    """If the same question_id appears multiple times, the later row overwrites the earlier one."""
    csv_text = "question_id,rule1,rule2\nq1,R2 - A,\nq1,R3 - B or C,R12 - A\n"
    with patch.object(builtins, "open", mock_open(read_data=csv_text)):
        rules = appmod.load_score_rules("dup.csv")
    assert rules["q1"] == ["R3 - B or C", "R12 - A"]

def test_row_with_only_qid_has_empty_rules_list():
    """A row that only contains question_id and no further columns should map to an empty list."""
    csv_text = "question_id,rule1,rule2\nqX\n"
    with patch.object(builtins, "open", mock_open(read_data=csv_text)):
        rules = appmod.load_score_rules("only_qid.csv")
    assert rules["qX"] == []
