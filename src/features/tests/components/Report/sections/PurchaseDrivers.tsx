import React, { CSSProperties } from 'react';
import { scaleBand, scaleLinear } from 'd3';

import { MarkdownContent } from '../utils/MarkdownContent';

// Define interfaces for surveys and products
interface Survey {
  id: string;
  variant_type: string;
  product: {
    title: string;
  };
  value: number | null;
  appearance: number | null;
  confidence: number | null;
  brand: number | null;
  convenience: number | null;
  appetizing: number | null;
  target_audience: number | null;
  novelty: number | null;
  count?: number;
}

const PurchaseDrivers: React.FC<{ surveys: Survey[]; insights?: any; aiInsights?: any[] }> = ({
  surveys,
  insights,
  aiInsights,
}) => {
  if (!insights && !aiInsights) return <p>Loading insights...</p>;
  if (!surveys || surveys.length === 0) return <p>Your product was not chosen for this test</p>;

  // Define all possible question fields and their labels
  const questionFields = [
    { field: 'value', label: 'Value' },
    { field: 'appearance', label: 'Aesthetics' },
    { field: 'confidence', label: 'Utility' },
    { field: 'brand', label: 'Trust' },
    { field: 'convenience', label: 'Convenience' },
    { field: 'appetizing', label: 'Appetizing' },
    { field: 'target_audience', label: 'Target Audience' },
    { field: 'novelty', label: 'Novelty' },
  ];

  // Determine which questions have actual data (not all null)
  const getActiveQuestions = () => {
    const questionStats = questionFields.map(({ field, label }) => {
      const hasData = surveys.some(survey => {
        const value = survey[field as keyof Survey];
        return value !== null && value !== undefined && !isNaN(Number(value));
      });
      
      return { field, label, hasData };
    });

    return questionStats.filter(q => q.hasData);
  };

  const activeQuestions = getActiveQuestions();
  const LABELS = activeQuestions.map(q => q.label);
  const COLORS = ['#43A8F6', '#708090', '#008080'];

  const datasets = surveys.map((product, productIndex) => {
    if (!product || !product.product) {
      return {
        label: `Variant ${product.variant_type} : Unknown Product`,
        productId: product.id,
        backgroundColor: COLORS[productIndex % COLORS.length],
        borderRadius: 5,
        data: activeQuestions.map(q => product[q.field as keyof Survey] as number || 0),
      };
    }
    return {
      label: `Variant ${product.variant_type} : ${product.product.title.substring(0, 30)}`,
      productId: product.id,
      backgroundColor: COLORS[productIndex % COLORS.length],
      borderRadius: 5,
      data: activeQuestions.map(q => product[q.field as keyof Survey] as number || 0),
    };
  });

  const xScale = scaleBand().domain(LABELS).range([0, 100]).padding(0.3);

  const subXScale = scaleBand()
    .domain(datasets.map((dataset: any) => dataset.productId))
    .range([0, xScale.bandwidth()])
    .padding(0.1);

  const yScale = scaleLinear().domain([0, 5]).range([100, 0]);

 
  // Get general insights (variant_type is null or undefined)
  const getGeneralInsights = () => {
    if (!aiInsights || !Array.isArray(aiInsights)) return null;
    // With the new structure, the single insight object contains all the data
    return aiInsights.length > 0 ? aiInsights[0] : null;
  };

  const generalInsights = getGeneralInsights();

  return (
    <div className="p-1">
      {/* General insights (if available) */}
      {generalInsights?.purchase_drivers && (
        <div className="bg-gray-100 p-4 rounded-lg relative mb-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start gap-4 transition-opacity duration-300">
            <div className="text-gray-700 leading-relaxed">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Purchase Drivers</h3>
              <MarkdownContent content={generalInsights.purchase_drivers} />
            </div>
          </div>
        </div>
      )}

      {/* Fallback to old insights format */}
      {!generalInsights?.purchase_drivers && insights?.purchase_drivers && (
        <div className="bg-gray-100 p-6 rounded-lg relative mb-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div id="insightPanel" className="flex items-start gap-4 transition-opacity duration-300">
            <div className="text-gray-700 leading-relaxed">
              <MarkdownContent content={insights.purchase_drivers} />
            </div>
          </div>
        </div>
      )}

      {!generalInsights?.purchase_drivers && !insights?.purchase_drivers && (
        <div className="bg-gray-100 p-6 rounded-lg relative mb-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="text-gray-500 text-center">
            No purchase drivers insights available for this test.
          </div>
        </div>
      )}

      <div className="p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-16">Purchase Drivers</h2>
        <div
          className="relative h-72 w-full grid"
          style={
            {
              '--marginTop': '0px',
              '--marginRight': '25px',
              '--marginBottom': '55px',
              '--marginLeft': '25px',
            } as CSSProperties
          }
        >
          {/* Legend */}
          <div className="absolute -top-12 left-0 flex space-x-2 p-2 bg-white rounded shadow">
            {datasets.map((dataset: any) => (
              <div key={dataset.productId} className="flex items-center space-x-1">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: dataset.backgroundColor }}
                ></div>
                <span className="text-xs text-gray-600">{dataset.label}</span>
              </div>
            ))}
          </div>

          {/* Y axis */}
          <div className="relative h-[calc(100%-var(--marginTop)-var(--marginBottom))] w-[var(--marginLeft)] translate-y-[var(--marginTop)] overflow-visible">
            {yScale.ticks(8).map(value => (
              <div
                key={value}
                style={{ top: `${yScale(value)}%` }}
                className="absolute text-xs tabular-nums -translate-y-1/2 text-gray-300 w-full text-right pr-2"
              >
                {value.toFixed(1)}
              </div>
            ))}
          </div>

          {/* Chart Area */}
          <div className="absolute inset-0 h-[calc(100%-var(--marginTop)-var(--marginBottom))] w-[calc(100%-var(--marginLeft)-var(--marginRight))] translate-x-[var(--marginLeft)] translate-y-[var(--marginTop)] overflow-visible">
            <div className="relative w-full h-full">
              {LABELS.map(label => (
                <div
                  key={label}
                  className="absolute text-xs text-gray-600"
                  style={{
                    left: `${xScale(label)! + xScale.bandwidth() / 2}%`,
                    top: '100%',
                    transform: 'translateX(-50%) translateY(8px)',
                  }}
                >
                  {label}
                </div>
              ))}

              <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {yScale.ticks(8).map(value => (
                  <g
                    key={value}
                    transform={`translate(0,${yScale(value)})`}
                    className="text-gray-300/80 dark:text-gray-800/80"
                  >
                    <line
                      x1={0}
                      x2={100}
                      stroke="currentColor"
                      strokeDasharray="6,5"
                      strokeWidth={0.5}
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                ))}
              </svg>

              {datasets.map((dataset: any) =>
                LABELS.map((label, labelIndex) => {
                  const value = dataset.data[labelIndex];
                  return (
                    <div
                      key={`${dataset.productId}-${label}`}
                      className="absolute bottom-0 rounded-t"
                      style={{
                        left: `${xScale(label)! + subXScale(dataset.productId)!}%`,
                        width: `${subXScale.bandwidth()}%`,
                        height: `${100 - yScale(value)}%`,
                        backgroundColor: dataset.backgroundColor,
                        border: `1px solid #a07dff22`,
                      }}
                    >
                      <span className="absolute top-0 text-xs text-white w-full text-center">
                        {value.toFixed(1)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {surveys.map((survey: any) => (
          <div key={survey.id}>
            {survey.count === 1 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Only one observation in variant {survey.variant_type}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {survey.count === 0 ||
              (!survey.count && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">
                        No observations in variant {survey.variant_type}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PurchaseDrivers;
