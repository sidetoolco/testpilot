import { create } from 'zustand';
import { sessions as initialSessions } from '../data/sessions';
import { TestSession } from '../types';

interface SessionStore {
  sessions: TestSession[];
  selectedSession: TestSession | null;
  setSelectedSession: (session: TestSession | null) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessions: initialSessions,
  selectedSession: null,
  setSelectedSession: (session) => set({ selectedSession: session }),
}));