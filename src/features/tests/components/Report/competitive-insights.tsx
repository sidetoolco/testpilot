import React from 'react';

const CompetitiveInsights: React.FC<{ comparision: any[], shopper_count: number, }> = ({ comparision, shopper_count }) => {
    if (!comparision.length) return <p>No data available</p>;

    // Agrupar por competitor_id y calcular promedios
    const groupedComparison = comparision.reduce((acc, item) => {
        const key = item.competitor_id;
        if (!acc[key]) {
            acc[key] = { ...item, count: 1 };
        } else {
            acc[key].value_comparison += item.value_comparison;
            acc[key].appearence_comparison += item.appearence_comparison;
            acc[key].convenience_comparison += item.convenience_comparison;
            acc[key].brand_comparison += item.brand_comparison;
            acc[key].confidence_comparison += item.confidence_comparison;
            acc[key].count += 1;
        }
        return acc;
    }, {});

    const averagedComparison = Object.values(groupedComparison).map(item => ({
        ...item,
        value_comparison: item.value_comparison / item.count,
        appearence_comparison: item.appearence_comparison / item.count,
        convenience_comparison: item.convenience_comparison / item.count,
        brand_comparison: item.brand_comparison / item.count,
        confidence_comparison: item.confidence_comparison / item.count,
        share: (item.count / shopper_count) * 100,
    }));

    const getColorClass = (value) => {
        if (value > 3) return 'bg-green-200';
        if (value < 3) return 'bg-red-200';
        return 'bg-yellow-200';
    };

    return (
        <div className="w-full p-4">
            <h2 className="text-xl font-bold mb-4">Competitive Insights</h2>
            <table className="min-w-full border-collapse border border-gray-300">
                <thead>
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
                            <td className={`border border-gray-300 p-2 ${getColorClass(item.value_comparison)}`}>
                                {item.value_comparison.toFixed(2) - 3}
                            </td>
                            <td className={`border border-gray-300 p-2 ${getColorClass(item.appearence_comparison)}`}>
                                {item.appearence_comparison.toFixed(2) - 3}
                            </td>
                            <td className={`border border-gray-300 p-2 ${getColorClass(item.confidence_comparison)}`}>
                                {item.confidence_comparison.toFixed(2) - 3}
                            </td>
                            <td className={`border border-gray-300 p-2 ${getColorClass(item.brand_comparison)}`}>
                                {item.brand_comparison.toFixed(2) - 3}
                            </td>
                            <td className={`border border-gray-300 p-2 ${getColorClass(item.convenience_comparison)}`}>
                                {item.convenience_comparison.toFixed(2) - 3}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p className="mt-4 text-sm text-gray-600">Hovering over each picture will show item title price and reviews.</p>
        </div>
    );
};

export default CompetitiveInsights;
