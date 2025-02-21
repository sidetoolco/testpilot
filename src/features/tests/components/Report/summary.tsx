import React from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

const getColorForValue = (value: string, columnIndex: number, allRows: string[][]) => {
    if (value === 'Yes') return 'bg-[#ebfff7] text-green-600';
    if (value === 'No') return 'bg-[#fff5f5] text-red-500';

    // Skip first column (Variant names)
    if (columnIndex === 0) return '';

    // Convert percentage strings to numbers
    const numValue = parseFloat(value.replace('%', ''));
    if (isNaN(numValue)) return '';

    const columnValues = allRows.map(row => parseFloat(row[columnIndex].replace('%', '')));
    const max = Math.max(...columnValues);
    const min = Math.min(...columnValues);

    if (numValue === max) return 'bg-[#ebfff7]';
    if (numValue === min) return 'bg-[#fff5f5]';
    return 'bg-[#fffbeb]';
};

const data = {
    headers: ['Variant', 'Share of Clicks', 'Share of Buy', 'Value Score', 'Win? (90% Confidence)'],
    rows: [
        ['Variant #1', '14%', '17%', '4.8', 'Yes'],
        ['Variant #2', '6%', '4%', '4.1', 'No'],
        ['Variant #3', '5%', '9%', '4.2', 'No'],
    ],
};
const Summary: React.FC = ({ variant }: any) => {
    // const variantsArray = [variant.a, variant.b, variant.c].filter(v => v !== null);

    return (
        <div className="p-3">
            <h1 className="text-2xl font-bold mb-4">Summary Results</h1>
            <div className="bg-gray-100 p-6 rounded-lg relative mb-6 ">
                <button
                    className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded-full"
                >
                    <X size={20} className="text-gray-500" />
                </button>
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                            <span className="text-2xl">💡</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-2">AI Insight</h3>
                        <p className="text-gray-700">
                            Your first variant, Eucalyptus Glow, significantly outperformed the competitive set.
                            The bold but familiar scent name stood out from more traditional competitive options.
                            At your price point, perceived value was exceptional outperforming all other items on shelf.
                            Unfortunately, the other two options underperformed.
                        </p>
                    </div>
                </div>
            </div>


            <div className="overflow-x-auto mt-6">
                <table className="w-full border-collapse bg-white shadow-sm">
                    <thead>
                        <tr>
                            {data.headers.map((header, index) => (
                                <th key={index} className="p-4 text-left text-gray-600 font-medium border border-gray-200">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border border-gray-100">
                                {row.map((cell, cellIndex) => (
                                    <td
                                        key={cellIndex}
                                        className={clsx(
                                            "p-4 border border-gray-100",
                                            getColorForValue(cell, cellIndex, data.rows)
                                        )}
                                    >
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div >
    );
};

export default Summary;
