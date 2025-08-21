
def test_bias_len_delta_lt_10pct():
    a = ["abcde","fghij","klmno"]
    b = ["pqrst","uvwxy","zzzzz"]
    al = sum(len(x) for x in a)/len(a)
    bl = sum(len(x) for x in b)/len(b)
    delta = abs(al-bl)/max(al,bl)*100
    assert delta < 10.0
