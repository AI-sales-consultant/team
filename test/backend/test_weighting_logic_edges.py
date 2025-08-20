import app_main_under_test as appmod

def test_case_insensitive_and_whitespace_in_rules():
    """Rules are normalized (trimmed/condensed/lower-cased); user answer is lower-cased per implementation."""
    rules = ["R2 -  A  or   B  "]
    service_offering = {"field1": {"question_name": "R2", "anwserselete": "a"}}
    assert appmod.check_weighting(rules, service_offering) == 1

def test_rule_without_dash_is_ignored():
    """Rules without a '-' are ignored and should not contribute to the score."""
    rules = ["R3", ""]
    service_offering = {"f": {"question_name": "R3", "anwserselete": "A"}}
    assert appmod.check_weighting(rules, service_offering) == 0

def test_unknown_question_name_does_not_match():
    """Unknown question_name in service offering should not match a rule."""
    rules = ["R12 - X or Y"]
    service_offering = {"f": {"question_name": "R99", "anwserselete": "X"}}
    assert appmod.check_weighting(rules, service_offering) == 0
