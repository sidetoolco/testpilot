import React, { useState } from 'react';
import { useInsightStore } from '../../../hooks/useIaInsight';
import { MarkdownContent } from '../utils/MarkdownContent';

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
}

interface CompetitiveInsightsProps {
  competitiveinsights: InsightItem[];
  variants: any;
  sumaryvariations: any;
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
      {isProductCell ? '—' : diff > 3 ? (diff / 3).toFixed(1) : diff}
    </td>
  );
};

const CompetitiveInsights: React.FC<CompetitiveInsightsProps> = ({
  competitiveinsights,
  variants,
  sumaryvariations,
}) => {
  const [selectedVariant, setSelectedVariant] = useState('a');
  const { insight } = useInsightStore();

  if (!competitiveinsights || competitiveinsights.length === 0) {
    return null;
  }

  // Get available variants
  const availableVariants = [...new Set(competitiveinsights.map(item => item.variant_type))].sort();

  // Filter insights for selected variant
  const shareOfBuy = sumaryvariations?.find((variation: any) =>
    variation.title.includes('Variant ' + selectedVariant.toUpperCase())
  )?.shareOfBuy;

  const filteredVariant = variants?.find((variant: any) => variant.variant_type === selectedVariant);
  
  if (filteredVariant) {
    filteredVariant.share_of_buy = shareOfBuy;
  }

  const filtered = competitiveinsights
    .filter(item => item.variant_type === selectedVariant)
    .sort((a, b) => b.share_of_buy - a.share_of_buy);

  const filteredInsights = filteredVariant ? [filteredVariant, ...filtered] : filtered;

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-6 text-gray-800 text-center">Competitive Insights</h2>

      <div className="mb-6 flex items-center justify-center space-x-3">
        {availableVariants.map(variant => (
          <button
            key={variant}
            onClick={() => setSelectedVariant(variant)}
            className={`px-6 py-2 rounded font-medium transition-colors
              ${
                selectedVariant === variant
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-green-200 text-black hover:bg-gray-400'
              }`}
          >
            Variant {variant.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg mb-6">
        <MarkdownContent content={insight?.competitive_insights || ''} />
      </div>

      {filteredInsights.length === 0 ? (
        <p className="text-red-500">No data available for this variant</p>
      ) : (
        <table className="min-w-full border-collapse max-w-screen-md">
          <thead>
            <tr className="bg-gray-100 border-none">
              <th colSpan={2} className="p-2 bg-white"></th>
              <th colSpan={5} className="border border-gray-300 p-2">
                Your Item vs Competitor
              </th>
            </tr>
            <tr className="bg-gray-100">
              {[
                'Product',
                'Share of Buy',
                'Value',
                'Aesthetics',
                'Utility',
                'Trust',
                'Convenience',
              ].map(header => (
                <th key={header} className="border border-gray-300 p-2 text-left">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredInsights.map((item, index) => (
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

                    <div className="absolute top-0 left-full ml-3 px-2 py-1 rounded bg-gray-900 text-white text-xs 
                      whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      {(item.competitor_product_id?.title || item.product?.title || '').slice(0, 40)}
                      {(item.competitor_product_id?.title || item.product?.title || '').length > 40 ? '...' : ''}
                    </div>

                    {item.count === 1 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-200 text-blue-900 
                        rounded-full flex items-center justify-center text-[10px] shadow">
                        🔍
                      </span>
                    )}
                  </div>
                </td>
                <td className="border border-gray-300 p-2">
                  {item.count > 0 ? `${item.share_of_buy}%` : '-'}
                </td>
                {renderCell(Number(item.value), item.count, !!item.product)}
                {renderCell(Number(item.aesthetics || item.appearance || 0), item.count, !!item.product)}
                {renderCell(Number(item.utility || item.confidence || 0), item.count, !!item.product)}
                {renderCell(Number(item.trust || item.brand || 0), item.count, !!item.product)}
                {renderCell(Number(item.convenience || 0), item.count, !!item.product)}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="space-y-2 mt-4 text-sm text-gray-600">
        <p>
          Products marked with
          <span className="inline-flex items-center justify-center bg-blue-100 text-black rounded-full w-4 h-4 text-[10px] mx-1">
            🔍
          </span>
          have only one observation.
        </p>
        <p>Click on the product image to see details.</p>
      </div>
    </div>
  );
};

export default CompetitiveInsights;
