// useTestSessionStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { StateCreator } from 'zustand';
import { Product } from '../types';

interface SessionState {
  sessionBeginTime: Date | null;
  shopperId: string | null;
  itemsClicked: string[];
  timeSpentOnPDP: Record<string, number>; // Key: Item ID, Value: Time spent in seconds
  totalTimeElapsed: number;
  itemSelectedAtCheckout: string | null;
  answersToQuestions: Record<string, string>; // Key: Question ID, Value: Answer

  startSession: (shopperId: string) => void;
  clickItem: (itemId: string) => void;
  spendTimeOnPDP: (itemId: string, time: number) => void;
  selectItemAtCheckout: (itemId: Product) => void;
  answerQuestion: (questionId: string, answer: string) => void;
  endSession: () => void;
}


export const useSessionStore = create<SessionState, [["zustand/devtools", never]]>(
  devtools((set) => ({
    sessionBeginTime: null,
    shopperId: null,
    itemsClicked: [],
    timeSpentOnPDP: {},
    totalTimeElapsed: 0,
    itemSelectedAtCheckout: null,
    answersToQuestions: {},

    startSession: (shopperId) => set({
      sessionBeginTime: new Date(),
      shopperId,
      itemsClicked: [],
      timeSpentOnPDP: {},
      totalTimeElapsed: 0,
      itemSelectedAtCheckout: null,
      answersToQuestions: {},
    }),

    clickItem: (itemId) => set((state) => ({
      itemsClicked: [...state.itemsClicked, itemId],
    })),

    spendTimeOnPDP: (itemId, time) => set((state) => ({
      timeSpentOnPDP: {
        ...state.timeSpentOnPDP,
        [itemId]: (state.timeSpentOnPDP[itemId] || 0) + time,
      },
    })),

    selectItemAtCheckout: (itemId) => set({
      itemSelectedAtCheckout: itemId,
    }),

    answerQuestion: (questionId, answer) => set((state) => ({
      answersToQuestions: {
        ...state.answersToQuestions,
        [questionId]: answer,
      },
    })),

    endSession: () => set((state) => ({
      totalTimeElapsed: (new Date().getTime() - (state.sessionBeginTime?.getTime() || 0)) / 1000,
    })),
  }))
);