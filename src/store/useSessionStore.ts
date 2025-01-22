// useTestSessionStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Product } from '../types';

interface SessionState {
  sessionBeginTime: Date | null;
  shopperId: string | null;
  itemsClicked: string[];
  timeSpentOnPDP: Record<string, number>; // Key: Item ID, Value: Time spent in seconds
  totalTimeElapsed: number;
  itemSelectedAtCheckout: string | null;
  answersToQuestions: Record<string, string>; // Key: Question ID, Value: Answer
  status: 'introduction' | 'shopping' | 'questions'; // Nuevo campo status
  idTest: string | null; // Nuevo campo idTest
  test: Record<string, any> | null; // Nuevo campo test, puedes ajustar el tipo según tus necesidades

  startSession: (shopperId: string, idTest: string, test: Record<string, any>) => void;
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
    status: 'introduction', // Inicialización del campo status
    idTest: null, // Inicialización del campo idTest
    test: null, // Inicialización del campo test

    startSession: (shopperId, idTest, test) => set({
      sessionBeginTime: new Date(),
      shopperId,
      itemsClicked: [],
      timeSpentOnPDP: {},
      totalTimeElapsed: 0,
      itemSelectedAtCheckout: null,
      answersToQuestions: {},
      status: 'shopping', // Cambia el estado a shopping al iniciar la sesión
      idTest: idTest, // Reinicia el idTest al iniciar la sesión
      test: test, // Reinicia el test al iniciar la sesión
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
      status: 'questions', // Cambia el estado a questions al responder una pregunta
    })),

    endSession: () => set((state) => ({
      totalTimeElapsed: (new Date().getTime() - (state.sessionBeginTime?.getTime() || 0)) / 1000,
    })),
  }))
);