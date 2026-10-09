"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { startLegendaryAction, startLessonAction } from "@/app/actions";
import { type PathSkill, type PathUnit } from "@/lib/api";
import { DuoButton } from "./duo-button";
import { BookIcon, ChestIcon, OwlMascot, SkillGlyph, StarIcon, TrophyIcon } from "./icons";

const CX = 230;
const GAP = 112;
const OFFSETS = [0, 28, 52, 28, 0, -28, -52, -28];

function lip(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? [...h].map((c) => c + c).join("") : h, 16);
  return `rgb(${Math.round(((n >> 16) & 255) * 0.78)},${Math.round(((n >> 8) & 255) * 0.78)},${Math.round((n & 255) * 0.78)})`;
}

type Stop =
  | { kind: "skill"; skill: PathSkill; unit: PathUnit; x: number; y: number }
  | { kind: "chest"; x: number; y: number; locked: boolean }
  | { kind: "trophy"; x: number; y: number };

function layout(units: PathUnit[]) {
  let gi = 0;
  return units.map((unit, ui) => {
    const stops: Stop[] = [];
    let y = 36;
    unit.skills.forEach((skill, si) => {
      stops.push({ kind: "skill", skill, unit, x: CX + OFFSETS[gi % OFFSETS.length], y });
      gi += 1;
      y += GAP;
      if (si === 0 && unit.skills.length > 1) {
        stops.push({ kind: "chest", x: CX + OFFSETS[gi % OFFSETS.length], y, locked: skill.state !== "complete" });
        gi += 1;
        y += GAP;
      }
    });
    if (ui === units.length - 1) {
      stops.push({ kind: "trophy", x: CX + OFFSETS[gi % OFFSETS.length], y });
      y += 80;
    }
    return { unit, stops, height: y };
  });
}

