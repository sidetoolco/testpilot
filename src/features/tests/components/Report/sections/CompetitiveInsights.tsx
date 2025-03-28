import React, { useState } from 'react';
import { useInsightStore } from '../../../hooks/useIaInsight';
import ReactMarkdown from 'react-markdown';

type ComparisonData = Record<string, any[]>;

const CompetitiveInsights: React.FC<{ comparision: ComparisonData, competitorProducts: any[] }> = ({ comparision, competitorProducts }) => {
    const [selectedVariant, setSelectedVariant] = useState('b');
    const { insight, loading } = useInsightStore();

    const handleVariantChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedVariant(event.target.value);
    };
    // Access the correct variant array
    const variantData: any[] = comparision[selectedVariant] || [];
    let shopper_count = variantData.length;

    // Create a map of selected products for easy lookup
    const selectedProductsMap = variantData.reduce((acc: any, item: any) => {
        const key = item.competitor_id;
        if (!acc[key]) {
            acc[key] = { ...item, count: 1 };
        } else {
            acc[key].value += item.value;
            acc[key].appearance += item.appearance;
            acc[key].convenience += item.convenience;
            acc[key].brand += item.brand;
            acc[key].confidence += item.confidence;
            acc[key].count += 1;
        }
        return acc;
    }, {});

    // Combine all competitor products with their data
    const allProducts = competitorProducts.map(product => {
        const selectedData = selectedProductsMap[product.id];
        if (selectedData) {
            return {
                ...selectedData,
                share: (selectedData.count / shopper_count) * 100,
            };
        }
        return {
            amazon_products: product,
            value: 0,
            appearance: 0,
            convenience: 0,
            brand: 0,
            confidence: 0,
            share: 0,
            count: 0
        };
    }).sort((a, b) => b.share - a.share); // Sort by share of buy in descending order

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
                <select id="variant-select" value={selectedVariant} onChange={handleVariantChange} className="p-2 border border-gray-300 rounded-lg">
                    <option value="a">Variant A</option>
                    <option value="b">Variant B</option>
                    <option value="c">Variant C</option>
                </select>
            </div>
            {variantData.length === 0 ? (
                <p className='text-red-500'>No data available for this variant</p>
            ) : (
                <table className="min-w-full border-collapse max-w-screen-md ">
                    <thead>
                        <tr className="bg-gray-100 border-none">
                            <th className="p-2 bg-[#fff8f8]"></th>
                            <th className="p-2 bg-[#fff8f8]"></th>
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
                        {allProducts.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-100">
                                <td className="border border-gray-300 p-2">
                                    <a href={item.amazon_products.product_url} target="_blank" rel="noopener noreferrer">
                                        <img src={item.amazon_products.image_url} alt={item.amazon_products.title} className="w-10 h-10" />
                                    </a>
                                </td>
                                <td className={`border border-gray-300 p-2 ${item.count > 0 ? getColorClass(item.share) : ''}`}>
                                    {item.count > 0 ? `${item.share.toFixed(2)}%` : '-'}
                                </td>
                                <td className={`border border-gray-300 p-2 ${item.count > 0 ? getColorClass(item.value) : ''}`}>
                                    {item.count > 0 ? (item.value - 3).toFixed(2) : '-'}
                                </td>
                                <td className={`border border-gray-300 p-2 ${item.count > 0 ? getColorClass(item.appearance) : ''}`}>
                                    {item.count > 0 ? (item.appearance - 3).toFixed(2) : '-'}
                                </td>
                                <td className={`border border-gray-300 p-2 ${item.count > 0 ? getColorClass(item.confidence) : ''}`}>
                                    {item.count > 0 ? (item.confidence - 3).toFixed(2) : '-'}
                                </td>
                                <td className={`border border-gray-300 p-2 ${item.count > 0 ? getColorClass(item.brand) : ''}`}>
                                    {item.count > 0 ? (item.brand - 3).toFixed(2) : '-'}
                                </td>
                                <td className={`border border-gray-300 p-2 ${item.count > 0 ? getColorClass(item.convenience) : ''}`}>
                                    {item.count > 0 ? (item.convenience - 3).toFixed(2) : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <p className="mt-4 text-sm text-gray-600">Hovering over each picture will show item title price and reviews.</p>
            {insight && !loading && <ReactMarkdown>{insight.competitive_insights}</ReactMarkdown>}
        </div>
    );
};

export default CompetitiveInsights;
