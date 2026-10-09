const DUO = "/duo-path.svg";

export function OwlLogo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <span className={`relative inline-block overflow-hidden ${className}`}>
      <img src={DUO} alt="" draggable={false} className="absolute inset-[-18%] max-w-none" />
    </span>
  );
}

export function OwlMascot({ className = "h-24 w-24" }: { className?: string }) {
  return <img src={DUO} alt="" draggable={false} className={className} />;
}

function NavImg({ src, className = "h-8 w-8" }: { src: string; className?: string }) {
  return <img src={src} alt="" draggable={false} className={`shrink-0 ${className}`} />;
}

export function HomeIcon({ className = "h-8 w-8" }: { className?: string }) {
  return <NavImg src="/icons/home.svg" className={className} />;
}

export function DumbbellIcon({ className = "h-8 w-8" }: { className?: string }) {
  return <NavImg src="/icons/practice.svg" className={className} />;
}

export function ShieldIcon({ className = "h-8 w-8" }: { className?: string }) {
  return <NavImg src="/icons/shield.svg" className={className} />;
}

export function ChestIcon({ className = "h-8 w-8" }: { className?: string }) {
  return <NavImg src="/icons/chest.svg" className={className} />;
}

export function ShopIcon({ className = "h-8 w-8" }: { className?: string }) {
  return <NavImg src="/icons/shop.svg" className={className} />;
}

export function StarIcon({ className = "h-8 w-8" }: { className?: string }) {
  return <NavImg src="/icons/star.svg" className={className} />;
}

export function PersonIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden>
      <circle cx="16" cy="16" r="12" fill="none" stroke="#52656d" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="16" cy="13" r="4" fill="#8aa0ab" />
      <path fill="#8aa0ab" d="M8 25c1.5-5 4.5-7 8-7s6.5 2 8 7" />
    </svg>
  );
}

export function MoreIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden>
      <circle cx="8" cy="16" r="3" fill="#CE82FF" />
      <circle cx="16" cy="16" r="3" fill="#CE82FF" />
      <circle cx="24" cy="16" r="3" fill="#CE82FF" />
    </svg>
  );
}

export function LightningIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#FFC800" d="M13 2 4 14h7l-1 8 10-14h-7l0-6z" />
    </svg>
  );
}

export function IceIcon({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path fill="#1CB0F6" d="M16 2 6 12h6l-4 18 14-16h-6L16 2z" />
      <path fill="#89e0ff" d="M16 2v10h6L16 2z" />
    </svg>
  );
}

export function InfinityHeart({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path fill="#1CB0F6" d="M16 28s-10-6.2-13-11.5C1 11.2 3.4 6 8.4 6 11.2 6 13.5 7.8 16 11.6 18.5 7.8 20.8 6 23.6 6 28.6 6 31 11.2 29 16.5 26 21.8 16 28 16 28z" />
      <path fill="#fff" d="M10 16c0-2 1.5-3.5 3.2-3.5 1.4 0 2.3.8 2.8 1.6.5-.8 1.4-1.6 2.8-1.6 1.7 0 3.2 1.5 3.2 3.5 0 1.6-1.3 3-3.2 3-1.2 0-2-.6-2.8-1.5-.8.9-1.6 1.5-2.8 1.5-1.9 0-3.2-1.4-3.2-3z" />
    </svg>
  );
}

export function FireIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#FF9600" d="M12 2s3 4 3 7c0 1.5-.7 2.8-1.7 3.6C14.5 11 16 9 16 6c2 2.4 4 5.2 4 9a8 8 0 1 1-16 0c0-4 4-8 8-13z" />
      <path fill="#FFC800" d="M12 11c1.2 1.4 2 3 2 4.5A4 4 0 1 1 8.8 12C10 13 11 13 12 11z" />
    </svg>
  );
}

export function GemIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#1CB0F6" d="M12 3 3 10l9 12 9-12-9-7z" />
      <path fill="#89e0ff" d="M12 3 7 10h10L12 3z" />
      <path fill="#1899D6" d="M12 3v19L3 10l9-7z" />
    </svg>
  );
}

export function HeartIcon({ empty = false, className = "h-7 w-7" }: { empty?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill={empty ? "var(--locked)" : "#FF4B4B"}
        d="M12 21s-7.2-4.5-9.5-8.4C.4 9.3 2.1 5.5 5.7 5.5 7.8 5.5 9.5 6.8 12 9.7c2.5-2.9 4.2-4.2 6.3-4.2 3.6 0 5.3 3.8 3.2 7.1C19.2 16.5 12 21 12 21z"
      />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="#afafaf" aria-hidden>
      <path d="M8 11V8a4 4 0 1 1 8 0v3h2v11H6V11h2zm2 0h4V8a2 2 0 1 0-4 0v3z" />
    </svg>
  );
}

