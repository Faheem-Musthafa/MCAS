export function SportsIllustration() {
  return (
    <svg width="400" height="450" viewBox="0 0 400 450" fill="none" className="opacity-40">
      {/* Soccer Ball */}
      <g stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="180" cy="180" r="70" />
        {/* Pentagon patterns */}
        <path d="M180 110 L210 140 L195 180 L165 180 L150 140 Z" />
        <path d="M180 110 L150 140 L120 130" />
        <path d="M180 110 L210 140 L240 130" />
        <path d="M150 140 L165 180 L140 210" />
        <path d="M210 140 L195 180 L220 210" />
        <path d="M165 180 L180 220 L195 180" />
        <path d="M140 210 L160 250" />
        <path d="M220 210 L200 250" />
        <path d="M160 250 L180 240 L200 250" />
      </g>

      {/* Running Player */}
      <g stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Head */}
        <circle cx="300" cy="140" r="25" />

        {/* Body */}
        <path d="M300 165 L280 260" />

        {/* Arms */}
        <path d="M295 185 L250 170 L230 190" />
        <path d="M285 200 L330 180 L360 200" />

        {/* Legs - running pose */}
        <path d="M280 260 L240 320 L200 380" />
        <path d="M280 260 L320 330 L350 400" />

        {/* Feet */}
        <path d="M200 380 L180 385 L175 375" />
        <path d="M350 400 L370 395 L375 405" />

        {/* Motion lines */}
        <g opacity="0.5">
          <path d="M360 130 L380 125" />
          <path d="M355 150 L375 150" />
          <path d="M360 170 L380 175" />
        </g>
      </g>

      {/* Additional motion elements */}
      <g stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.4">
        <path d="M130 280 L110 285" />
        <path d="M125 300 L105 305" />
        <path d="M135 320 L115 330" />
      </g>
    </svg>
  )
}
