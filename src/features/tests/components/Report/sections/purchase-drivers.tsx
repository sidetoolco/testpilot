import React, { CSSProperties } from "react";
import { scaleBand, scaleLinear } from "d3";
interface Survey {
    product_id: string;
    products: { title: string };
    value: number;
    appearance: number;
    confidence: number;
    brand: number;
    convenience: number;
    tester_id: { variation_type: string };
}

interface GroupedSurvey {
    [key: string]: Survey[];
}

const LABELS = ['Value', 'Aesthetics', 'Utility', 'Trust', 'Convenience'];
const COLORS = ["#34A270", "#075532", "#E0D30D"];

const getProductName = (productId: string): string => {
    return `Variant ${productId.substring(0, 40)}...`;
};

const PurchaseDrivers: React.FC<{ surveys: { a: Survey[]; b: Survey[]; c: Survey[] } }> = ({ surveys }) => {
    if (!surveys || Object.keys(surveys).length === 0) return <p>Your product was not chosen for this test</p>;

    const groupedSurveys: GroupedSurvey = Object.entries(surveys).reduce((acc, [variationType, surveyArray]) => {
        if (!acc[variationType]) acc[variationType] = [];
        acc[variationType].push(...surveyArray);
        return acc;
    }, {} as GroupedSurvey);

    const productIds = Object.keys(groupedSurveys);

    const datasets = productIds.map((productId, productIndex) => {
        const surveys = groupedSurveys[productId];
        const total = surveys.length;
        const avgRatings = surveys.reduce(
            (acc, survey) => {
                acc[0] += survey.value;
                acc[1] += survey.appearance;
                acc[2] += survey.confidence;
                acc[3] += survey.brand;
                acc[4] += survey.convenience;
                return acc;
            },
            [0, 0, 0, 0, 0]
        ).map(val => val / total);

        return {
            label: getProductName(productId + ': ' + surveys[0].products.title),
            data: avgRatings,
            productId,
            keys: LABELS.map((label, index) => ({ key: label, value: avgRatings[index] })),
            backgroundColor: COLORS[productIndex % COLORS.length],
            borderRadius: 5,
        };
    });

    const xScale = scaleBand()
        .domain(LABELS)
        .range([0, 100])
        .padding(0.3);

    const subXScale = scaleBand()
        .domain(productIds)
        .range([0, xScale.bandwidth()])
        .padding(0.1);

    const yScale = scaleLinear()
        .domain([0, 5])
        .range([100, 0]);

    // Iterate over each variation type
    const variationAverages = Object.entries(surveys as Record<string, Survey[]>).map(([variationType, surveyArray]) => {
        const total = surveyArray.length;
        const avgRatings = surveyArray.reduce(
            (acc: number[], survey: Survey) => {
                acc[0] += survey.value;
                acc[1] += survey.appearance;
                acc[2] += survey.confidence;
                acc[3] += survey.brand;
                acc[4] += survey.convenience;
                return acc;
            },
            [0, 0, 0, 0, 0]
        ).map((val: number) => val / total);

        return {
            variationType,
            avgRatings
        };
    });

    // Compare averages (this is a placeholder for actual comparison logic)
    console.log('Variation Averages:', variationAverages);

    return (
        <div>

            <h2 className="text-xl font-bold mb-16">Purchase Drivers</h2>
            <div className="relative h-72 w-full grid" style={{
                "--marginTop": "0px",
                "--marginRight": "25px",
                "--marginBottom": "55px",
                "--marginLeft": "25px",
            } as CSSProperties}>
                {/* Legend */}
                <div className="absolute -top-12 left-0 flex space-x-2 p-2 bg-white rounded shadow">
                    {datasets.map((dataset, index) => (
                        <div key={index} className="flex items-center space-x-1">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: dataset.backgroundColor }}></div>
                            <span className="text-xs text-gray-600">{dataset.label}</span>
                        </div>
                    ))}
                </div>

                {/* Y axis */}
                <div className="relative h-[calc(100%-var(--marginTop)-var(--marginBottom))] w-[var(--marginLeft)] translate-y-[var(--marginTop)] overflow-visible">
                    {yScale.ticks(8).map((value, i) => (
                        <div key={i} style={{ top: `${yScale(value)}%` }}
                            className="absolute text-xs tabular-nums -translate-y-1/2 text-gray-300 w-full text-right pr-2">
                            {value}
                        </div>
                    ))}
                </div>

                {/* Chart Area */}
                <div className="absolute inset-0 h-[calc(100%-var(--marginTop)-var(--marginBottom))] w-[calc(100%-var(--marginLeft)-var(--marginRight))] translate-x-[var(--marginLeft)] translate-y-[var(--marginTop)] overflow-visible">
                    <div className="relative w-full h-full">
                        {LABELS.map((label, i) => (
                            <div key={i} className="absolute text-xs text-gray-600" style={{
                                left: `${xScale(label)! + xScale.bandwidth() / 2}%`,
                                top: "100%",
                                transform: "translateX(-50%) translateY(8px)",
                            }}>
                                {label}
                            </div>
                        ))}

                        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            {yScale.ticks(8).map((value, i) => (
                                <g key={i} transform={`translate(0,${yScale(value)})`} className="text-gray-300/80 dark:text-gray-800/80">
                                    <line x1={0} x2={100} stroke="currentColor" strokeDasharray="6,5" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
                                </g>
                            ))}
                        </svg>

                        {datasets.map((dataset) => (
                            dataset.keys.map(({ key, value }) => (
                                <div key={`${dataset.productId}-${key}`} className="absolute bottom-0 rounded-t" style={{
                                    left: `${xScale(key)! + subXScale(dataset.productId)!}%`,
                                    width: `${subXScale.bandwidth()}%`,
                                    height: `${100 - yScale(value)}%`,
                                    backgroundColor: dataset.backgroundColor,
                                    border: `1px solid #a07dff22`,
                                }}>
                                    <span className="absolute top-0 text-xs text-white w-full text-center">{value.toFixed(2)}</span>
                                </div>
                            ))
                        ))}
                    </div>
                </div>
            </div>
        </div>

    );
};

export default PurchaseDrivers;
