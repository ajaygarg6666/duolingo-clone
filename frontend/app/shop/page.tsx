import type { ReactNode } from "react";
import { AppShell, RightRail } from "@/components/app-shell";
import { GemIcon, HeartIcon, IceIcon, InfinityHeart, OwlMascot } from "@/components/icons";
import { sget } from "@/lib/server";
import type { Me } from "@/lib/api";
import { RefillButton } from "@/components/refill-button";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const me = await sget<Me>("/api/v1/me");
  const full = me.hearts >= 5;
  return (
    <AppShell me={me} right={<RightRail me={me} showSuper={false} />}>
        <div
          className="relative overflow-hidden rounded-[16px] px-6 py-5 text-white"
          style={{ background: "linear-gradient(100deg, #1a4a5c 0%, #2a1a4a 55%, #4a1a6a 100%)" }}
        >
          <p className="absolute right-4 top-3 text-[11px] font-extrabold uppercase tracking-[1px] text-[#7ee0ff]">Super</p>
          <div className="flex items-center gap-4">
            <OwlMascot className="h-20 w-20 shrink-0" />
            <p className="text-[22px] font-extrabold leading-tight">Get started with a 1 month free trial on Super</p>
          </div>
          <button
            type="button"
            className="mt-4 h-[48px] w-full rounded-full bg-white text-[15px] font-extrabold uppercase tracking-[0.8px] text-[#3c3c3c]"
          >
            Start my free month
          </button>
        </div>

        <h2 className="mt-8 text-xl font-extrabold">Hearts</h2>
        <ShopRow
          icon={<HeartIcon className="h-10 w-10" />}
          title="Refill Hearts"
          blurb="Get full hearts so you can worry less about making mistakes in a lesson"
          action={full ? <span className="rounded-full border-2 border-border px-5 py-2 text-sm font-extrabold uppercase text-muted">Full</span> : <RefillButton compact />}
        />
        <ShopRow
          icon={<InfinityHeart />}
          title="Unlimited Hearts"
          blurb="Never run out of hearts with Super!"
          action={<span className="rounded-full bg-[#ce82ff] px-4 py-2 text-sm font-extrabold uppercase text-white">Free trial</span>}
        />

        <h2 className="mt-8 text-xl font-extrabold">Power-Ups</h2>
        <ShopRow
          icon={<IceIcon />}
          title="Streak Freeze"
          blurb="Streak Freeze allows your streak to remain in place for one full day of inactivity."
          action={
            <span className="flex items-center gap-1 text-sm font-extrabold uppercase text-blue">
              Get for: <GemIcon className="h-5 w-5" /> 200
            </span>
          }
        />
      </AppShell>
  );
}

function ShopRow({
  icon,
  title,
  blurb,
  action,
}: {
  icon: ReactNode;
  title: string;
  blurb: string;
  action: ReactNode;
}) {
  return (
    <div className="mt-3 flex items-center gap-4 border-b-2 border-border py-4 last:border-b-0">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="font-extrabold">{title}</p>
        <p className="mt-0.5 text-sm font-bold text-muted">{blurb}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}
