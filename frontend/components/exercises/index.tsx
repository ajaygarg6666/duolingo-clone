"use client";

import { useMemo, useState } from "react";
import type { Exercise } from "@/lib/api";

export function ExerciseBody({
  exercise,
  onCanCheck,
  locked = false,
}: {
  exercise: Exercise;
  onCanCheck: (ok: boolean, value: unknown) => void;
  locked?: boolean;
}) {
  if (exercise.type === "multiple_choice" || exercise.type === "fill_blank") {
    return <ChoiceExercise exercise={exercise} onCanCheck={onCanCheck} locked={locked} />;
  }
  if (exercise.type === "word_bank") {
    return <WordBankExercise exercise={exercise} onCanCheck={onCanCheck} locked={locked} />;
  }
  if (exercise.type === "match_pairs") {
    return <MatchPairsExercise exercise={exercise} onCanCheck={onCanCheck} locked={locked} />;
  }
  return <TypeAnswerExercise exercise={exercise} onCanCheck={onCanCheck} locked={locked} />;
}

function chip(active: boolean) {
  return `rounded-[12px] border-2 px-4 py-3.5 text-left text-lg font-bold shadow-[0_2px_0_var(--border)] active:translate-y-0.5 active:shadow-none ${
    active ? "border-selected bg-selected text-blue shadow-[0_2px_0_var(--selected-border)]" : "border-border bg-surface"
  }`;
}

function ChoiceExercise({
  exercise,
  onCanCheck,
  locked,
}: {
  exercise: Exercise;
  onCanCheck: (ok: boolean, value: unknown) => void;
  locked: boolean;
}) {
  const options = (exercise.payload.options as string[]) || [];
  const sentence = (exercise.payload.sentence as string) || "";
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div>
      {sentence ? (
        <p className="mb-6 text-2xl font-extrabold">
          {sentence.split("___").map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 ? (
                <span className="mx-1 inline-block min-w-16 border-b-4 border-blue text-center text-blue">
                  {picked || ""}
                </span>
              ) : null}
            </span>
          ))}
        </p>
      ) : null}
      <div className="grid gap-3">
        {options.map((opt, i) => (
          <button
            key={opt}
            type="button"
            disabled={locked}
            onClick={() => {
              setPicked(opt);
              onCanCheck(true, opt);
            }}
            className={chip(picked === opt)}
          >
            <span className="mr-3 inline-grid h-8 w-8 place-items-center rounded-[8px] border-2 border-current text-sm font-extrabold text-hint">
              {i + 1}
            </span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function WordBankExercise({
  exercise,
  onCanCheck,
  locked,
}: {
  exercise: Exercise;
  onCanCheck: (ok: boolean, value: unknown) => void;
  locked: boolean;
}) {
  const bank = (exercise.payload.bank as string[]) || [];
  const [used, setUsed] = useState<number[]>([]);
  function pick(i: number) {
    if (locked || used.includes(i)) return;
    const next = [...used, i];
    setUsed(next);
    onCanCheck(next.length > 0, next.map((n) => bank[n]));
  }
  function drop(i: number) {
    if (locked) return;
    const next = used.filter((n) => n !== i);
    setUsed(next);
    onCanCheck(next.length > 0, next.map((n) => bank[n]));
  }
  return (
    <div>
      <div className="mb-8 flex min-h-16 flex-wrap gap-2 border-b-2 border-border pb-4">
        {used.map((i) => (
          <button key={i} type="button" onClick={() => drop(i)} className={chip(false)}>
            {bank[i]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {bank.map((w, i) => (
          <button key={i} type="button" disabled={used.includes(i) || locked} onClick={() => pick(i)} className={`${chip(false)} disabled:opacity-25`}>
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}

function MatchPairsExercise({
  exercise,
  onCanCheck,
  locked,
}: {
  exercise: Exercise;
  onCanCheck: (ok: boolean, value: unknown) => void;
  locked: boolean;
}) {
  const left = useMemo(() => shuffle([...(exercise.payload.left as string[])]), [exercise.id]);
  const right = useMemo(() => shuffle([...(exercise.payload.right as string[])]), [exercise.id]);
  const origLeft = (exercise.payload.left as string[]) || [];
  const origRight = (exercise.payload.right as string[]) || [];
  const [sel, setSel] = useState<{ side: "l" | "r"; value: string } | null>(null);
  const [matched, setMatched] = useState<[string, string][]>([]);

  function choose(side: "l" | "r", value: string) {
    if (locked) return;
    if (matched.some((m) => m[0] === value || m[1] === value)) return;
    if (!sel || sel.side === side) {
      setSel({ side, value });
      return;
    }
    const a = sel.side === "l" ? sel.value : value;
    const b = sel.side === "r" ? sel.value : value;
    const ok = origLeft.some((l, i) => (l === a && origRight[i] === b) || (l === b && origRight[i] === a));
    if (ok) {
      const next: [string, string][] = [...matched, [a, b]];
      setMatched(next);
      onCanCheck(next.length === origLeft.length, next);
    }
    setSel(null);
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-3">
        {left.map((v) => (
          <PairChip key={v} label={v} active={sel?.value === v} done={matched.some((m) => m[0] === v || m[1] === v)} onClick={() => choose("l", v)} />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {right.map((v) => (
          <PairChip key={v} label={v} active={sel?.value === v} done={matched.some((m) => m[0] === v || m[1] === v)} onClick={() => choose("r", v)} />
        ))}
      </div>
    </div>
  );
}

function PairChip({
  label,
  active,
  done,
  onClick,
}: {
  label: string;
  active: boolean;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" disabled={done} onClick={onClick} className={`${chip(active)} disabled:opacity-30`}>
      {label}
    </button>
  );
}

function TypeAnswerExercise({
  exercise,
  onCanCheck,
  locked,
}: {
  exercise: Exercise;
  onCanCheck: (ok: boolean, value: unknown) => void;
  locked: boolean;
}) {
  const hint = (exercise.payload.hint as string) || "";
  return (
    <div>
      <input
        autoFocus
        disabled={locked}
        className="w-full border-0 border-b-2 border-border bg-transparent py-3 text-2xl font-bold outline-none focus:border-blue"
        placeholder="Type in Spanish"
        aria-label="Answer"
        onChange={(e) => onCanCheck(e.target.value.trim().length > 0, e.target.value)}
      />
      {hint ? <p className="mt-2 text-sm font-bold text-muted">{hint}</p> : null}
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
