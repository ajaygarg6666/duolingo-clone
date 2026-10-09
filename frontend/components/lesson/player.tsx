"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api, type AnswerOut, type CompleteOut, type Exercise, type SessionStart } from "@/lib/api";
import { DuoButton } from "../duo-button";
import { ExerciseBody } from "../exercises";
import { HeartIcon, OwlMascot, SpeakerIcon } from "../icons";

export function LessonPlayer({
  session,
  legendary = false,
}: {
  session: SessionStart & { exercise: Exercise };
  legendary?: boolean;
}) {
  const router = useRouter();
  const [exercise, setExercise] = useState<Exercise>(session.exercise);
  const [index, setIndex] = useState(0);
  const [hearts, setHearts] = useState(session.hearts);
  const [canCheck, setCanCheck] = useState(false);
  const [feedback, setFeedback] = useState<AnswerOut | null>(null);
  const [complete, setComplete] = useState<CompleteOut | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(session.time_limit_sec);
  const answerRef = useRef<unknown>(null);

  useEffect(() => {
    if (!legendary || seconds == null) return;
    if (seconds <= 0) {
      setFailed(true);
      return;
    }
    const t = setTimeout(() => setSeconds((s) => (s == null ? s : s - 1)), 1000);
    return () => clearTimeout(t);
  }, [legendary, seconds]);

  function speak() {
    const tts = (exercise.payload.tts as string) || exercise.prompt;
    const u = new SpeechSynthesisUtterance(tts);
    u.lang = exercise.prompt_language === "es" ? "es-ES" : "en-US";
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  useEffect(() => {
    speak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  async function check(skip = false) {
    if (busy || (!canCheck && !skip) || feedback) return;
    setBusy(true);
    try {
      const out = await api<AnswerOut>(`/api/v1/sessions/${session.session_id}/answer`, {
        method: "POST",
        body: JSON.stringify({
          exercise_id: exercise.id,
          answer: skip ? emptyAnswer(exercise.type) : answerRef.current,
        }),
      });
      setFeedback(out);
      setHearts(out.hearts);
      if (out.failed) setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  async function cont() {
    if (!feedback) return;
    if (feedback.failed) {
      setFailed(true);
      return;
    }
    if (feedback.done) {
      const out = await api<CompleteOut>(`/api/v1/sessions/${session.session_id}/complete`, {
        method: "POST",
      });
      setComplete(out);
      return;
    }
    if (feedback.next_exercise) {
      setExercise(feedback.next_exercise);
      setIndex((i) => i + 1);
      setFeedback(null);
      setCanCheck(false);
      answerRef.current = null;
    }
  }

  const progress = ((index + (feedback ? 1 : 0)) / session.total) * 100;

  if (complete) {
    return (
      <div className="grid min-h-screen place-items-center bg-snow px-6 text-center">
        <div className="w-full max-w-md">
          <OwlMascot className="mx-auto h-40 w-40" />
          <h1 className="mt-4 text-[32px] font-extrabold text-gold">
            {complete.legendary ? "Legendary!" : complete.perfect ? "Perfect!" : "Lesson complete!"}
          </h1>
          <div className="mt-8 grid grid-cols-3 gap-3">
            <StatCard label="Total XP" value={`+${complete.xp_earned}`} color="var(--gold)" />
            <StatCard label="Streak" value={`${complete.streak}`} color="var(--orange)" />
            <StatCard label="Crowns" value={`${complete.crowns}`} color="var(--blue)" />
          </div>
          {complete.achievements.length ? (
            <p className="mt-4 font-extrabold text-gold">
              {complete.achievements.map((c) => BADGE[c] || c).join(" · ")}
            </p>
          ) : null}
          <DuoButton className="mt-10 w-full" onClick={() => router.push("/")}>
            Continue
          </DuoButton>
        </div>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="grid min-h-screen place-items-center bg-snow px-6 text-center">
        <div className="w-full max-w-md">
          <OwlMascot className="mx-auto h-36 w-36 opacity-80" />
          <h1 className="mt-4 text-3xl font-extrabold">You ran out of hearts</h1>
          <p className="mt-2 font-bold text-muted">Practice to refill, or wait for hearts to regenerate.</p>
          <div className="mt-8 flex flex-col gap-3">
            <DuoButton onClick={() => router.push("/practice")}>Practice to refill</DuoButton>
            <DuoButton variant="secondary" onClick={() => router.push("/")}>
              End lesson
            </DuoButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-snow">
      <div className="flex items-center gap-4 px-4 py-5 md:px-12">
        <Link href="/" className="text-[28px] font-bold leading-none text-hint" aria-label="Close">
          ×
        </Link>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-[var(--locked)]">
          <div className="relative h-full rounded-full bg-green transition-[width] duration-300" style={{ width: `${progress}%` }}>
            <span className="absolute top-1 left-2 right-2 h-1.5 rounded-full bg-white/35" />
          </div>
        </div>
        {legendary && seconds != null ? (
          <span className="rounded-full bg-gold px-3 py-1 text-sm font-extrabold tabular text-ink shadow-[0_3px_0_var(--gold-lip)]">
            {seconds}s
          </span>
        ) : (
          <div className="flex items-center gap-1 font-extrabold tabular text-red">
            <HeartIcon />
            {hearts}
          </div>
        )}
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 pb-44 pt-4">
        {legendary ? <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.8px] text-gold">Legendary</p> : null}
        <div className="mb-8 flex items-start gap-3">
          <OwlMascot className="h-[96px] w-[96px] shrink-0" />
          <div className="relative min-w-0 flex-1 rounded-[16px] border-2 border-border bg-surface px-5 py-4">
            <div className="absolute -left-[9px] top-7 hidden h-4 w-4 rotate-45 border-b-2 border-l-2 border-border bg-surface sm:block" />
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={speak}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-blue text-white shadow-[0_4px_0_var(--blue-lip)] active:translate-y-1 active:shadow-none"
                aria-label="Play audio"
              >
                <SpeakerIcon />
              </button>
              <h1 className="pt-1.5 text-[22px] font-extrabold leading-snug text-ink">{exercise.prompt}</h1>
            </div>
          </div>
        </div>
        <ExerciseBody
          key={exercise.id}
          exercise={exercise}
          locked={!!feedback}
          onCanCheck={(ok, v) => {
            setCanCheck(ok);
            answerRef.current = v;
          }}
        />
      </div>

      <div
        className={`fixed inset-x-0 bottom-0 border-t-2 ${
          feedback ? (feedback.correct ? "border-[#b8f28b] bg-green-tint" : "border-[#ffc1c1] bg-red-tint") : "border-border bg-surface"
        }`}
      >
        {feedback ? (
          <div className="mx-auto flex max-w-2xl flex-col gap-3 px-6 py-5 drawer-in md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <StatusMark ok={feedback.correct} />
              <div>
                <p className={`text-2xl font-extrabold ${feedback.correct ? "text-green-lip" : "text-red"}`}>
                  {feedback.correct ? "Nice!" : "Correct solution:"}
                </p>
                {!feedback.correct ? (
                  <p className="font-bold text-red">
                    {Array.isArray(feedback.solution)
                      ? (feedback.solution as string[][]).map((p) => p.join(" — ")).join(" · ")
                      : String(feedback.solution)}
                  </p>
                ) : (
                  <p className="font-bold text-green-lip">Keep it up.</p>
                )}
              </div>
            </div>
            <DuoButton variant={feedback.correct ? "primary" : "danger"} className="md:min-w-[200px]" onClick={cont}>
              Continue
            </DuoButton>
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
            <button
              type="button"
              onClick={() => check(true)}
              className="h-[50px] px-4 text-[15px] font-extrabold uppercase tracking-[0.8px] text-hint hover:text-muted"
            >
              Skip
            </button>
            <DuoButton disabled={!canCheck || busy} className="min-w-[150px]" onClick={() => check()}>
              Check
            </DuoButton>
          </div>
        )}
      </div>
    </div>
  );
}

const BADGE: Record<string, string> = {
  first_lesson: "First step",
  streak_3: "On fire",
  xp_100: "Century",
  perfect_lesson: "Flawless",
  legendary: "Legendary",
};

function emptyAnswer(type: Exercise["type"]) {
  if (type === "match_pairs") return [];
  if (type === "word_bank") return [];
  return "";
}

function StatusMark({ ok }: { ok: boolean }) {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0" aria-hidden>
      <circle cx="24" cy="24" r="24" fill={ok ? "#58CC02" : "#FF4B4B"} />
      {ok ? (
        <path d="M14 25 l7 7 14-16" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M24 14v14M24 34h.1" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      )}
    </svg>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="overflow-hidden rounded-[16px] border-2 text-white" style={{ borderColor: color }}>
      <p className="py-1 text-[11px] font-extrabold uppercase tracking-wide" style={{ background: color }}>
        {label}
      </p>
      <p className="bg-surface py-3 text-xl font-extrabold tabular" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
