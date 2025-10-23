import React, { useState, useMemo } from 'react';
import { useInsightStore } from '../../../hooks/useIaInsight';
import { MarkdownContent } from '../utils/MarkdownContent';
import { getQuestionsByIds, getDefaultQuestions, getQuestionDisplayName } from '../../TestQuestions/questionConfig';
import { InfoTooltip } from '../../../../../components/ui/InfoTooltip';
import { getMetricDescription } from '../../TestQuestions/metricDescriptions';
import { SurveyExampleModal } from '../../../../../components/ui/SurveyExampleModal';
import { HelpCircle } from 'lucide-react';

interface CompetitorProduct {
  product_url: string;
  image_url: string;
  title: string;
  price?: string | number;
}

interface Product {
  image_url: string;
  title: string;
  price?: string | number;
}

interface InsightItem {
  competitor_product_id: CompetitorProduct;
  share_of_buy: number;
  value: number;
  aesthetics: number;
  utility: number;
  trust: number;
  convenience: number;
  count: number;
  variant_type: string;
  product?: Product;
  appearance?: number;
  confidence?: number;
  brand?: number;
  appetizing?: number;
  target_audience?: number;
  novelty?: number;
  isTestProduct?: boolean;
}

interface CompetitiveInsightsProps {
  competitiveinsights: InsightItem[];
  variants: any;
  sumaryvariations: any;
  selectedQuestions?: string[];
}

const getColorClass = (value: number): string => {
  if (value > 0) return 'bg-green-100';
  if (value < 0) return 'bg-red-100';
  return 'bg-yellow-100';
};

const renderCell = (value: number, count: number, isProductCell: boolean) => {
  if (count === 0) return <td className={`border border-gray-300 p-2`}>-</td>;
  const diff = value;
  return (
    <td className={`border border-gray-300 p-2 ${isProductCell ? '' : getColorClass(diff)}`}>
      {isProductCell ? '—' : diff > 3 ? (diff / 3).toFixed(1) : diff.toFixed(1)}
    </td>
  );
};

