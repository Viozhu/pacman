import { Link } from '@tanstack/react-router';

const DOTS = ['·', '·', '·', '·', '·'] as const;

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
      <div className="flex items-center justify-center gap-1 text-base mb-6">
        <span className="text-[#ff0000]">👻</span>
        {DOTS.map((d, i) => <span key={i} className="text-[#ffd700] text-[10px]">{d}</span>)}
        <span className="text-[#ffd700] text-2xl">●</span>
        {DOTS.map((d, i) => <span key={i + 5} className="text-[#ffd700] text-[10px]">{d}</span>)}
        <span className="text-[#ffb8ff]">👻</span>
        <span className="text-[#00ffff]">👻</span>
        <span className="text-[#ffb852]">👻</span>
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
