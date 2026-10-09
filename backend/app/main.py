from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

from fastapi import Cookie, Depends, FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .db import Base, engine, get_db
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
)
from .schemas import (
    AnswerIn,
    AnswerOut,
    CompleteOut,
    ErrorResponse,
    LeaderboardRow,
    MeOut,
    MePatch,
    PathOut,
    PathSkill,
    PathUnit,
    ProfileOut,
    SessionStartOut,
)
from .seed import seed
from .services import (
    HEART_CAP,
    LEGENDARY_SECONDS,
    LEGENDARY_STRIKES,
    apply_heart_regen,
    award_xp,
    bump_streak,
    grade_exercise,
    lose_heart,
    maybe_unlocks,
    next_standard_lesson,
    ordered_skills,
    progress_map,
    public_exercise,
    session_exercise,
    skill_state,
    today_for,
    today_xp,
)

FRONTEND_ORIGINS = [
    o.strip()
    for o in (
        __import__("os").environ.get(
            "FRONTEND_ORIGIN",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001",
        )
    ).split(",")
    if o.strip()
]

app = FastAPI(title="Duolingo Clone API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(engine)
    db = next(get_db())
    try:
        seed(db)
    finally:
        db.close()


def err(status: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content=ErrorResponse(error={"code": code, "message": message}).model_dump(),
    )


def current_user(
    db: Session = Depends(get_db),
    learner_id: int | None = Cookie(default=None),
) -> User:
    uid = learner_id or 1
    user = db.get(User, uid)
    if not user:
        user = db.get(User, 1)
    apply_heart_regen(user)
    db.commit()
    db.refresh(user)
    return user


def me_out(db: Session, user: User) -> MeOut:
    return MeOut(
        id=user.id,
        username=user.username,
        display_name=user.display_name,
        avatar=user.avatar,
        xp=user.xp,
        gems=user.gems,
        hearts=user.hearts,
        streak=user.streak,
        last_activity_date=user.last_activity_date,
        daily_goal_xp=user.daily_goal_xp,
        today_xp=today_xp(db, user.id, today_for(user)),
        theme=user.theme,
    )


@app.get("/health")
def health():
    return {"ok": True, "db": Path(__file__).resolve().parent.parent.joinpath("app.db").exists()}


@app.get("/api/v1/me", response_model=MeOut)
def get_me(db: Session = Depends(get_db), user: User = Depends(current_user)):
    return me_out(db, user)


@app.patch("/api/v1/me", response_model=MeOut)
def patch_me(
    body: MePatch,
    response: Response,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
):
    if body.learner_id is not None:
        other = db.get(User, body.learner_id)
        if not other:
            return err(404, "not_found", "No learner with that id")
        response.set_cookie("learner_id", str(other.id), httponly=False, samesite="lax")
        apply_heart_regen(other)
        db.commit()
        return me_out(db, other)
    if body.daily_goal_xp is not None:
        user.daily_goal_xp = body.daily_goal_xp
    if body.theme is not None:
        user.theme = body.theme
    db.commit()
    db.refresh(user)
    return me_out(db, user)


@app.get("/api/v1/path", response_model=PathOut)
def get_path(db: Session = Depends(get_db), user: User = Depends(current_user)):
    units = db.scalars(select(Unit).order_by(Unit.index)).all()
    skills = ordered_skills(db)
    prog = progress_map(db, user.id)
    out_units: list[PathUnit] = []
    for unit in units:
        unit_skills = [s for s in skills if s.unit_id == unit.id]
        packed: list[PathSkill] = []
        for skill in unit_skills:
            p = prog.get(skill.id)
            crowns = p.crowns if p else 0
            state = skill_state(skills, prog, skill)
            nxt = next_standard_lesson(db, skill.id, crowns) if state != "locked" else None
            legendary = db.scalar(
                select(Lesson).where(Lesson.skill_id == skill.id, Lesson.kind == "legendary")
            )
            packed.append(
                PathSkill(
                    id=skill.id,
                    name=skill.name,
                    description=skill.description,
                    icon=skill.icon,
                    index=skill.index,
                    state=state,
                    crowns=crowns,
                    legendary_complete=bool(p and p.legendary_complete),
                    next_lesson_id=nxt.id if nxt else None,
                    legendary_lesson_id=legendary.id if legendary and crowns >= 1 else None,
                )
            )
        out_units.append(
            PathUnit(
                id=unit.id,
                index=unit.index,
                title=unit.title,
                description=unit.description,
                color=unit.color,
                skills=packed,
            )
        )
    return PathOut(course="Spanish", units=out_units)


def _start_session(db: Session, user: User, lesson: Lesson, kind: str) -> SessionStartOut | JSONResponse:
    apply_heart_regen(user)
    if kind != "legendary" and user.hearts <= 0:
        return err(409, "out_of_hearts", "You're out of hearts")
    exercises = list(
        db.scalars(select(Exercise).where(Exercise.lesson_id == lesson.id).order_by(Exercise.index)).all()
    )
    if not exercises:
        return err(400, "empty_lesson", "Lesson has no exercises")
    session = LessonSession(
        user_id=user.id,
        lesson_id=lesson.id,
        kind=kind,
        exercise_order=json.dumps([e.id for e in exercises]),
        cursor=0,
        mistakes=0,
        answered="[]",
        status="in_progress",
        time_limit_sec=LEGENDARY_SECONDS if kind == "legendary" else None,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    ex = exercises[0]
    return SessionStartOut(
        session_id=session.id,
        lesson_id=lesson.id,
        kind=kind,
        hearts=user.hearts,
        total=len(exercises),
        time_limit_sec=session.time_limit_sec,
        exercise=public_exercise(ex),
    )


@app.post("/api/v1/lessons/{lesson_id}/start")
def start_lesson(lesson_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)):
    lesson = db.get(Lesson, lesson_id)
    if not lesson or lesson.kind != "standard":
        return err(404, "not_found", "Lesson not found")
    return _start_session(db, user, lesson, "standard")


@app.post("/api/v1/skills/{skill_id}/legendary/start")
def start_legendary(skill_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)):
    p = db.scalar(
        select(UserSkillProgress).where(
            UserSkillProgress.user_id == user.id, UserSkillProgress.skill_id == skill_id
        )
    )
    if not p or p.crowns < 1:
        return err(409, "locked", "Finish a lesson on this skill first")
    lesson = db.scalar(select(Lesson).where(Lesson.skill_id == skill_id, Lesson.kind == "legendary"))
    if not lesson:
        return err(404, "not_found", "No legendary challenge")
    return _start_session(db, user, lesson, "legendary")


