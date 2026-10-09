from fastapi.testclient import TestClient

from app.main import app


def test_lesson_loop_awards_xp():
    c = TestClient(app)
    before = c.get("/api/v1/me").json()["xp"]
    s = c.post("/api/v1/lessons/4/start").json()
    assert "session_id" in s
    ex = s["exercise"]
    done = False
    for _ in range(20):
        payload = ex["payload"]
        typ = ex["type"]
        if typ in ("multiple_choice", "fill_blank"):
            ans = payload["options"][0]
        elif typ == "word_bank":
            ans = payload["bank"][:1]
        elif typ == "match_pairs":
            ans = list(zip(payload["left"], payload["right"]))
        else:
            ans = "nope"
        r = c.post(
            f"/api/v1/sessions/{s['session_id']}/answer",
            json={"exercise_id": ex["id"], "answer": ans},
        ).json()
        if r.get("failed"):
            refill = c.post("/api/v1/practice/refill")
            assert refill.status_code == 200
            return
        if r["done"]:
            done = True
            break
        ex = r["next_exercise"]
    assert done
    out = c.post(f"/api/v1/sessions/{s['session_id']}/complete").json()
    assert out["xp_earned"] >= 10
    assert out["total_xp"] >= before + 10
    assert out["streak"] >= 1
