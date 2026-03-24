import { create } from 'zustand';
import { produce } from 'immer';

interface UiStoreState {
  isPaused: boolean;
  togglePause: () => void;
  setPaused: (paused: boolean) => void;
}

export const useUiStore = create<UiStoreState>()((set) => ({
  isPaused: false,

  togglePause: () =>
    set(
      produce<UiStoreState>((draft) => {
        draft.isPaused = !draft.isPaused;
      }),
    ),

  setPaused: (paused) => set({ isPaused: paused }),
}));
