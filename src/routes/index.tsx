import { Link } from '@tanstack/react-router';

function PacManSVG() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body: full circle minus mouth wedge, facing right */}
      <path
        d="M10,10 L20,4 A10,10 0 1,0 20,16 Z"
        fill="#ffd700"
      />
    </svg>
  );
}

function GhostSVG({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0,10 A10,10 0 0,1 20,10 L20,19 Q16.67,15 13.33,19 Q10,15 6.67,19 Q3.33,15 0,19 Z"
        fill={color}
      />
      <ellipse cx="6.5" cy="8.5" rx="2.5" ry="3" fill="white" />
      <ellipse cx="7.5" cy="9.2" rx="1.2" ry="1.8" fill="#1a1aff" />
      <ellipse cx="13.5" cy="8.5" rx="2.5" ry="3" fill="white" />
      <ellipse cx="14.5" cy="9.2" rx="1.2" ry="1.8" fill="#1a1aff" />
    </svg>
  );
}

function DotSVG() {
  return (
    <svg width="5" height="5" viewBox="0 0 5 5" xmlns="http://www.w3.org/2000/svg">
      <circle cx="2.5" cy="2.5" r="2" fill="#b8860b" />
    </svg>
  );
}

function PowerPelletSVG() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="7" fill="#ffd700" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-8 select-none">
      {/* Score bar */}
      <div className="flex justify-between w-full max-w-xs mb-6 text-[10px]">
        <div>
          <div className="text-[#ff0000] tracking-widest mb-1">1UP</div>
          <div className="text-white tabular-nums">000000</div>
        </div>
        <div className="text-right">
          <div className="text-[#ff0000] tracking-widest mb-1">HI-SCORE</div>
          <div className="text-white tabular-nums">000000</div>
        </div>
      </div>

      {/* Title */}
      <h1
        className="text-4xl text-[#ffd700] tracking-widest mb-4 text-center"
        style={{
          animation: 'glow-pulse 2s ease-in-out infinite',
          textShadow: '0 0 8px #ffd700, 0 0 20px #ffd700, 0 0 40px #ffd700',
        }}
      >
        PAC-MAN
      </h1>

      {/* Pac-Man row */}
      <div className="flex items-center justify-center gap-1.5 mb-6">
        <PacManSVG />
        {Array.from({ length: 5 }).map((_, i) => <DotSVG key={i} />)}
        <PowerPelletSVG />
        {Array.from({ length: 5 }).map((_, i) => <DotSVG key={i + 5} />)}
        <GhostSVG color="#ffb8ff" />
        <GhostSVG color="#00ffff" />
        <GhostSVG color="#ffb852" />
      </div>

      {/* Insert coin */}
      <p
        className="text-[#ffd700] text-[11px] tracking-widest mb-8 [animation:var(--animate-blink)]"
      >
        — INSERT COIN —
      </p>

      {/* Menu */}
      <nav aria-label="Main menu" className="flex flex-col gap-3 w-64">
        <Link
          to="/game"
          className="text-black font-bold py-3 px-6 text-center text-[11px] tracking-widest transition-all hover:brightness-110"
          style={{
            background: '#ffd700',
            boxShadow: '0 0 12px #ffd700, 0 0 24px rgba(255,215,0,0.4)',
          }}
        >
          ▶ START GAME
        </Link>
        <Link
          to="/high-scores"
          className="py-3 px-6 text-center text-[11px] tracking-widest text-[#0080ff] border-2 border-[#0080ff] transition-all hover:brightness-125"
          style={{ boxShadow: '0 0 6px rgba(0,128,255,0.5)' }}
        >
          HIGH SCORES
        </Link>
        <Link
          to="/settings"
          className="py-3 px-6 text-center text-[11px] tracking-widest text-[#555] border-2 border-[#333] hover:border-[#555] hover:text-[#999] transition-colors"
        >
          SETTINGS
        </Link>
      </nav>

      {/* Controls hint */}
      <p className="mt-10 text-[9px] text-[#333] tracking-wider text-center leading-relaxed">
        ARROW KEYS / WASD — MOVE<br />
        P / ESC — PAUSE
      </p>

      {/* Copyright */}
      <p className="mt-4 text-[8px] text-[#222] tracking-wider">
        © 1980 NAMCO LTD. · FAN REMAKE
      </p>
    </div>
  );
}
