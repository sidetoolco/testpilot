// useTestSessionStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Product } from '../types';

interface SessionState {
  sessionBeginTime: Date | null;
  shopperId: string | null;
  itemsClicked: string[];
  totalTimeElapsed: number;
  itemSelectedAtCheckout: Product | null;
  answersToQuestions: Record<string, string>; // Key: Question ID, Value: Answer
  status: 'introduction' | 'shopping' | 'questions'; // Nuevo campo status
  idTest: string | null; // Nuevo campo idTest
  test: Record<string, any> | null; // Nuevo campo test, puedes ajustar el tipo según tus necesidades

  startSession: (shopperId: string, idTest: string, test: Record<string, any>, sessionBeginTime: Date, itemSelectedAtCheckout?: Product | null) => void;
  clickItem: (itemId: string) => void;
  selectItemAtCheckout: (itemId: Product) => void;
  answerQuestion: (questionId: string, answer: string) => void;
  endSession: () => void;
}


export const useSessionStore = create<SessionState, [["zustand/devtools", never]]>(
  devtools((set) => ({
    sessionBeginTime: null,
    shopperId: null,
    itemsClicked: [],
    totalTimeElapsed: 0,
    itemSelectedAtCheckout: null,
    answersToQuestions: {},
    status: 'introduction', // Inicialización del campo status
    idTest: null, // Inicialización del campo idTest
    test: null, // Inicialización del campo test

    startSession: (shopperId, idTest, test, sessionBeginTime, itemSelectedAtCheckout?: Product | null) => set({
      sessionBeginTime: sessionBeginTime,
      shopperId,
      itemsClicked: [],
      totalTimeElapsed: 0,
      itemSelectedAtCheckout: itemSelectedAtCheckout || null,
      answersToQuestions: {},
      status: 'shopping', // Cambia el estado a shopping al iniciar la sesión
      idTest: idTest, // Reinicia el idTest al iniciar la sesión
      test: test, // Reinicia el test al iniciar la sesión
    }),

    clickItem: (itemId) => set((state) => ({
      itemsClicked: [...state.itemsClicked, itemId],
    })),

    selectItemAtCheckout: (itemId: Product) => set({
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