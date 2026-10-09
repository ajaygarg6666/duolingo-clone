"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { spost } from "@/lib/server";

const BACKEND = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function startLessonAction(lessonId: number) {
  const s = await spost<{ session_id: number }>(`/api/v1/lessons/${lessonId}/start`);
  redirect(`/lesson/${s.session_id}`);
}

export async function startLegendaryAction(skillId: number) {
  const s = await spost<{ session_id: number }>(`/api/v1/skills/${skillId}/legendary/start`);
  redirect(`/legendary/${s.session_id}`);
}

export async function refillHearts() {
  await spost("/api/v1/practice/refill");
}

export async function saveSettings(body: { daily_goal_xp?: number; theme?: string }) {
  const res = await fetch(`${BACKEND}/api/v1/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Could not save");
  if (body.theme === "dark" || body.theme === "light") {
    (await cookies()).set("theme", body.theme, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
}

export async function advanceDay() {
  await spost("/api/v1/debug/advance-day");
}
