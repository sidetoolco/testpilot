import React, { CSSProperties } from 'react';
import { scaleBand, scaleLinear } from 'd3';
import { useInsightStore } from '../../../hooks/useIaInsight';
import { MarkdownContent } from '../utils/MarkdownContent';

const LABELS = ['Value', 'Aesthetics', 'Utility', 'Trust', 'Convenience'];
const COLORS = ['#43A8F6', '#708090', '#008080'];

// Define interfaces for surveys and products
interface Survey {
  id: string;
  variant_type: string;
  product: {
    title: string;
  };
  value: number;
  appearance: number;
  confidence: number;
  brand: number;
  convenience: number;
  count?: number;
}

const PurchaseDrivers: React.FC<{ surveys: Survey[] }> = ({ surveys }) => {
  const { insight, loading } = useInsightStore();

  if (loading) return <p>Loading insights...</p>;
  if (!surveys || surveys.length === 0) return <p>Your product was not chosen for this test</p>;

  const datasets = surveys.map((product, productIndex) => {
    if (!product || !product.product) {
      return {
        label: `Variant ${product.variant_type} : Unknown Product`,
        productId: product.id,
        backgroundColor: COLORS[productIndex % COLORS.length],
        borderRadius: 5,
        data: [0, 0, 0, 0, 0],
      };
    }
    return {
      label: `Variant ${product.variant_type} : ${product.product.title.substring(0, 30)}`,
      productId: product.id,
      backgroundColor: COLORS[productIndex % COLORS.length],
      borderRadius: 5,
      data: [
        product.value,
        product.appearance,
        product.confidence,
        product.brand,
        product.convenience,
      ],
    };
  });

  const xScale = scaleBand().domain(LABELS).range([0, 100]).padding(0.3);

  const subXScale = scaleBand()
    .domain(datasets.map((dataset: any) => dataset.productId))
    .range([0, xScale.bandwidth()])
    .padding(0.1);

  const yScale = scaleLinear().domain([0, 5]).range([100, 0]);

  return (
    <div className="p-3">
      <div className="bg-gray-100 p-6 rounded-lg relative mb-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div id="insightPanel" className="flex items-start gap-4 transition-opacity duration-300">
          <div className="text-gray-700 leading-relaxed">
            <MarkdownContent content={insight.purchase_drivers} />
          </div>
        </div>
      </div>

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
            {datasets.map((dataset: any, index: number) => (
              <div key={index} className="flex items-center space-x-1">
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
            {yScale.ticks(8).map((value, i) => (
              <div
                key={i}
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
              {LABELS.map((label, i) => (
                <div
                  key={i}
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
                {yScale.ticks(8).map((value, i) => (
                  <g
                    key={i}
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
                dataset.data.map((value: number, index: number) => (
                  <div
                    key={`${dataset.productId}-${index}`}
                    className="absolute bottom-0 rounded-t"
                    style={{
                      left: `${xScale(LABELS[index])! + subXScale(dataset.productId)!}%`,
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
                ))
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
