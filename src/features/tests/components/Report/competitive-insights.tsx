import React, { useState } from 'react';

type ComparisonData = Record<string, any[]>;

const CompetitiveInsights: React.FC<{ comparision: ComparisonData,  }> = ({ comparision, }) => {
    const [selectedVariant, setSelectedVariant] = useState('b');
    const handleVariantChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedVariant(event.target.value);
    };
    // Access the correct variant array
    const variantData: any[] = comparision[selectedVariant] || [];
    let shopper_count = variantData.length;
    // Agrupar por competitor_id y calcular promedios
    const groupedComparison = variantData.reduce((acc: any, item: any) => {
        const key = item.competitor_id;
        if (!acc[key]) {
            acc[key] = { ...item, count: 1 };
        } else {
            acc[key].value += item.value;
            acc[key].appearence += item.appearence;
            acc[key].convenience += item.convenience;
            acc[key].brand += item.brand;
            acc[key].confidence += item.confidence;
            acc[key].count += 1;
        }
        return acc;
    }, {});

    const averagedComparison = Object.values(groupedComparison).map((item: any) => ({
        ...item,
        value: item.value / item.count,
        appearence: item.appearence / item.count,
        convenience: item.convenience / item.count,
        brand: item.brand / item.count,
        confidence: item.confidence / item.count,
        share: (item.count / shopper_count) * 100,
    }));

    const getColorClass = (value: number) => {
        if (value > 3) return 'bg-green-100';
        if (value < 3) return 'bg-red-100';
        return 'bg-yellow-100';
    };

    return (
        <div className="w-full p-4">
            <h2 className="text-xl font-bold mb-4">Competitive Insights</h2>
            <div className="mb-4">
                <label htmlFor="variant-select" className="mr-2">Select Variant:</label>
                <select id="variant-select" value={selectedVariant} onChange={handleVariantChange} className="p-2 border border-gray-300">
                    <option value="a">Variant A</option>
                    <option value="b">Variant B</option>
                    <option value="c">Variant C</option>
                </select>
            </div>
            {variantData.length === 0 ? (
                <p className='text-red-500'>No data available for this variant</p>
            ) : (
                <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100 border-none">
                            <th className="p-2 border-l border-t border-gray-100"></th>
                            <th className="p-2 border-t border-gray-100"></th>
                            <th className="border border-gray-300 p-2 col-span-5" colSpan={5}>Your Item vs Competitor</th>
                        </tr>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-300 p-2">Picture</th>
                            <th className="border border-gray-300 p-2">Share of Buy</th>
                            <th className="border border-gray-300 p-2">Value</th>
                            <th className="border border-gray-300 p-2">Aesthetics</th>
                            <th className="border border-gray-300 p-2">Utility</th>
                            <th className="border border-gray-300 p-2">Trust</th>
                            <th className="border border-gray-300 p-2">Convenience</th>
                        </tr>
                    </thead>
                    <tbody>
                        {averagedComparison.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-100">
                                <td className="border border-gray-300 p-2">
                                    <a href={item.amazon_products.product_url} target="_blank" rel="noopener noreferrer">
                                        <img src={item.amazon_products.image_url} alt={item.amazon_products.title} className="w-10 h-10" />
                                    </a>
                                </td>
                                <td className={`border border-gray-300 p-2 ${getColorClass(item.share)}`}>{item.share}%</td>
                                <td className={`border border-gray-300 p-2 ${getColorClass(item.value)}`}>
                                    {item.value.toFixed(2) - 3}
                                </td>
                                <td className={`border border-gray-300 p-2 ${getColorClass(item.appearance)}`}>
                                    {item.appearance.toFixed(2) - 3}
                                </td>
                                <td className={`border border-gray-300 p-2 ${getColorClass(item.confidence)}`}>
                                    {item.confidence.toFixed(2) - 3}
                                </td>
                                <td className={`border border-gray-300 p-2 ${getColorClass(item.brand)}`}>
                                    {item.brand.toFixed(2) - 3}
                                </td>
                                <td className={`border border-gray-300 p-2 ${getColorClass(item.convenience)}`}>
                                    {item.convenience.toFixed(2) - 3}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <p className="mt-4 text-sm text-gray-600">Hovering over each picture will show item title price and reviews.</p>
        </div>
    );
};

export default CompetitiveInsights;
