import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TestCompletionState {
  completedTests: Record<string, { completedAt: string; testId: string; variant: string }>;
  markTestCompleted: (testId: string, variant: string) => void;
  isTestCompleted: (testId: string, variant: string) => boolean;
  clearCompletedTests: () => void;
}

export const useTestCompletionStore = create<TestCompletionState>()(
  persist(
    (set, get) => ({
      completedTests: {},

      markTestCompleted: (testId: string, variant: string) => {
        const key = `${testId}-${variant}`;
        set(state => ({
          completedTests: {
            ...state.completedTests,
            [key]: {
              completedAt: new Date().toISOString(),
              testId,
              variant,
            },
          },
        }));
      },

      isTestCompleted: (testId: string, variant: string) => {
        const key = `${testId}-${variant}`;
        return !!get().completedTests[key];
      },

      clearCompletedTests: () => {
        set({ completedTests: {} });
      },
    }),
    {
      name: 'test-completion-storage',
    }
  )
); 