export function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#FFC800" aria-hidden>
      <path d="M3 17 6 8l6 5 6-5 3 9H3z" />
    </svg>
  );
}

export function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 3V4zm3 2v12h11V7a1 1 0 0 0-1-1H8z" />
    </svg>
  );
}

export function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor" aria-hidden>
      <path d="M3 9h5l7-6v18l-7-6H3V9z" />
      <path d="M18 9.5a4.5 4.5 0 0 1 0 5" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function FlagES() {
  return (
    <svg viewBox="0 0 24 16" className="h-5 w-7 rounded-[3px] overflow-hidden" aria-label="Spanish">
      <rect width="24" height="16" fill="#C60B1E" />
      <rect y="4" width="24" height="8" fill="#FFC400" />
    </svg>
  );
}

export function TrophyIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
      <path fill="#FFC800" d="M8 6h16v8a8 8 0 0 1-16 0V6z" />
      <path fill="#E5A100" d="M6 8h4v5a6 6 0 0 1-4-5zm16 0h4a6 6 0 0 1-4 5V8z" />
      <rect x="13" y="20" width="6" height="4" fill="#E5A100" />
      <rect x="10" y="24" width="12" height="3" rx="1" fill="#FFC800" />
    </svg>
  );
}

export function SkillGlyph({ name, className = "h-8 w-8" }: { name: string; className?: string }) {
  const common = { className, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true } as const;
  if (name === "chat")
    return (
      <svg {...common}>
        <path d="M4 4h16v12H7l-3 3V4z" />
      </svg>
    );
  if (name === "speech")
    return (
      <svg {...common}>
        <path d="M5 5h14v10H8l-3 3V5z" />
      </svg>
    );
  if (name === "apple")
    return (
      <svg {...common}>
        <path d="M12 3c1.2 0 2.2 1 2.2 2.2 2.4-.8 5.8 1.2 5.8 5.6 0 5.2-5.2 10.2-8 10.2S4 16 4 10.8C4 6.4 7.4 4.4 9.8 5.2 9.8 4 10.8 3 12 3z" />
      </svg>
    );
  if (name === "map")
    return (
      <svg {...common}>
        <path d="M4 6l6-2 4 2 6-2v14l-6 2-4-2-6 2V6z" />
      </svg>
    );
  if (name === "mug")
    return (
      <svg {...common}>
        <path d="M4 7h12v8a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V7zm12 2h3a3 3 0 0 1 0 6h-3" />
      </svg>
    );
  if (name === "home")
    return (
      <svg {...common}>
        <path d="M12 3 3 11h3v10h6v-6h2v6h6V11h3L12 3z" />
      </svg>
    );
  if (name === "bus")
    return (
      <svg {...common}>
        <path d="M5 4h14v12H5V4zm2 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM7 7h10v5H7V7z" />
      </svg>
    );
  if (name === "bed")
    return (
      <svg {...common}>
        <path d="M3 12h18v7H3v-7zm2-5a3 3 0 0 1 3 3h10v2H3V9a2 2 0 0 1 2-2z" />
      </svg>
    );
  if (name === "clock")
    return (
      <svg {...common}>
        <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm1 5h-2v6l4 2.5 1-1.7-3-1.8V7z" />
      </svg>
    );
  if (name === "bag")
    return (
      <svg {...common}>
        <path d="M7 7V6a5 5 0 0 1 10 0v1h3v14H4V7h3zm2 0h6V6a3 3 0 0 0-6 0v1z" />
      </svg>
    );
  if (name === "sun")
    return (
      <svg {...common}>
        <path d="M11 1h2v4h-2V1zm0 18h2v4h-2v-4zM1 11h4v2H1v-2zm18 0h4v2h-4v-2zM4 4l2 2-1.4 1.4L2.6 5.4 4 4zm14 0 1.4 1.4-2 2L16 6l2-2zM4 20l1.4-1.4 2 2L6 22 4 20zm14 0 2-2 1.4 1.4L20 22l-2-2zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10z" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M12 3 9.2 9.2H3l5 3.8L6.2 20 12 16.2 17.8 20 16 13 21 9.2h-6.2z" />
    </svg>
  );
}