const CompetitiveInsights: React.FC<CompetitiveInsightsProps> = ({
  competitiveinsights,
  variants,
  sumaryvariations,
  selectedQuestions: propSelectedQuestions = getDefaultQuestions(),
}) => {
  const [selectedVariant, setSelectedVariant] = useState('a');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { insight, aiInsights, getInsightForVariant } = useInsightStore();
  
  const selectedQuestions = propSelectedQuestions;

  // Memoize question configs to avoid recomputing on every row render
  const questionConfigs = useMemo(() => getQuestionsByIds(selectedQuestions), [selectedQuestions]);

  // Memoize field mappings to avoid recreating the object on every row render
  const fieldMappings = useMemo<{ [key: string]: string[] }>(() => ({
    'value': ['value'],
    'appearance': ['appearance', 'aesthetics'],
    'aesthetics': ['aesthetics', 'appearance'],
    'brand': ['brand', 'trust'],
    'confidence': ['confidence', 'utility'],
    'convenience': ['convenience'],
    'utility': ['utility', 'confidence'],
    'appetizing': ['appetizing', 'aesthetics'],
    'target_audience': ['target_audience', 'utility'],
    'novelty': ['novelty', 'utility']
  }), []);

  if (!competitiveinsights || competitiveinsights.length === 0) {
    return null;
  }

  // Get variant-specific AI insights
  const currentVariantInsight = getInsightForVariant(selectedVariant);

  // Filter competitive insights for selected variant and sort by share of buy

  const filtered = competitiveinsights
    .filter(item => item.variant_type === selectedVariant)
    .sort((a, b) => {
      // Test products always come first
      if (a.isTestProduct && !b.isTestProduct) return -1;
      if (!a.isTestProduct && b.isTestProduct) return 1;
      
      // If both are test products or both are competitors, sort by share of buy
      return Number(b.share_of_buy || 0) - Number(a.share_of_buy || 0);
    });


  // The filtered data now includes both test product and competitors from the dataInsightService
  const filteredInsights = filtered;

  // Generate dynamic headers based on selected questions
  const getDynamicHeaders = () => {
    // Create headers array
    const headers = ['Product', 'Share of Buy'];
    
    questionConfigs.forEach(question => {
      const displayName = getQuestionDisplayName(question.id);
      headers.push(displayName);
    });

    return headers;
  };

  const headers = selectedQuestions.length > 0 ? getDynamicHeaders() : [
    'Product',
    'Share of Buy',
    'Value',
    'Aesthetics',
    'Utility',
    'Trust',
    'Convenience',
  ];
  const columnCount = headers.length;

  // Get available variants only from competitive insights data
  // Only show variants that actually have competitive insights data
  const availableVariants = [
    ...new Set(competitiveinsights.map(item => item.variant_type))
  ].sort();


  // If selected variant is not available, switch to the first available variant
  if (availableVariants.length > 0 && !availableVariants.includes(selectedVariant)) {
    setSelectedVariant(availableVariants[0] as 'a' | 'b' | 'c');
  }

  // If no variants have competitive insights data, show a message
  if (availableVariants.length === 0) {
    return (
      <div className="w-full p-4 bg-white rounded-xl shadow-sm">
        <h2 className="text-xl font-bold mb-6 text-gray-800 text-start">Competitive Insights</h2>
        <div className="text-center py-8 text-gray-500">
          No competitive insights data available for this test.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 bg-white rounded-xl shadow-sm">
      <h2 className="text-xl font-bold mb-6 text-gray-800 text-start">Competitive Insights</h2>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {availableVariants.map(variant => (
              <button
                key={`variant-btn-${variant}`}
                onClick={() => setSelectedVariant(variant)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedVariant === variant
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Variant {variant.toUpperCase()}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Display variant-specific AI insights */}
      {currentVariantInsight && currentVariantInsight.competitive_insights && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            AI Analysis for Variant {selectedVariant.toUpperCase()}
          </h3>
          <MarkdownContent content={currentVariantInsight.competitive_insights} />
        </div>
      )}

      {/* Fallback to general insights if no variant-specific insight */}
      {!currentVariantInsight && insight && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg mb-6">
          <MarkdownContent content={
            selectedVariant === 'a' ? insight.competitive_insights_a || '' :
            selectedVariant === 'b' ? insight.competitive_insights_b || '' :
            selectedVariant === 'c' ? insight.competitive_insights_c || '' : ''
          } />
        </div>
      )}

            {filteredInsights.length === 0 ? (
        <p className="text-red-500">No data available for this variant</p>
      ) : (
        <>
          <table className="min-w-full border-collapse max-w-screen-md table-fixed" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              {Array.from({ length: columnCount }, (_, index) => (
                <col key={index} style={{ width: `${100 / columnCount}%` }} />
              ))}
            </colgroup>
            <thead>
              <tr className="bg-gray-100 border-none">
                <th colSpan={2} className="p-2 bg-white"></th>
                <th colSpan={headers.length - 2} className="border border-gray-300 p-2">
                  <div className="flex items-center justify-center gap-2">
                    <span>Your Item vs Competitor</span>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                      aria-label="View example of how testers answer questions"
                      title="Click to see example"
                    >
                      <HelpCircle className="h-5 w-5" />
                    </button>
                  </div>
                </th>
              </tr>
              <tr className="bg-gray-100">
                {headers.map((header, index) => {
                  // Get the question ID for this header to show the right tooltip
                  let questionId = '';
                  if (index === 0) {
                    questionId = 'product';
                  } else if (index === 1) {
                    questionId = 'share_of_buy';
                  } else if (selectedQuestions.length > 0) {
                    questionId = selectedQuestions[index - 2] || '';
                  }
                  
                  return (
                    <th key={header} className="border border-gray-300 p-2 text-left">
                      <div className="flex items-center gap-1">
                        <span>{header}</span>
                        {questionId && questionId !== 'product' && (
                          <InfoTooltip content={getMetricDescription(questionId)} />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filteredInsights.map((item, index) => {
                // Map question IDs to their corresponding data fields with fallbacks for legacy data
                const getValueForQuestion = (questionId: string): number => {
                  const possibleFields = fieldMappings[questionId] || [questionId];
                  
                  // Try each field in order until we find one that exists (not undefined/null)
                  for (const fieldName of possibleFields) {
                    const raw = item[fieldName as keyof InsightItem];
                    const value = typeof raw === 'number' ? raw : Number(raw);
                    if (raw !== undefined && raw !== null && !Number.isNaN(value)) {
                      return value;
                    }
                  }
                  
                  // Fallback to the first field
                  const fallback = item[possibleFields[0] as keyof InsightItem];
                  return typeof fallback === 'number' ? fallback : Number(fallback) || 0;
                };

                return (
                  <tr key={index}>
                    <td className="border border-gray-200 px-3 py-2 align-top bg-gray-50">
                      <div className="relative group">
                        <a
                          href={item.competitor_product_id?.product_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3"
                        >
                          <img
                            src={item.competitor_product_id?.image_url || item.product?.image_url}
                            alt={item.competitor_product_id?.title || item.product?.title}
                            className="w-16 h-16 rounded object-cover shadow-sm"
                          />
                          <span className="text-xs font-semibold text-gray-700">
                            ${item.competitor_product_id?.price || item.product?.price}
                          </span>
                        </a>

                        <div
                          className="absolute top-0 left-full ml-3 px-2 py-1 rounded bg-gray-900 text-white text-xs 
                        whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                        >
                          {(item.competitor_product_id?.title || item.product?.title || '').slice(
                            0,
                            40
                          )}
                          {(item.competitor_product_id?.title || item.product?.title || '').length >
                          40
                            ? '...'
                            : ''}
                        </div>

                        {item.count === 1 && (
                          <span
                            className="absolute -top-1 -right-1 w-5 h-5 bg-blue-200 text-blue-900 
                          rounded-full flex items-center justify-center text-[10px] shadow"
                          >
                            🔍
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 p-2">
                      {item.isTestProduct ? 
                        `${Number(item.share_of_buy || 0).toFixed(1)}%` : 
                        (item.count > 0 ? `${Number(item.share_of_buy || 0).toFixed(1)}%` : '-')
                      }
                    </td>
                    {selectedQuestions.length > 0 ? (
                      questionConfigs.map((question, questionIndex) => {
                        const value = getValueForQuestion(question.id);
                        const cell = renderCell(
                          Number(value),
                          item.count || (item.isTestProduct ? 1 : 0),
                          !!item.product
                        );
                        return <React.Fragment key={`${index}-${questionIndex}`}>{cell}</React.Fragment>;
                      })
                    ) : (
                      <>
                        {renderCell(Number(item.value), item.count || (item.isTestProduct ? 1 : 0), !!item.product)}
                        {renderCell(
                          Number(item.aesthetics || item.appearance || 0),
                          item.count || (item.isTestProduct ? 1 : 0),
                          !!item.product
                        )}
                        {renderCell(
                          Number(item.utility || item.confidence || 0),
                          item.count || (item.isTestProduct ? 1 : 0),
                          !!item.product
                        )}
                        {renderCell(Number(item.trust || item.brand || 0), item.count || (item.isTestProduct ? 1 : 0), !!item.product)}
                        {renderCell(Number(item.convenience || 0), item.count || (item.isTestProduct ? 1 : 0), !!item.product)}
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="space-y-2 mt-4 text-sm text-gray-600">
            <p>
              Products marked with
              <span className="inline-flex items-center justify-center bg-blue-100 text-black rounded-full w-4 h-4 text-[10px] mx-1">
                🔍
              </span>
              have only one observation.
            </p>
            <p>Click on the product image to see details.</p>
            <p className="text-xs text-gray-500 mt-2">
              <strong>Note:</strong> Share of Buy represents the percentage of participants who selected
              each product within this variant. Percentages may not sum to exactly 100% due to rounding
              or participants who didn't make a selection.
            </p>
          </div>
        </>
      )}
      
      <SurveyExampleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default CompetitiveInsights;
