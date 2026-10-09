# Duolingo Web Clone

A functional clone of Duolingo’s web app: a winding skill path, a lesson player with five exercise types, XP / streak / hearts, and a seeded Spanish course.

Default learner is **Luna** (no login). Open the app and start the bouncing **Phrases** node.

## Demo

https://github.com/user-attachments/assets/demo.mp4

> **Watch the Demo:** [assets/demo.mp4](assets/demo.mp4)

<video src="assets/demo.mp4" controls="controls" width="100%"></video>


## Tech stack

- **Frontend:** Next.js (App Router, TypeScript, Tailwind CSS, Nunito)
- **Backend:** Python FastAPI + SQLAlchemy 2.0
- **Database:** SQLite (`backend/app.db`), created and seeded on API startup

## Setup

```bash
# backend
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 (or the port Next prints). The Next.js rewrite proxies `/api/*` to `http://127.0.0.1:8000`.

API docs (OpenAPI): http://127.0.0.1:8000/docs

```bash
cd backend
.venv\Scripts\python -m pytest -q
```

## Architecture

```
browser  →  Next.js (UI, server actions)  →  FastAPI /api/v1  →  SQLite
```

- Course content and learner progress live in SQLite.
- The lesson player is a session on the server (`lesson_sessions`). Hearts, XP, streaks, and crowns are never awarded by the client.
- FastAPI’s generated OpenAPI at `/docs` is the API contract.

## Database schema

- **users** — xp, gems, hearts (0–5), hearts_updated_at, streak, last_activity_date, daily_goal_xp, theme, day_offset
- **courses / units / skills / lessons / exercises** — ordered Spanish course; exercise `payload` is JSON per type
- **user_skill_progress** — unique (user_id, skill_id), crowns 0–5, legendary_complete
- **lesson_sessions** — in-flight cursor, mistakes, exercise_order
- **xp_events** — append-only XP (daily goal = sum for today)
- **achievements / user_achievements**

Constraints: FKs, hearts/crowns CHECKs, unique skill progress, indexes on `users.xp` and `xp_events(user_id, day)`.

## API overview

Prefix `/api/v1`. Errors: `{ "error": { "code", "message" } }`.

- `GET/PATCH /me` — HUD, daily goal, theme
- `GET /path` — units/skills with locked / current / complete + crowns
- `POST /lessons/{id}/start` — 409 if out of hearts
- `GET /sessions/{id}` — restore a lesson
- `POST /sessions/{id}/answer` — grade, maybe lose a heart
- `POST /sessions/{id}/complete` — XP, streak, crowns, achievements (idempotent)
- `POST /practice/refill` — mocked heart refill
- `POST /skills/{id}/legendary/start` — 90s timed challenge, 3 strikes
- `GET /leaderboard` — seeded users by XP
- `GET /profile` — stats + badges
- `POST /debug/advance-day` — shift simulated calendar for streak QA
- `GET /health`

## Seeded content

Spanish for English speakers, 3 units / 7 skills, two standard lessons + one legendary set each. Eight rival learners on the leaderboard. Luna starts with streak 3, 120 XP, 4 hearts, and 1 crown on Greetings.

## Assumptions

- One default logged-in learner via optional `learner_id` cookie (defaults to id=1).
- Audio is the browser `speechSynthesis` API (no audio files).
- Speech recognition, Super IAP, and friends are “Coming soon” routes.
- Hearts regenerate 1 per 4 hours, or instantly via Practice.
- Streak uses `last_activity_date` vs today (plus `day_offset` for demos).
- Duo path character is the official active-path SVG; audio uses the browser `speechSynthesis` API.

## Deployed demo

- App: https://duolingo-web.vercel.app
- API: https://duolingo-web-api.vercel.app (`/health`, `/docs`, `/api/v1/...`)

SQLite on Vercel lives in `/tmp` and reseeds on a cold start. For durable progress, point `DB_PATH` at a Railway volume instead.

## Deploy

- **Frontend:** Vercel, directory `frontend/`. Set `BACKEND_URL` to the API origin.
- **Backend:** Vercel FastAPI (`backend/`, `server.py` entrypoint) or Railway with `uvicorn app.main:app --host 0.0.0.0 --port $PORT` and a volume for `app.db`. Set `FRONTEND_ORIGIN` to the app URL.
