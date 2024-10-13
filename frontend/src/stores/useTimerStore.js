import { create } from "zustand";

const useTimerStore = create((set) => ({
  time: 0,
  isRunning: false,
  startTimer: () => set(() => ({ isRunning: true })),
  stopTimer: () => set(() => ({ isRunning: false })),
  resetTimer: () => set(() => ({ time: 0 })),
  incrementTime: () => set((state) => ({ time: state.time + 1 })),
}));

export default useTimerStore;
