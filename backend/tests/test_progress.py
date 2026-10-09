import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services import bump_streak, grade_exercise, lose_heart, apply_heart_regen, HEART_CAP
from app.models import User
from datetime import date, datetime, timedelta


def test_grade_types():
    assert grade_exercise("type_answer", {}, "Hola", "hola")
    assert grade_exercise("type_answer", {}, "Adiós", "adios")
    assert not grade_exercise("type_answer", {}, "Hola", "Adios")
    assert grade_exercise("word_bank", {}, "Yo soy un gato", ["Yo", "soy", "un", "gato"])
    assert grade_exercise(
        "match_pairs",
        {"pairs": [["Hola", "Hello"], ["Gato", "Cat"]]},
        "",
        [["Cat", "Gato"], ["Hello", "Hola"]],
    )
    assert not grade_exercise(
        "match_pairs",
        {"pairs": [["Hola", "Hello"], ["Gato", "Cat"]]},
        "",
        [["Hola", "Cat"]],
    )


def test_hearts_and_streak():
    u = User(
        username="t",
        display_name="t",
        hearts=2,
        hearts_updated_at=datetime.utcnow() - timedelta(hours=9),
        streak=3,
        last_activity_date=date.today() - timedelta(days=1),
        day_offset=0,
        xp=0,
        gems=0,
        daily_goal_xp=20,
        theme="light",
        avatar="owl",
    )
    apply_heart_regen(u)
    assert u.hearts == 4
    lose_heart(u)
    assert u.hearts == 3
    u.hearts = HEART_CAP
    lose_heart(u)
    assert u.hearts == 4
    bump_streak(u)
    assert u.streak == 4
    bump_streak(u)
    assert u.streak == 4
    u.last_activity_date = date.today() - timedelta(days=3)
    bump_streak(u)
    assert u.streak == 1


if __name__ == "__main__":
    test_grade_types()
    test_hearts_and_streak()
    print("ok")
