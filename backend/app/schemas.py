from datetime import date
from typing import Any, Literal

from pydantic import BaseModel, Field

ExerciseType = Literal[
    "multiple_choice",
    "word_bank",
    "match_pairs",
    "fill_blank",
    "type_answer",
]


class ErrorBody(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    error: ErrorBody


class MeOut(BaseModel):
    id: int
    username: str
    display_name: str
    avatar: str
    xp: int
    gems: int
    hearts: int
    streak: int
    last_activity_date: date | None
    daily_goal_xp: int
    today_xp: int
    theme: str


class MePatch(BaseModel):
    daily_goal_xp: int | None = Field(default=None, ge=10, le=50)
    theme: Literal["light", "dark"] | None = None
    learner_id: int | None = None


class ExercisePublic(BaseModel):
    id: int
    type: ExerciseType
    prompt: str
    prompt_language: str
    payload: dict[str, Any]


class SessionStartOut(BaseModel):
    session_id: int
    lesson_id: int
    kind: str
    hearts: int
    total: int
    time_limit_sec: int | None
    exercise: ExercisePublic


class AnswerIn(BaseModel):
    exercise_id: int
    answer: Any


class AnswerOut(BaseModel):
    correct: bool
    solution: Any
    hearts: int
    mistakes: int
    done: bool
    failed: bool
    next_exercise: ExercisePublic | None = None


class CompleteOut(BaseModel):
    xp_earned: int
    total_xp: int
    streak: int
    crowns: int
    perfect: bool
    legendary: bool
    achievements: list[str]
    today_xp: int
    daily_goal_xp: int


class PathSkill(BaseModel):
    id: int
    name: str
    description: str
    icon: str
    index: int
    state: Literal["locked", "current", "complete"]
    crowns: int
    legendary_complete: bool
    next_lesson_id: int | None
    legendary_lesson_id: int | None


class PathUnit(BaseModel):
    id: int
    index: int
    title: str
    description: str
    color: str
    skills: list[PathSkill]


class PathOut(BaseModel):
    course: str
    units: list[PathUnit]


class LeaderboardRow(BaseModel):
    rank: int
    user_id: int
    display_name: str
    username: str
    avatar: str
    xp: int
    is_you: bool


class AchievementOut(BaseModel):
    code: str
    name: str
    description: str
    icon: str
    unlocked: bool


class ProfileOut(BaseModel):
    me: MeOut
    joined_skills: int
    crowns: int
    achievements: list[AchievementOut]
