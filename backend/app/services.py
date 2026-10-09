from __future__ import annotations

import json
import unicodedata
from datetime import date, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .models import (
    Achievement,
    Exercise,
    Lesson,
    LessonSession,
    Skill,
    Unit,
    User,
    UserAchievement,
    UserSkillProgress,
    XpEvent,
)

HEART_CAP = 5
HEART_REGEN_HOURS = 4
LEGENDARY_STRIKES = 3
LEGENDARY_SECONDS = 90


def today_for(user: User) -> date:
    return date.today() + timedelta(days=user.day_offset)


def fold(s: str) -> str:
    n = unicodedata.normalize("NFD", s.strip().lower())
    return "".join(c for c in n if unicodedata.category(c) != "Mn")


def grade_exercise(ex_type: str, payload: dict, expected: str, given) -> bool:
    if ex_type == "match_pairs":
        pairs = payload.get("pairs") or []
        want = {tuple(sorted((fold(a), fold(b)))) for a, b in pairs}
        got_iter = given if isinstance(given, list) else []
        got = {tuple(sorted((fold(str(a)), fold(str(b))))) for a, b in got_iter}
        return want == got and len(got) == len(want)
    if ex_type == "word_bank":
        if isinstance(given, list):
            text = " ".join(str(x) for x in given)
        else:
            text = str(given)
        return fold(text) == fold(expected)
    return fold(str(given)) == fold(expected)


def apply_heart_regen(user: User, now: datetime | None = None) -> None:
    now = now or datetime.utcnow()
    if user.hearts >= HEART_CAP:
        user.hearts_updated_at = now
        return
    elapsed = now - user.hearts_updated_at
    gained = int(elapsed.total_seconds() // (HEART_REGEN_HOURS * 3600))
    if gained <= 0:
        return
    user.hearts = min(HEART_CAP, user.hearts + gained)
    user.hearts_updated_at = now


def lose_heart(user: User) -> None:
    if user.hearts > 0:
        user.hearts -= 1
        user.hearts_updated_at = datetime.utcnow()


def bump_streak(user: User) -> None:
    today = today_for(user)
    last = user.last_activity_date
    if last == today:
        return
    if last == today - timedelta(days=1):
        user.streak += 1
    else:
        user.streak = 1
    user.last_activity_date = today


def today_xp(db: Session, user_id: int, day: date) -> int:
    return db.scalar(
        select(func.coalesce(func.sum(XpEvent.amount), 0)).where(
            XpEvent.user_id == user_id, XpEvent.day == day
        )
    ) or 0


def award_xp(db: Session, user: User, amount: int, source: str) -> None:
    user.xp += amount
    db.add(XpEvent(user_id=user.id, amount=amount, source=source, day=today_for(user)))


def unlock_achievement(db: Session, user: User, code: str) -> bool:
    ach = db.scalar(select(Achievement).where(Achievement.code == code))
    if not ach:
        return False
    exists = db.scalar(
        select(UserAchievement.id).where(
            UserAchievement.user_id == user.id,
            UserAchievement.achievement_id == ach.id,
        )
    )
    if exists:
        return False
    db.add(UserAchievement(user_id=user.id, achievement_id=ach.id))
    return True


def maybe_unlocks(db: Session, user: User, *, perfect: bool, legendary: bool) -> list[str]:
    codes: list[str] = []
    if unlock_achievement(db, user, "first_lesson"):
        codes.append("first_lesson")
    if user.streak >= 3 and unlock_achievement(db, user, "streak_3"):
        codes.append("streak_3")
    if user.xp >= 100 and unlock_achievement(db, user, "xp_100"):
        codes.append("xp_100")
    if perfect and unlock_achievement(db, user, "perfect_lesson"):
        codes.append("perfect_lesson")
    if legendary and unlock_achievement(db, user, "legendary"):
        codes.append("legendary")
    return codes


def ordered_skills(db: Session) -> list[Skill]:
    return list(
        db.scalars(
            select(Skill).join(Unit).order_by(Unit.index, Skill.index)
        ).all()
    )


def progress_map(db: Session, user_id: int) -> dict[int, UserSkillProgress]:
    rows = db.scalars(
        select(UserSkillProgress).where(UserSkillProgress.user_id == user_id)
    ).all()
    return {r.skill_id: r for r in rows}


def skill_state(skills: list[Skill], progress: dict[int, UserSkillProgress], skill: Skill) -> str:
    p = progress.get(skill.id)
    if p and p.crowns >= 1:
        return "complete"
    idx = next(i for i, s in enumerate(skills) if s.id == skill.id)
    if idx == 0:
        return "current"
    prev = skills[idx - 1]
    prev_p = progress.get(prev.id)
    if prev_p and prev_p.crowns >= 1:
        return "current" if not p or p.crowns == 0 else "complete"
    return "locked"


def next_standard_lesson(db: Session, skill_id: int, crowns: int) -> Lesson | None:
    lessons = list(
        db.scalars(
            select(Lesson)
            .where(Lesson.skill_id == skill_id, Lesson.kind == "standard")
            .order_by(Lesson.index)
        ).all()
    )
    if not lessons:
        return None
    return lessons[min(crowns, len(lessons) - 1)]


def public_exercise(ex: Exercise) -> dict:
    payload = json.loads(ex.payload)
    if ex.type == "match_pairs":
        left = [a for a, _ in payload.get("pairs", [])]
        right = [b for _, b in payload.get("pairs", [])]
        payload = {"left": left, "right": right}
    return {
        "id": ex.id,
        "type": ex.type,
        "prompt": ex.prompt,
        "prompt_language": ex.prompt_language,
        "payload": payload,
    }


def session_exercise(db: Session, session: LessonSession) -> Exercise | None:
    order = json.loads(session.exercise_order)
    if session.cursor >= len(order):
        return None
    return db.get(Exercise, order[session.cursor])
