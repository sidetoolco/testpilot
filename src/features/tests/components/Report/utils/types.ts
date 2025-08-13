export interface Survey {
  product_id: string;
  products: { title: string };
  value: number;
  appearance: number;
  confidence: number;
  brand: number;
  convenience: number;
  tester_id: { variation_type: string };
}

export interface Recommendation {
  text: string;
}

export interface TestDetails {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'complete' | 'incomplete';
  updatedAt?: string;
  createdAt: string;
  searchTerm: string;
  completed_sessions: number;
  objective: string;
  block?: boolean; // NEW FIELD: indicates if test is blocked
  demographics: {
    testerCount: number;
    gender?: string[];
    ageRanges?: string[];
    locations?: string[];
    interests?: string[];
    customScreening?: {
      enabled: boolean;
      question: string;
      validAnswer?: string;
    };
  };
  competitors: {
    image_url: string;
  }[];
  variations: {
    a: {
      id: string;
      price: number;
      title: string;
      image_url: string;
      prolificStatus: string;
      calculated_cost?: number;        
      last_cost_calculation?: string; 
      participant_count?: number;      
      reward_amount?: number;         
    } | null;
    b: {
      id: string;
      price: number;
      title: string;
      image_url: string;
      prolificStatus: string;
      calculated_cost?: number;        
      last_cost_calculation?: string;  
      participant_count?: number;      
      reward_amount?: number;          
    } | null;
    c: {
      id: string;
      price: number;
      title: string;
      image_url: string;
      prolificStatus: string;
      calculated_cost?: number;        
      last_cost_calculation?: string;  
      participant_count?: number;      
      reward_amount?: number;         
    } | null;
  };
  responses?: {
    surveys: any;
    comparisons: any;
  };
}

export interface ReportPDFProps {
  onPrintStart: () => void;
  onPrintEnd: () => void;
  testDetails: TestDetails;
  disabled: boolean;
  summaryData: any;
}

export interface DatasetType {
  label: string;
  data: number[];
  color: string;
}
