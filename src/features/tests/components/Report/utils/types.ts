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
  status: 'draft' | 'active' | 'complete';
  updatedAt: string;
  demographics: {
    testerCount: number;
  };
  competitors: {
    image_url: string;
  }[];

  variations: {
    a: { image_url: string; title: string } | null;
    b: { image_url: string; title: string } | null;
    c: { image_url: string; title: string } | null;
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
