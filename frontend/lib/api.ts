export type Me = {
  id: number;
  username: string;
  display_name: string;
  avatar: string;
  xp: number;
  gems: number;
  hearts: number;
  streak: number;
  last_activity_date: string | null;
  daily_goal_xp: number;
  today_xp: number;
  theme: string;
};

export type PathSkill = {
  id: number;
  name: string;
  description: string;
  icon: string;
  index: number;
  state: "locked" | "current" | "complete";
  crowns: number;
  legendary_complete: boolean;
  next_lesson_id: number | null;
  legendary_lesson_id: number | null;
};

export type PathUnit = {
  id: number;
  index: number;
  title: string;
  description: string;
  color: string;
  skills: PathSkill[];
};

export type PathOut = {
  course: string;
  units: PathUnit[];
};

export type Exercise = {
  id: number;
  type: "multiple_choice" | "word_bank" | "match_pairs" | "fill_blank" | "type_answer";
  prompt: string;
  prompt_language: string;
  payload: Record<string, unknown>;
};

export type SessionStart = {
  session_id: number;
  lesson_id: number;
  kind: string;
  hearts: number;
  total: number;
  time_limit_sec: number | null;
  exercise: Exercise | null;
};

export type AnswerOut = {
  correct: boolean;
  solution: unknown;
  hearts: number;
  mistakes: number;
  done: boolean;
  failed: boolean;
  next_exercise: Exercise | null;
};

export type CompleteOut = {
  xp_earned: number;
  total_xp: number;
  streak: number;
  crowns: number;
  perfect: boolean;
  legendary: boolean;
  achievements: string[];
  today_xp: number;
  daily_goal_xp: number;
};

export type LeaderboardRow = {
  rank: number;
  user_id: number;
  display_name: string;
  username: string;
  avatar: string;
  xp: number;
  is_you: boolean;
};

export type Achievement = {
  code: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
};

export type Profile = {
  me: Me;
  joined_skills: number;
  crowns: number;
  achievements: Achievement[];
};

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data?.error?.code || "error", data?.error?.message || "Request failed");
  }
  return data as T;
}
