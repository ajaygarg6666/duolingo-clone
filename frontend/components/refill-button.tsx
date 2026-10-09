"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { refillHearts } from "@/app/actions";
import { DuoButton } from "./duo-button";

export function RefillButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  return (
    <>
      <DuoButton
        className={compact ? "h-10 px-4 text-[13px]" : "mt-6"}
        onClick={async () => {
          await refillHearts();
          setMsg("Hearts refilled. Ready for another lesson!");
          router.refresh();
        }}
      >
        {compact ? "Refill" : "Practice to refill"}
      </DuoButton>
      {msg && !compact ? <p className="mt-4 font-bold text-green">{msg}</p> : null}
    </>
  );
}
