
import re
def redact(s:str)->str:
    s = re.sub(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", "[EMAIL]", s)
    s = re.sub(r"\b(\+?\d[\d -]{8,}\d)\b", "[PHONE]", s)
    return s
def test_redaction():
    x = redact("mail me a@b.com or +44 7911 123456")
    assert "[EMAIL]" in x and "[PHONE]" in x
