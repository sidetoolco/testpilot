import { useState, useMemo } from "react";
import { useInsightStore } from "../../../hooks/useIaInsight";
import ReactMarkdown from "react-markdown";

interface CompetitorProduct {
  product_url: string;
  image_url: string;
  title: string;
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
  variant_type: string; // 👈 importante para el filtro
}

interface CompetitiveInsightsProps {
  competitiveinsights: InsightItem[];
}

const getColorClass = (value: number): string => {
  if (value > 3) return "bg-green-100";
  if (value < 3) return "bg-red-100";
  return "bg-yellow-100";
};

const CompetitiveInsights: React.FC<CompetitiveInsightsProps> = ({
  competitiveinsights,
}) => {
  if (!competitiveinsights || competitiveinsights.length === 0) return null;

  const [selectedVariant, setSelectedVariant] = useState("a");
  const { insight, loading } = useInsightStore();

  // 🔍 Filtrar datos por variant_type
  const filteredInsights = useMemo(() => {
    return competitiveinsights
      .filter((item) => item.variant_type === selectedVariant)
      .sort((a, b) => b.share_of_buy - a.share_of_buy);
  }, [competitiveinsights, selectedVariant]);

  // 🎯 Calcular rangos de share_of_buy solo con los filtrados
  const shareOfBuyRanks = useMemo(() => {
    const validValues = filteredInsights
      .filter((item) => item.count > 0)
      .map((item) => item.share_of_buy);
    const uniqueSorted = Array.from(new Set(validValues)).sort((a, b) => a - b);

    const min = uniqueSorted[0];
    const max = uniqueSorted[uniqueSorted.length - 1];

    return { min, max };
  }, [filteredInsights]);

  const getShareOfBuyColor = (value: number) => {
    if (value === shareOfBuyRanks.max) return "bg-green-100";
    if (value === shareOfBuyRanks.min) return "bg-red-100";
    if (value > shareOfBuyRanks.min && value < shareOfBuyRanks.max)
      return "bg-yellow-100";
    return "";
  };

  const renderCell = (value: number, count: number) => {
    if (count === 0) return <td className={`border border-gray-300 p-2`}>-</td>;
    const diff = value - 3;
    return (
      <td className={`border border-gray-300 p-2 ${getColorClass(diff)}`}>
        {diff.toFixed(1)}
      </td>
    );
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-6 text-gray-800 text-center">
        Competitive Insights
      </h2>

      <div className="mb-6 flex items-center justify-center space-x-3">
        {["a", "b", "b"].map((variant) => (
          <button
            key={`variant-btn-${variant}`}
            onClick={() => setSelectedVariant(variant)}
            className={`px-6 py-2 rounded font-medium transition-colors
                  ${
                    selectedVariant === variant
                      ? "bg-green-500 text-white hover:bg-green-600" // Selected variant in green
                      : "bg-green-200 text-black hover:bg-gray-400" // Other available variants in light gray
                  }`}
          >
            Variation {variant.toUpperCase()}
          </button>
        ))}
      </div>

      {filteredInsights.length === 0 ? (
        <p className="text-red-500">No data available for this variant</p>
      ) : (
        <table className="min-w-full border-collapse max-w-screen-md">
          <thead>
            <tr className="bg-gray-100 border-none">
              <th colSpan={2} className="p-2 bg-[#fff8f8]"></th>
              <th colSpan={5} className="border border-gray-300 p-2">
                Your Item vs Competitor
              </th>
            </tr>
            <tr className="bg-gray-200">
              {[
                "Picture",
                "Share of Buy",
                "Value",
                "Aesthetics",
                "Utility",
                "Trust",
                "Convenience",
              ].map((header) => (
                <th key={header} className="border border-gray-300 p-2">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredInsights.map((item, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border border-gray-300 p-2">
                  <a
                    href={item.competitor_product_id.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="relative">
                      <img
                        src={item.competitor_product_id.image_url}
                        alt={item.competitor_product_id.title}
                        className="w-10 h-10"
                      />
                      {item.count === 1 && (
                        <span className="absolute -top-1 -right-1 bg-blue-100 text-black rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                          🔍
                        </span>
                      )}
                    </div>
                  </a>
                </td>
                <td
                  className={`border border-gray-300 p-2 ${
                    item.count > 0 ? getShareOfBuyColor(item.share_of_buy) : ""
                  }`}
                >
                  {item.count > 0 ? `${item.share_of_buy.toFixed(1)}%` : "-"}
                </td>
                {renderCell(item.value, item.count)}
                {renderCell(item.aesthetics, item.count)}
                {renderCell(item.utility, item.count)}
                {renderCell(item.trust, item.count)}
                {renderCell(item.convenience, item.count)}
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

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <strong>In summary...</strong>
        {insight && !loading && (
          <ReactMarkdown>{insight.competitive_insights}</ReactMarkdown>
        )}
      </div>
    </div>
  );
};

export default CompetitiveInsights;
