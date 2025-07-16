import { create } from 'zustand';

interface AiInsight {
  id: number;
  created_at: string;
  test_id: string;
  comparison_between_variants: string;
  purchase_drivers: string;
  competitive_insights: string;
  recommendations: string;
  sendEmail: boolean | null;
  comment_summary: string;
  variant_type: string | null;
}

interface InsightState {
  insight: null | any;
  aiInsights: AiInsight[];
  loading: boolean;
  setInsight: (insight: any) => void;
  setAiInsights: (insights: AiInsight[]) => void;
  setLoading: (loading: boolean) => void;
  getInsightForVariant: (variantType: string) => AiInsight | null;
}

export const useInsightStore = create<InsightState>((set, get) => ({
  insight: null,
  aiInsights: [],
  loading: true,
  setInsight: insight => set({ insight }),
  setAiInsights: aiInsights => set({ aiInsights }),
  setLoading: loading => set({ loading }),
  getInsightForVariant: (variantType: string) => {
    const { aiInsights } = get();
    return aiInsights.find(insight => insight.variant_type === variantType) || null;
  },
}));
