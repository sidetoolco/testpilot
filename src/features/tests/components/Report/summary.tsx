import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '../../../../lib/supabase';

const COLORS = {
    success: {
        bg: 'bg-[#ebfff7]',
        text: 'text-green-600'
    },
    error: {
        bg: 'bg-[#fff5f5]',
        text: 'text-red-500'
    },
    warning: {
        bg: 'bg-[#fffbeb]',
        text: 'text-yellow-600'
    }
} as const;

const getColorForValue = (value: string, columnIndex: number, allRows: string[][], testid: string) => {
    if (value === 'Yes') return `${COLORS.success.bg} ${COLORS.success.text}`;
    if (value === 'No') return `${COLORS.error.bg} ${COLORS.error.text}`;

    // Skip first column (Variant names)
    if (columnIndex === 0) return '';

    // Convert percentage strings to numbers
    const numValue = parseFloat(value.replace('%', ''));
    if (isNaN(numValue)) return '';

    const columnValues = allRows.map(row => parseFloat(row[columnIndex].replace('%', '')));
    const max = Math.max(...columnValues);
    const min = Math.min(...columnValues);

    if (numValue === max) return COLORS.success.bg;
    if (numValue === min) return COLORS.error.bg;
    return COLORS.warning.bg;
};

const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
};

const calculateAverageScore = (scores: number[]): number => {
    if (!scores.length) return 0;
    const validScores = scores.filter(score => typeof score === 'number' && !isNaN(score));
    return validScores.length ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;
};

export async function countVariationAppearances(variationId: string): Promise<number> {
    try {
        const { data, error } = await supabase
            .from('test_times')
            .select('*', { count: 'exact' })
            .eq('product_id', variationId);

        if (error) {
            console.error('Error counting variation appearances:', error);
            throw error;
        }

        return data?.length || 0;
    } catch (error) {
        console.error('Error in countVariationAppearances:', error);
        throw error;
    }
}

export async function countClicksPerProduct(testId: string, variationType: string): Promise<number> {
    try {
        const { data, error } = await supabase
            .from('test_times')
            .select('*, testers_session!inner(*)')
            .eq('testers_session.test_id', testId)
            .eq('testers_session.variation_type', variationType);

        if (error) {
            console.error('Error counting clicks per product:', error);
            throw error;
        }

        return data?.length || 0;
    } catch (error) {
        console.error('Error in countClicksPerProduct:', error);
        throw error;
    }
}

type VariationType = 'a' | 'b' | 'c';

interface Variant {
    id: string;
    title: string;
    valueScore: number;
}

interface SurveyData {
    [key: string]: any[];
}

const headers = ['Variant', 'Share of Clicks', 'Share of Buy', 'Value Score', 'Win? (90% Confidence)'];

const Summary: React.FC<{
    variants: Variant[],
    surveys: SurveyData,
    comparision: SurveyData,
    testerId: string
}> = ({ variants, surveys, comparision, testerId }) => {
    const [rows, setRows] = useState<string[][]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const processVariantData = async (variant: Variant, index: number): Promise<string[]> => {
        const variationType: VariationType = index === 0 ? 'a' : index === 1 ? 'b' : 'c';

        const [appearances, totalClicks] = await Promise.all([
            countVariationAppearances(variant.id),
            countClicksPerProduct(testerId, variationType)
        ]);

        const shareOfClicks = calculatePercentage(appearances, totalClicks);

        const totalSurveys = surveys[variationType]?.length || 0;
        const totalComparisions = comparision[variationType]?.length || 0;
        const sumCheckouts = totalSurveys + totalComparisions;
        const shareOfBuy = sumCheckouts > 0 ? (totalSurveys / sumCheckouts) * 100 : 0;

        const scores = surveys[variationType]?.map(survey => {
            const metrics = [
                survey.appearance,
                survey.confidence,
                survey.value,
                survey.convenience,
                survey.brand
            ];
            return calculateAverageScore(metrics);
        }) || [];

        const valueScore = scores.length ? calculateAverageScore(scores) : 0;

        return [
            `Variant #${index + 1}: ${variant.title}`,
            formatPercentage(parseFloat(shareOfClicks)),
            formatPercentage(shareOfBuy),
            valueScore.toFixed(1),
            totalClicks >= 30 ? 'Yes' : 'No'
        ];
    };

    useEffect(() => {
        async function loadData() {
            if (!variants || variants.length === 0 || variants.length === 1) return;

            setIsLoading(true);
            setError(null);

            try {
                const newRows = await Promise.all(
                    variants.map((variant, index) => processVariantData(variant, index))
                );
                setRows(newRows);
            } catch (error) {
                console.error('Error loading summary data:', error);
                setError('Failed to load summary data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [variants, testerId, surveys, comparision]);

    const calculatePercentage = (numerator: number, denominator: number): string => {
        if (denominator === 0 || numerator === 0) return '0.0';
        return ((numerator / denominator) * 100).toFixed(1);
    };

    if (isLoading) return (
        <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
    );

    if (error) return (
        <div className="text-center text-red-500 p-4">
            <p>{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
                Retry
            </button>
        </div>
    );

    if (!variants || variants.length === 0) return (
        <p className='text-center text-gray-500'>Not enough variants for analysis.</p>
    );

    return (
        <div className="p-3">
            <h1 className="text-2xl font-bold mb-4">Summary Results</h1>
            <div className="bg-gray-100 p-6 rounded-lg relative mb-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div id="insightPanel" className="flex items-start gap-4 transition-opacity duration-300">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-inner">
                            <span className="text-2xl transform hover:scale-110 transition-transform duration-200">💡</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-2">AI Insight</h3>
                        <p className="text-gray-700 leading-relaxed">
                            Your first variant, Eucalyptus Glow, significantly outperformed the competitive set.
                            The bold but familiar scent name stood out from more traditional competitive options.
                            At your price point, perceived value was exceptional outperforming all other items on shelf.
                            Unfortunately, the other two options underperformed.
                        </p>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto mt-6">
                <table className="w-full border-collapse bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                    <thead>
                        <tr>
                            {headers.map((header, index) => (
                                <th
                                    key={index}
                                    className="p-4 text-left text-gray-600 font-medium border border-gray-200 bg-gray-50"
                                    title={`Sort by ${header}`}
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className="border border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                            >
                                {row.map((cell, cellIndex) => (
                                    <td
                                        key={cellIndex}
                                        className={clsx(
                                            "p-4 border border-gray-100",
                                            getColorForValue(cell, cellIndex, rows, row[0].split(': ')[0].split('#')[1]),
                                            "transition-colors duration-200"
                                        )}
                                        title={`${headers[cellIndex]}: ${cell}`}
                                    >
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Summary;