export function PathView({ units }: { units: PathUnit[] }) {
  const sections = useMemo(() => layout(units), [units]);
  const owlUnitId = units.find((u) => u.skills.some((s) => s.state === "current"))?.id ?? units[0]?.id;
  const [picked, setPicked] = useState<number | null>(null);
  const [busy, start] = useTransition();
  const [err, setErr] = useState("");

  useEffect(() => {
    function close(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest("[data-node]")) setPicked(null);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function startLesson(skill: PathSkill, legendary = false) {
    setErr("");
    start(async () => {
      try {
        if (legendary) {
          await startLegendaryAction(skill.id);
          return;
        }
        if (!skill.next_lesson_id) return;
        await startLessonAction(skill.next_lesson_id);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Could not start");
      }
    });
  }

  return (
    <div className="w-full">
      {sections.map(({ unit, stops, height }, ui) => (
        <section key={unit.id} className="mb-2">
          <div
            className="sticky top-[56px] z-20 mb-4 flex items-center gap-3 rounded-[16px] px-4 py-3.5 text-white xl:top-3"
            style={{ background: unit.color, boxShadow: `0 5px 0 ${lip(unit.color)}` }}
          >
            {ui > 0 ? (
              <span className="text-2xl font-extrabold leading-none opacity-90" aria-hidden>
                ‹
              </span>
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-extrabold uppercase tracking-[0.8px] text-white/80">
                Section 1, Unit {unit.index}
              </p>
              <h2 className="truncate text-[19px] font-extrabold leading-tight">Solo trip: {unit.title}</h2>
            </div>
            <button
              type="button"
              className="flex shrink-0 items-center gap-1.5 rounded-[14px] border-2 border-white/35 bg-white/10 px-3 py-2 text-[13px] font-extrabold uppercase tracking-wide"
            >
              <BookIcon />
              <span className="hidden sm:inline">Guidebook</span>
            </button>
          </div>

          {ui > 0 ? (
            <p className="mb-6 text-center text-sm font-extrabold text-muted">Solo trip: {unit.title}</p>
          ) : null}

          <div
            className="relative mx-auto w-full max-w-[400px]"
            style={{ height: height + (picked && stops.some((s) => s.kind === "skill" && s.skill.id === picked) ? 200 : 24) }}
          >
            {unit.id === owlUnitId
              ? (() => {
                  const owlAt =
                    stops.find((s) => s.kind === "skill" && s.skill.state === "current") ||
                    stops.find((s) => s.kind === "skill");
                  if (!owlAt || owlAt.kind !== "skill") return null;
                  return (
                    <div className="pointer-events-none absolute z-[2]" style={{ left: 0, top: owlAt.y - 28 }}>
                      <OwlMascot className="h-[148px] w-[148px]" />
                    </div>
                  );
                })()
              : null}
            {stops.map((stop, i) => {
              if (stop.kind === "chest") {
                return (
                  <div
                    key={`chest-${unit.id}-${i}`}
                    className={`absolute grid h-[70px] w-[70px] place-items-center ${stop.locked ? "opacity-45 grayscale" : ""}`}
                    style={{ left: stop.x - 35, top: stop.y }}
                  >
                    <ChestIcon className="h-12 w-12" />
                  </div>
                );
              }
              if (stop.kind === "trophy") {
                return (
                  <div
                    key={`trophy-${unit.id}`}
                    className="absolute grid h-[64px] w-[64px] place-items-center rounded-full opacity-45"
                    style={{ left: stop.x - 32, top: stop.y, background: "var(--locked)", boxShadow: "0 6px 0 var(--locked-lip)" }}
                  >
                    <TrophyIcon />
                  </div>
                );
              }
              const { skill } = stop;
              const locked = skill.state === "locked";
              const current = skill.state === "current";
              const complete = skill.state === "complete";
              const open = picked === skill.id;
              const lessonOf = Math.min(5, skill.crowns + (complete ? 0 : 1));
              return (
                <div key={skill.id} data-node className="absolute" style={{ left: stop.x - 32, top: stop.y }}>
                  {current && !open ? (
                    <div className="absolute -top-10 left-1/2 z-10 -translate-x-1/2">
                      <div className="rounded-[10px] bg-[#3c4c55] px-3 py-1 text-[12px] font-extrabold uppercase tracking-[0.8px] text-white">
                        Start
                      </div>
                      <div className="mx-auto h-0 w-0 border-x-[7px] border-t-[7px] border-x-transparent border-t-[#3c4c55]" />
                    </div>
                  ) : null}
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => setPicked(open ? null : skill.id)}
                    className={`relative z-[1] grid h-[64px] w-[64px] place-items-center rounded-full ${current ? "duo-bounce" : ""} ${
                      locked ? "text-[#6b7b83]" : "text-white"
                    }`}
                    style={{
                      background: locked ? "var(--locked)" : unit.color,
                      boxShadow: locked ? "0 6px 0 var(--locked-lip)" : `0 6px 0 ${lip(unit.color)}`,
                    }}
                    aria-label={skill.name}
                  >
                    {current || complete ? <StarIcon className="h-8 w-8" /> : <SkillGlyph name={skill.icon} className="h-7 w-7" />}
                  </button>
                  {open ? (
                    <div className="absolute left-1/2 top-[80px] z-30 w-[240px] -translate-x-1/2">
                      <div
                        className="mx-auto h-0 w-0 border-x-[10px] border-b-[10px] border-x-transparent"
                        style={{ borderBottomColor: unit.color }}
                      />
                      <div
                        className="rounded-[16px] px-4 pb-4 pt-3 text-center text-white"
                        style={{ background: unit.color, boxShadow: `0 6px 0 ${lip(unit.color)}` }}
                      >
                        <p className="text-[13px] font-extrabold uppercase tracking-wide text-white/80">
                          Lesson {lessonOf} of 5
                        </p>
                        <h3 className="text-[19px] font-extrabold">{skill.name}</h3>
                        {err ? <p className="mt-1 text-sm font-bold">{err}</p> : null}
                        {locked ? (
                          <p className="mt-2 text-sm font-bold text-white/85">Complete the previous skill to unlock this.</p>
                        ) : (
                          <div className="mt-3 flex flex-col gap-2">
                            <DuoButton variant="white" disabled={busy} className="w-full" onClick={() => startLesson(skill)}>
                              Start +10 XP
                            </DuoButton>
                            {skill.legendary_lesson_id ? (
                              <DuoButton variant="gold" disabled={busy} className="w-full" onClick={() => startLesson(skill, true)}>
                                {skill.legendary_complete ? "Retry legendary" : "Legendary +20 XP"}
                              </DuoButton>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
