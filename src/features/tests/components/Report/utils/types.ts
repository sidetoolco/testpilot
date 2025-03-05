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
    name: string;
    updatedAt: string;
    demographics: {
        testerCount: number;
    };
    duration: string;
    methodology: string;
    objectives: string[];
    responses: {
        surveys: {
            a: Survey[];
            b: Survey[];
            c: Survey[];
        };
    };
}

export interface ReportPDFProps {
    onPrintStart: () => void;
    onPrintEnd: () => void;
    testDetails: TestDetails;
}

export interface DatasetType {
    label: string;
    data: number[];
    color: string;
} 