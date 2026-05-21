export function Mascot({ size = 160 }: { size?: number }) {
  return (
    <div
      className="rounded-full bg-tint flex items-center justify-center shadow-[0_8px_30px_-12px_rgba(98,0,230,0.35)]"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 120 120" width={size * 0.7} height={size * 0.7}>
        <g>
          {/* antennae */}
          <ellipse cx="42" cy="20" rx="6" ry="9" fill="#6200E6" />
          <ellipse cx="78" cy="20" rx="6" ry="9" fill="#6200E6" />
          {/* body */}
          <ellipse cx="60" cy="68" rx="38" ry="42" fill="#6200E6" stroke="#3a008f" strokeWidth="3" />
          {/* arm waving */}
          <ellipse cx="22" cy="48" rx="9" ry="14" fill="#6200E6" stroke="#3a008f" strokeWidth="3" transform="rotate(-25 22 48)" />
          {/* eyes */}
          <circle cx="50" cy="58" r="11" fill="#fff" stroke="#1a1a1a" strokeWidth="2.5" />
          <circle cx="74" cy="58" r="11" fill="#fff" stroke="#1a1a1a" strokeWidth="2.5" />
          <circle cx="52" cy="60" r="4" fill="#1a1a1a" />
          <circle cx="76" cy="60" r="4" fill="#1a1a1a" />
          {/* mouth */}
          <path d="M52 78 Q62 90 74 78 Q74 86 62 88 Q52 86 52 78 Z" fill="#1a1a1a" />
          <path d="M60 84 Q63 88 66 84" fill="#ff5b8a" />
          {/* feet */}
          <ellipse cx="48" cy="108" rx="8" ry="5" fill="#6200E6" stroke="#3a008f" strokeWidth="2.5" />
          <ellipse cx="74" cy="108" rx="8" ry="5" fill="#6200E6" stroke="#3a008f" strokeWidth="2.5" />
        </g>
      </svg>
    </div>
  );
}
