import React, { useEffect, useState } from "react";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
const COLORS = {
  success: {
    bg: "bg-[#ebfff7]",
    text: "text-green-600",
  },
  error: {
    bg: "bg-[#fff5f5]",
    text: "text-red-500",
  },
  warning: {
    bg: "bg-[#fffbeb]",
    text: "text-yellow-600",
  },
} as const;

const getColorForValue = (
  value: string,
  columnIndex: number,
  allRows: string[][],
  testid: string
) => {
  if (value === "Yes") return `${COLORS.success.bg} ${COLORS.success.text}`;
  if (value === "No") return `${COLORS.error.bg} ${COLORS.error.text}`;

  // Skip first column (Variant names)
  if (columnIndex === 0) return "";

  // Convert percentage strings to numbers
  const numValue = parseFloat(value.replace("%", ""));
  if (isNaN(numValue)) return "";

  const columnValues = allRows.map((row) =>
    parseFloat(row[columnIndex].replace("%", ""))
  );
  const max = Math.max(...columnValues);
  const min = Math.min(...columnValues);

  if (numValue === max) return COLORS.success.bg;
  if (numValue === min) return COLORS.error.bg;
  return COLORS.warning.bg;
};

const headers = [
  "Variant",
  "Share of Clicks",
  "Share of Buy",
  "Value Score",
  "Win? (90% Confidence)",
];

const Summary: React.FC<{
  summaryData: any;
  insights: any;
}> = ({ summaryData, insights }) => {
  const [rows, setRows] = useState<string[][]>([]);
  const [showFullText, setShowFullText] = useState(false);
  const maxLength = 250;

  useEffect(() => {
    async function loadData() {
      if (!summaryData) return;

      const { rows: summaryRows } = summaryData;

      setRows(
        summaryRows.map((row: any) => [
          row.title,
          `${parseFloat(row.shareOfClicks).toFixed(1)}%`,
          `${parseFloat(row.shareOfBuy).toFixed(1)}%`,
          (parseFloat(row.valueScore) || 0).toFixed(1),
          row.isWinner,
        ])
      );
    }
    loadData();
  }, [summaryData]);

  const toggleText = () => {
    setShowFullText(!showFullText);
  };

  const renderText = () => {
    if (!insights) return "";

    const fullText = insights.comparison_between_variants;
    if (showFullText || fullText.length <= maxLength) {
      return <ReactMarkdown>{fullText}</ReactMarkdown>;
    }

    const truncatedText = fullText.substring(0, maxLength) + "...";
    return <ReactMarkdown>{truncatedText}</ReactMarkdown>;
  };

  if (!summaryData)
    return (
      <p className="text-center text-gray-500">
        Not enough variants for analysis.
      </p>
    );

  return (
    <div className="p-3">
      <h1 className="text-2xl font-bold mb-4">Summary Results</h1>
      <div className="bg-gray-100 p-6 rounded-lg relative mb-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div
          id="insightPanel"
          className="flex items-start gap-4 transition-opacity duration-300"
        >
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-inner">
              <span className="text-2xl transform hover:scale-110 transition-transform duration-200">
                💡
              </span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">AI Insight</h3>
            <div className="text-gray-700 leading-relaxed">
              {renderText()}
              {insights.comparison_between_variants &&
                insights.comparison_between_variants.length > maxLength && (
                  <button onClick={toggleText} className="text-blue-500">
                    {showFullText ? "See Less" : "See More"}
                  </button>
                )}
            </div>
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
                      getColorForValue(
                        cell,
                        cellIndex,
                        rows,
                        row[0].split(": ")[0].split("#")[1]
                      ),
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
