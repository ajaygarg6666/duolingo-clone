import { AppShell, RightRail } from "@/components/app-shell";
import { ShieldIcon } from "@/components/icons";
import { LeagueTable } from "@/components/league-table";
import { sget } from "@/lib/server";
import type { LeaderboardRow, Me } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const [me, rows] = await Promise.all([
    sget<Me>("/api/v1/me"),
    sget<LeaderboardRow[]>("/api/v1/leaderboard"),
  ]);
  return (
    <AppShell me={me} right={<RightRail me={me} />}>
      <div className="mb-6 flex flex-col items-center text-center">
        <ShieldIcon />
        <h1 className="mt-2 text-[28px] font-extrabold">Pearl League</h1>
        <p className="font-bold text-muted">Live XP. Climb to stay in the league.</p>
      </div>
      <LeagueTable initial={rows} />
    </AppShell>
  );
}
