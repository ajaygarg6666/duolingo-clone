import { AppShell, RightRail } from "@/components/app-shell";
import { PathView } from "@/components/path-view";
import { sget } from "@/lib/server";
import type { Me, PathOut } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function LearnPage() {
  const [me, path] = await Promise.all([sget<Me>("/api/v1/me"), sget<PathOut>("/api/v1/path")]);
  return (
    <AppShell me={me} right={<RightRail me={me} />}>
      <PathView units={path.units} />
    </AppShell>
  );
}