@app.get("/api/v1/sessions/{session_id}")
def get_session(session_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)):
    session = db.get(LessonSession, session_id)
    if not session or session.user_id != user.id:
        return err(404, "not_found", "Session not found")
    order = json.loads(session.exercise_order)
    ex = session_exercise(db, session)
    return {
        "session_id": session.id,
        "lesson_id": session.lesson_id,
        "kind": session.kind,
        "hearts": user.hearts,
        "total": len(order),
        "cursor": session.cursor,
        "mistakes": session.mistakes,
        "status": session.status,
        "time_limit_sec": session.time_limit_sec,
        "exercise": public_exercise(ex) if ex else None,
    }


@app.post("/api/v1/sessions/{session_id}/answer", response_model=AnswerOut)
def answer(
    session_id: int,
    body: AnswerIn,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
):
    session = db.get(LessonSession, session_id)
    if not session or session.user_id != user.id:
        return err(404, "not_found", "Session not found")
    if session.status != "in_progress":
        return err(409, "finished", "This lesson already ended")
    ex = session_exercise(db, session)
    if not ex or ex.id != body.exercise_id:
        return err(400, "wrong_exercise", "That is not the current exercise")
    payload = json.loads(ex.payload)
    correct = grade_exercise(ex.type, payload, ex.answer, body.answer)
    answered = json.loads(session.answered)
    answered.append({"id": ex.id, "correct": correct})
    session.answered = json.dumps(answered)
    failed = False
    if not correct:
        session.mistakes += 1
        if session.kind == "legendary":
            if session.mistakes >= LEGENDARY_STRIKES:
                session.status = "failed"
                failed = True
        else:
            lose_heart(user)
            if user.hearts <= 0:
                session.status = "failed"
                failed = True
    if not failed:
        session.cursor += 1
    done = session.cursor >= len(json.loads(session.exercise_order))
    if done and session.status == "in_progress":
        # wait for complete endpoint to award XP
        pass
    db.commit()
    nxt = None if done or failed else session_exercise(db, session)
    solution = payload.get("pairs") if ex.type == "match_pairs" else ex.answer
    return AnswerOut(
        correct=correct,
        solution=solution,
        hearts=user.hearts,
        mistakes=session.mistakes,
        done=done and not failed,
        failed=failed,
        next_exercise=public_exercise(nxt) if nxt else None,
    )


