import { useEffect } from 'react';
import type { RefObject } from 'react';
import { Game, type GameCallbacks } from '@/engine/core/Game';
import { renderer } from '@/engine/core/Renderer';
import { gameLoop } from '@/engine/core/GameLoop';
import { inputManager } from '@/engine/core/InputManager';
import { useGameStore } from '@/store/gameStore';
import { useUiStore } from '@/store/uiStore';
import { useSettingsStore } from '@/store/settingsStore';

export function useGameEngine(canvasRef: RefObject<HTMLCanvasElement | null>): void {
  const addScore = useGameStore((s) => s.addScore);
  const loseLife = useGameStore((s) => s.loseLife);
  const setStatus = useGameStore((s) => s.setStatus);
  const setDotsRemaining = useGameStore((s) => s.setDotsRemaining);
  const activatePowerPellet = useGameStore((s) => s.activatePowerPellet);
  const nextLevel = useGameStore((s) => s.nextLevel);
  const reset = useGameStore((s) => s.reset);
  const isPaused = useUiStore((s) => s.isPaused);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    reset();
    renderer.init(canvas);
    inputManager.init();

    const callbacks: GameCallbacks = {
      addScore,
      loseLife,
      setStatus,
      setDotsRemaining,
      activatePowerPellet,
      nextLevel,
      getStatus: () => useGameStore.getState().status,
      getScore: () => useGameStore.getState().score,
      getLevel: () => useGameStore.getState().level,
    };

    const difficulty = useSettingsStore.getState().difficulty;
    const game = new Game(callbacks, difficulty);

    gameLoop.start(
      (delta: number) => {
        game.update(delta);
        const { status } = useGameStore.getState();
        if (status.type === 'game-over' || status.type === 'victory') {
          gameLoop.stop();
        }
      },
      () => game.render(ctx),
    );

    return () => {
      gameLoop.stop();
      inputManager.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef]);

  // Pause / resume when isPaused changes (after initial mount)
  useEffect(() => {
    if (isPaused) gameLoop.pause();
    else gameLoop.resume();
  }, [isPaused]);
}
