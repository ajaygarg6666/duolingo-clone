import { AppShell } from "@/components/app-shell";
import { sget } from "@/lib/server";
import type { Me } from "@/lib/api";
import { SettingsForm } from "@/components/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const me = await sget<Me>("/api/v1/me");
  return (
    <AppShell me={me}>
      <h1 className="text-[28px] font-extrabold">Settings</h1>
      <SettingsForm me={me} />
    </AppShell>
  );
}
