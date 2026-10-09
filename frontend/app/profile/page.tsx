import { AppShell } from "@/components/app-shell";
import { FireIcon, GemIcon, OwlLogo } from "@/components/icons";
import { sget } from "@/lib/server";
import type { Profile } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await sget<Profile>("/api/v1/profile");
  const me = profile.me;
  return (
    <AppShell me={me}>
        <div className="flex items-center gap-4 border-b-2 border-border pb-6">
          <OwlLogo className="h-[88px] w-[88px]" />
          <div>
            <h1 className="text-[28px] font-extrabold leading-tight">{me.display_name}</h1>
            <p className="font-bold text-muted">@{me.username}</p>
            <p className="mt-1 text-sm font-bold text-hint">Joined Spanish · {profile.joined_skills} skills</p>
          </div>
        </div>
        <h2 className="mt-8 text-xl font-extrabold">Statistics</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Stat icon={<FireIcon />} value={me.streak} label="Day streak" />
          <Stat value={me.xp} label="Total XP" />
          <Stat value={profile.crowns} label="Crowns" />
          <Stat icon={<GemIcon className="h-6 w-6" />} value={me.gems} label="Gems" />
        </div>
        <h2 className="mt-10 text-xl font-extrabold">Achievements</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {profile.achievements.map((a) => (
            <div
              key={a.code}
              className={`rounded-[16px] border-2 p-4 ${a.unlocked ? "border-gold bg-[var(--wash)]" : "border-border opacity-45"}`}
            >
              <p className="font-extrabold">{a.name}</p>
              <p className="mt-1 text-sm font-bold text-muted">{a.description}</p>
            </div>
          ))}
        </div>
      </AppShell>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return (
    <div className="rounded-[16px] border-2 border-border px-4 py-3">
      <div className="flex items-center gap-2 text-[22px] font-extrabold tabular">
        {icon}
        {value}
      </div>
      <p className="text-sm font-extrabold uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}
