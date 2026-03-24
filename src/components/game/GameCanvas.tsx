import { useRef } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { GAME_CONSTANTS } from '@/types/game.types';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useGameEngine(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      width={GAME_CONSTANTS.CANVAS_WIDTH}
      height={GAME_CONSTANTS.CANVAS_HEIGHT}
      className="border-2 border-blue-800 bg-black"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
