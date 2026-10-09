"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { Me } from "@/lib/api";
import {
  ChestIcon,
  DumbbellIcon,
  FireIcon,
  FlagES,
  GemIcon,
  HeartIcon,
  HomeIcon,
  LightningIcon,
  MoreIcon,
  OwlMascot,
  PersonIcon,
  ShieldIcon,
  ShopIcon,
} from "./icons";

const NAV = [
  { href: "/", label: "Learn", icon: HomeIcon },
  { href: "/practice", label: "Practice", icon: DumbbellIcon },
  { href: "/leaderboard", label: "Leaderboards", icon: ShieldIcon },
  { href: "/quests", label: "Quests", icon: ChestIcon },
  { href: "/shop", label: "Shop", icon: ShopIcon },
  { href: "/profile", label: "Profile", icon: PersonIcon },
];

export function AppShell({
  me,
  children,
  right,
}: {
  me: Me;
  children: ReactNode;
  right?: ReactNode;
}) {
  const path = usePathname();

  return (
    <div className="min-h-screen bg-snow text-ink">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[256px] border-r-2 border-border bg-snow px-4 py-6 lg:flex lg:flex-col">
        <Link href="/" className="mb-8 px-3">
          <span className="text-[32px] font-extrabold leading-none tracking-tight text-green">duolingo</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = item.href === "/" ? path === "/" : path.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-[12px] border-2 px-3 py-2.5 text-[15px] font-extrabold uppercase tracking-[0.8px] ${
                  active ? "border-selected bg-selected text-blue" : "border-transparent text-ink hover:bg-[var(--wash)]"
                }`}
              >
                <Icon />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/settings"
          className={`flex items-center gap-3 rounded-[12px] border-2 px-3 py-2.5 text-[15px] font-extrabold uppercase tracking-[0.8px] ${
            path.startsWith("/settings")
              ? "border-selected bg-selected text-blue"
              : "border-transparent text-ink hover:bg-[var(--wash)]"
          }`}
        >
          <MoreIcon />
          More
        </Link>
      </aside>

      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b-2 border-border bg-snow px-3 py-2 xl:hidden lg:ml-[256px]">
        <FlagES />
        <HudStat icon={<FireIcon className="h-5 w-5" />} value={me.streak} color="text-orange" />
        <HudStat icon={<GemIcon className="h-5 w-5" />} value={me.gems} color="text-blue" />
        <HudStat icon={<HeartIcon className="h-5 w-5" />} value={me.hearts} color="text-red" />
      </header>

      <div className="lg:ml-[256px]">
        <div className="mx-auto flex max-w-[1020px] justify-center gap-6 px-4 pt-6">
          <main className="min-w-0 w-full max-w-[598px] pb-28">{children}</main>
          {right ? <aside className="sticky top-6 hidden h-fit w-[368px] shrink-0 xl:block">{right}</aside> : null}
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t-2 border-border bg-snow lg:hidden">
        {NAV.map((item) => {
          const active = item.href === "/" ? path === "/" : path.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[9px] font-extrabold uppercase tracking-wide ${
                active ? "text-blue" : "text-muted"
              }`}
            >
              <Icon />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function HudStat({ icon, value, color }: { icon: ReactNode; value: number; color: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-[17px] font-extrabold tabular ${color}`}>
      {icon}
      <span>{value}</span>
    </div>
  );
}

export function RightRail({
  me,
  goalHref = "/quests",
  showSuper = true,
}: {
  me: Me;
  goalHref?: string;
  showSuper?: boolean;
}) {
  const pct = Math.min(100, Math.round((me.today_xp / Math.max(1, me.daily_goal_xp)) * 100));
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <FlagES />
        <HudStat icon={<FireIcon />} value={me.streak} color="text-orange" />
        <HudStat icon={<GemIcon />} value={me.gems} color="text-blue" />
        <HudStat icon={<HeartIcon />} value={me.hearts} color="text-red" />
      </div>

      {showSuper ? (
        <div className="overflow-hidden rounded-[16px] border-2 border-border p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[1px] text-[#ce82ff]">Super</p>
              <p className="mt-1 text-lg font-extrabold leading-tight">Try Super for free</p>
              <p className="mt-1 text-sm font-bold text-muted">No ads, personalized practice, and unlimited Legendary!</p>
            </div>
            <OwlMascot className="h-[72px] w-[72px] shrink-0" />
          </div>
          <button
            type="button"
            className="mt-4 h-[46px] w-full rounded-[16px] bg-[#1cb0f6] text-[15px] font-extrabold uppercase tracking-[0.8px] text-white shadow-[0_4px_0_#1899d6]"
          >
            Start my free month
          </button>
        </div>
      ) : null}

      <div className="rounded-[16px] border-2 border-border p-4">
        <p className="font-extrabold">Unlock Leaderboards!</p>
        <div className="mt-3 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center opacity-40">
            <ShieldIcon />
          </span>
          <p className="text-sm font-bold text-muted">Complete 3 more lessons to start competing</p>
        </div>
      </div>

      <div className="rounded-[16px] border-2 border-border p-4">
        <div className="flex items-center justify-between">
          <p className="font-extrabold">Daily Quests</p>
          <a href={goalHref} className="text-sm font-extrabold uppercase tracking-wide text-blue">
            View all
          </a>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <LightningIcon className="h-8 w-8 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-extrabold">Earn {me.daily_goal_xp} XP</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-[var(--wash)]">
                <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
              </div>
              <ChestIcon className="h-7 w-7" />
            </div>
            <p className="mt-1 text-sm font-bold tabular text-muted">
              {me.today_xp} / {me.daily_goal_xp}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
