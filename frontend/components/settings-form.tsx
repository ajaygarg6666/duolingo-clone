"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { advanceDay, saveSettings } from "@/app/actions";
import type { Me } from "@/lib/api";
import { DuoButton } from "./duo-button";

export function SettingsForm({ me }: { me: Me }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");

  async function patch(body: { daily_goal_xp?: number; theme?: string }) {
    if (body.theme === "dark" || body.theme === "light") {
      document.documentElement.setAttribute("data-theme", body.theme);
    }
    await saveSettings(body);
    setMsg("Saved");
    router.refresh();
  }

  return (
    <>
      <section className="mt-6 max-w-lg rounded-2xl border-2 border-border p-5">
        <h2 className="font-extrabold">Daily goal</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[10, 20, 30, 50].map((n) => (
            <DuoButton
              key={n}
              variant={me.daily_goal_xp === n ? "primary" : "secondary"}
              onClick={() => patch({ daily_goal_xp: n })}
            >
              {n} XP
            </DuoButton>
          ))}
        </div>
      </section>
      <section className="mt-4 max-w-lg rounded-2xl border-2 border-border p-5">
        <h2 className="font-extrabold">Appearance</h2>
        <div className="mt-3 flex gap-2">
          <DuoButton variant={me.theme === "light" ? "primary" : "secondary"} onClick={() => patch({ theme: "light" })}>
            Light
          </DuoButton>
          <DuoButton variant={me.theme === "dark" ? "primary" : "secondary"} onClick={() => patch({ theme: "dark" })}>
            Dark
          </DuoButton>
        </div>
      </section>
      <section className="mt-4 max-w-lg rounded-2xl border-2 border-border p-5">
        <h2 className="font-extrabold">Notifications</h2>
        <p className="mt-1 text-muted">Streak reminders and friend invites are coming soon.</p>
      </section>
      <section className="mt-4 max-w-lg rounded-2xl border-2 border-border p-5">
        <h2 className="font-extrabold">Demo tools</h2>
        <p className="mt-1 text-sm text-muted">Advance the simulated calendar to test streak reset.</p>
        <DuoButton
          className="mt-3"
          variant="secondary"
          onClick={async () => {
            await advanceDay();
            setMsg("Simulated a new day. Complete a lesson to test streak.");
            router.refresh();
          }}
        >
          Advance one day
        </DuoButton>
      </section>
      {msg ? <p className="mt-4 font-bold text-green">{msg}</p> : null}
    </>
  );
}
