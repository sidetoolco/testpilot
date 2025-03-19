

export type VariationType = 'a' | 'b' | 'c';

export interface Variant {
    id: string;
    title: string;
    valueScore: number;
}

export interface SurveyData {
    [key: string]: any[];
}
