import { useEffect, useState } from 'react';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';

const COLORS = {
  success: {
    bg: 'bg-[#ebfff7]',
    text: 'text-green-600',
  },
  error: {
    bg: 'bg-[#fff5f5]',
    text: 'text-red-500',
  },
  warning: {
    bg: 'bg-[#fffbeb]',
    text: 'text-yellow-600',
  },
} as const;

const getColorForValue = (value: string, columnIndex: number, allRows: string[][]) => {
  if (value === 'Yes') return `${COLORS.success.bg} ${COLORS.success.text}`;
  if (value === 'No') return `${COLORS.error.bg} ${COLORS.error.text}`;

  // Skip first column (Variant names)
  if (columnIndex === 0) return '';

  // Convert percentage strings to numbers
  const numValue = parseFloat(value.replace('%', ''));
  if (isNaN(numValue)) return '';

  // Only apply the new color scheme to Share of Clicks (index 1) and Share of Buy (index 2)
  if (columnIndex === 1 || columnIndex === 2) {
    if (numValue >= 8.5) return COLORS.success.bg;
    if (numValue >= 8.1) return COLORS.warning.bg;
    return COLORS.error.bg;
  }

  // For Value Score (index 3), keep the original max/min logic
  const columnValues = allRows.map(row => parseFloat(row[columnIndex].replace('%', '')));
  const max = Math.max(...columnValues);
  const min = Math.min(...columnValues);

  if (numValue === max) return COLORS.success.bg;
  if (numValue === min) return COLORS.error.bg;
  return COLORS.warning.bg;
};

const headers = ['Variant', 'Share of Clicks', 'Share of Buy', 'Value Score'];

const Summary: React.FC<{
  summaryData: any;
  insights: any;
}> = ({ summaryData, insights }) => {
  const [rows, setRows] = useState<string[][]>([]);

  useEffect(() => {
    async function loadData() {
      const { rows: summaryRows } = summaryData;

      setRows(
        summaryRows.map((row: any) => [
          row.title,
          `${parseFloat(row.shareOfClicks).toFixed(1)}%`,
          `${parseFloat(row.shareOfBuy).toFixed(1)}%`,
          (parseFloat(row.valueScore) || 0).toFixed(1),
        ])
      );
    }

    if (summaryData) {
      loadData();
    }
  }, [summaryData]);

  if (!summaryData)
    return <p className="text-center text-gray-500">Not enough variants for analysis.</p>;

  return (
    <div className="p-3">
      <h1 className="text-2xl font-bold mb-4">Summary Results</h1>
      <div className="bg-gray-100 p-6 rounded-lg relative mb-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div id="insightPanel" className="flex items-start gap-4 transition-opacity duration-300">
          <div>
            <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none">
              <ReactMarkdown>{insights.comparison_between_variants}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 bg-white rounded-xl shadow-md">
        <div className="overflow-x-auto mt-6">
          <table className="w-full border-collapse bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <thead>
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="p-4 text-left text-gray-600 font-medium border border-gray-200 bg-gray-50"
                    title={`Sort by ${header}`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row[0]}
                  className="border border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                >
                  {headers.map((header, headerIndex) => {
                    const cell = row[headerIndex];
                    return (
                      <td
                        key={`${row[0]}-${header}`}
                        className={clsx(
                          'p-4 border border-gray-100',
                          getColorForValue(cell, headerIndex, rows),
                          'transition-colors duration-200'
                        )}
                        title={`${header}: ${cell}`}
                      >
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Summary;
