import { create } from 'zustand';
interface InsightState {
  insight: null | any;
  loading: boolean;
  setInsight: (insight: any) => void;
  setLoading: (loading: boolean) => void;
}

export const useInsightStore = create<InsightState>(set => ({
  insight: null,
  loading: true,
  setInsight: insight => set({ insight }),
  setLoading: loading => set({ loading }),
}));
