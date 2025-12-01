export function ArtIllustration() {
  return (
    <svg width="350" height="400" viewBox="0 0 350 400" fill="none" className="opacity-40">
      {/* Paintbrush */}
      <g stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M180 80 L220 160" />
        <path d="M215 155 C230 140, 260 130, 280 100 C290 85, 280 70, 265 75 C250 80, 230 100, 215 155" />
        <ellipse cx="197" cy="118" rx="15" ry="45" transform="rotate(-60 197 118)" />
      </g>

      {/* Compass/Divider */}
      <g stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M120 180 L80 300" />
        <path d="M120 180 L160 300" />
        <circle cx="120" cy="175" r="8" />
        <path d="M100 230 L140 230" />
      </g>

      {/* Pencil */}
      <g stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M60 100 L100 200" />
        <path d="M55 95 L65 105" />
        <path d="M95 195 L105 205" />
        <path d="M100 200 L115 230" />
      </g>

      {/* Palette */}
      <g stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="200" cy="280" rx="80" ry="50" />
        <circle cx="170" cy="260" r="12" />
        <circle cx="200" cy="250" r="10" />
        <circle cx="230" cy="265" r="14" />
        <circle cx="215" cy="295" r="11" />
        <circle cx="180" cy="300" r="13" />
        <ellipse cx="240" cy="300" rx="20" ry="25" />
      </g>

      {/* Flying brush strokes */}
      <g stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.6">
        <path d="M250 180 Q270 170, 290 185" />
        <path d="M260 200 Q280 195, 295 210" />
        <path d="M240 220 Q265 215, 280 235" />
      </g>
    </svg>
  )
}
