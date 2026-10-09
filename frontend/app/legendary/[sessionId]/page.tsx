import { LessonPlayer } from "@/components/lesson/player";
import { sget } from "@/lib/server";
import type { Exercise, SessionStart } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function LegendaryPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const session = await sget<SessionStart>(`/api/v1/sessions/${sessionId}`);
  if (!session.exercise) {
    return <div className="grid min-h-screen place-items-center bg-snow font-extrabold">This challenge already ended</div>;
  }
  return <LessonPlayer session={session as SessionStart & { exercise: Exercise }} legendary />;
}