@app.post("/api/v1/sessions/{session_id}/complete", response_model=CompleteOut)
def complete(session_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)):
    session = db.get(LessonSession, session_id)
    if not session or session.user_id != user.id:
        return err(404, "not_found", "Session not found")
    if session.status == "failed":
        return err(409, "failed", "This lesson was lost")
    lesson = db.get(Lesson, session.lesson_id)
    already = session.status == "completed"
    perfect = session.mistakes == 0
    legendary = session.kind == "legendary"
    xp = 0
    if not already:
        order = json.loads(session.exercise_order)
        if session.cursor < len(order):
            return err(409, "incomplete", "Finish every exercise first")
        xp = lesson.xp_reward
        if perfect:
            xp += 5
        award_xp(db, user, xp, "legendary" if legendary else "lesson")
        bump_streak(user)
        session.status = "completed"
        session.completed_at = datetime.utcnow()
        skill = db.get(Skill, lesson.skill_id)
        p = db.scalar(
            select(UserSkillProgress).where(
                UserSkillProgress.user_id == user.id, UserSkillProgress.skill_id == skill.id
            )
        )
        if not p:
            p = UserSkillProgress(user_id=user.id, skill_id=skill.id, crowns=0)
            db.add(p)
            db.flush()
        if legendary:
            p.legendary_complete = True
        elif p.crowns < 5:
            p.crowns += 1
        db.commit()
        db.refresh(user)
        db.refresh(p)
    else:
        p = db.scalar(
            select(UserSkillProgress).where(
                UserSkillProgress.user_id == user.id, UserSkillProgress.skill_id == lesson.skill_id
            )
        )
    unlocked = maybe_unlocks(db, user, perfect=perfect, legendary=legendary)
    db.commit()
    return CompleteOut(
        xp_earned=xp if not already else 0,
        total_xp=user.xp,
        streak=user.streak,
        crowns=p.crowns if p else 0,
        perfect=perfect,
        legendary=legendary,
        achievements=unlocked,
        today_xp=today_xp(db, user.id, today_for(user)),
        daily_goal_xp=user.daily_goal_xp,
    )


@app.post("/api/v1/practice/refill", response_model=MeOut)
def refill(db: Session = Depends(get_db), user: User = Depends(current_user)):
    user.hearts = HEART_CAP
    user.hearts_updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return me_out(db, user)


@app.get("/api/v1/leaderboard", response_model=list[LeaderboardRow])
def leaderboard(db: Session = Depends(get_db), user: User = Depends(current_user)):
    rows = db.scalars(select(User).order_by(User.xp.desc(), User.id)).all()
    return [
        LeaderboardRow(
            rank=i,
            user_id=r.id,
            display_name=r.display_name,
            username=r.username,
            avatar=r.avatar,
            xp=r.xp,
            is_you=r.id == user.id,
        )
        for i, r in enumerate(rows, start=1)
    ]


@app.get("/api/v1/profile", response_model=ProfileOut)
def profile(db: Session = Depends(get_db), user: User = Depends(current_user)):
    crowns = db.scalar(
        select(func.coalesce(func.sum(UserSkillProgress.crowns), 0)).where(
            UserSkillProgress.user_id == user.id
        )
    ) or 0
    joined = db.scalar(
        select(func.count()).select_from(UserSkillProgress).where(UserSkillProgress.user_id == user.id)
    ) or 0
    unlocked_ids = set(
        db.scalars(
            select(UserAchievement.achievement_id).where(UserAchievement.user_id == user.id)
        ).all()
    )
    achs = db.scalars(select(Achievement).order_by(Achievement.id)).all()
    from .schemas import AchievementOut

    return ProfileOut(
        me=me_out(db, user),
        joined_skills=joined,
        crowns=int(crowns),
        achievements=[
            AchievementOut(
                code=a.code,
                name=a.name,
                description=a.description,
                icon=a.icon,
                unlocked=a.id in unlocked_ids,
            )
            for a in achs
        ],
    )


@app.post("/api/v1/debug/advance-day", response_model=MeOut)
def advance_day(db: Session = Depends(get_db), user: User = Depends(current_user)):
    user.day_offset += 1
    db.commit()
    db.refresh(user)
    return me_out(db, user)
