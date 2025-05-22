import { create } from 'zustand';

interface IaInsight {
  id: string;
  test_id: string;
  comparison_between_variants: string;
  purchase_drivers: string;
  competitive_insights: string;
  recommendations: string;
}

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
