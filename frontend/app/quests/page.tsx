import { AppShell, RightRail } from "@/components/app-shell";
import { ChestIcon } from "@/components/icons";
import { sget } from "@/lib/server";
import type { Me } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function QuestsPage() {
  const me = await sget<Me>("/api/v1/me");
  const pct = Math.min(100, (me.today_xp / Math.max(1, me.daily_goal_xp)) * 100);
  return (
    <AppShell me={me} right={<RightRail me={me} />}>
        <h1 className="text-[28px] font-extrabold">Daily Quests</h1>
        <p className="mt-1 font-bold text-muted">Finish quests to earn extra XP. Friends quests coming soon.</p>
        <div className="mt-6 rounded-[16px] border-2 border-border p-5">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-[16px] bg-[#fff4d4]">
              <ChestIcon />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold">Earn {me.daily_goal_xp} XP</p>
              <div className="mt-2 h-4 overflow-hidden rounded-full bg-[var(--locked)]">
                <div className="relative h-full rounded-full bg-gold" style={{ width: `${pct}%` }}>
                  <span className="absolute top-1 left-2 right-2 h-1 rounded-full bg-white/40" />
                </div>
              </div>
              <p className="mt-1 text-sm font-extrabold tabular text-muted">
                {me.today_xp} / {me.daily_goal_xp} XP
              </p>
            </div>
          </div>
        </div>
      </AppShell>
  );
}
