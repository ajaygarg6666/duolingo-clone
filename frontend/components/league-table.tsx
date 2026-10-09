"use client";

import { useEffect, useState } from "react";
import type { LeaderboardRow } from "@/lib/api";
import { OwlLogo } from "./icons";

export function LeagueTable({ initial }: { initial: LeaderboardRow[] }) {
  const [rows, setRows] = useState(initial);

  useEffect(() => {
    const t = setInterval(async () => {
      const res = await fetch("/api/v1/leaderboard", { credentials: "include" });
      if (res.ok) setRows(await res.json());
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="overflow-hidden rounded-[16px] border-2 border-border">
      {rows.map((row) => (
        <div
          key={row.user_id}
          className={`flex items-center gap-4 border-b-2 border-border px-4 py-3 last:border-b-0 ${
            row.is_you ? "bg-selected" : "bg-surface"
          }`}
        >
          <span className={`w-8 text-[17px] font-extrabold tabular ${rankColor(row.rank)}`}>{row.rank}</span>
          <OwlLogo className="h-10 w-10" />
          <div className="flex-1">
            <p className="font-extrabold">
              {row.display_name}
              {row.is_you ? <span className="ml-2 text-sm text-blue">YOU</span> : null}
            </p>
          </div>
          <span className="font-extrabold tabular text-hint">{row.xp} XP</span>
        </div>
      ))}
    </div>
  );
}

function rankColor(rank: number) {
  if (rank === 1) return "text-gold";
  if (rank === 2) return "text-muted";
  if (rank === 3) return "text-orange";
  return "text-hint";
}
