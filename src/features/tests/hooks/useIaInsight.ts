import { create } from 'zustand';

interface AiInsight {
  id: number;
  test_id: string;
  variant_type?: string | null;
  comparison_between_variants: string;
  purchase_drivers: string;
  competitive_insights_a?: string;
  competitive_insights_b?: string;
  competitive_insights_c?: string;
  competitive_insights?: string;
  recommendations: string;
  comment_summary?: string;
  sendEmail?: boolean;
  edited?: boolean;
}

interface InsightState {
  insight: null | AiInsight;
  aiInsights: AiInsight[];
  loading: boolean;
  setInsight: (insight: AiInsight | null) => void;
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
    const { insight } = get();
    if (!insight) return null;
    
    // Get the variant-specific competitive insights
    const variantCompetitiveInsight = 
      variantType === 'a' ? insight.competitive_insights_a :
      variantType === 'b' ? insight.competitive_insights_b :
      variantType === 'c' ? insight.competitive_insights_c :
      null;
    
    // Only return the insight if it has competitive insights for this variant
    if (!variantCompetitiveInsight) return null;
    
    // Return the full insight object with the variant-specific competitive insights
    return {
      ...insight,
      competitive_insights: variantCompetitiveInsight,
      variant_type: variantType
    };
  },
}));
