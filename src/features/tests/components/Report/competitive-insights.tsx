import React from 'react';

const CompetitiveInsights: React.FC = () => {
    const insights = [
        { picture: 'Picture 1', share: '35%', value: -0.3, aesthetics: +1.9, utility: +0.5, trust: +0.7, convenience: +0.3 },
        { picture: 'Picture 2', share: '22%', value: -1.1, aesthetics: +1.7, utility: +0.4, trust: +0.6, convenience: +0.2 },
        { picture: 'Picture 3', share: '8%', value: -0.9, aesthetics: +0.3, utility: +0.3, trust: +0.5, convenience: +0.1 },
        { picture: 'Picture 4', share: '5%', value: +0.1, aesthetics: +1.2, utility: +0.2, trust: +0.4, convenience: +0.1 },
        { picture: 'Picture 5', share: '4%', value: 'Equal', aesthetics: +0.1, utility: +0.1, trust: +0.3, convenience: +0.0 },
    ];

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
                    {insights.map((insight, index) => (
                        <tr key={index} className="hover:bg-gray-100">
                            <td className="border border-gray-300 p-2">{insight.picture}</td>
                            <td className="border border-gray-300 p-2">{insight.share}</td>
                            <td className={`border border-gray-300 p-2 ${insight.value < 0 ? 'bg-red-200' : 'bg-green-200'}`}>
                                {insight.value}
                            </td>
                            <td className={`border border-gray-300 p-2 ${insight.aesthetics > 0 ? 'bg-green-200' : 'bg-red-200'}`}>
                                {insight.aesthetics}
                            </td>
                            <td className={`border border-gray-300 p-2 ${insight.utility > 0 ? 'bg-green-200' : 'bg-red-200'}`}>
                                {insight.utility}
                            </td>
                            <td className={`border border-gray-300 p-2 ${insight.trust > 0 ? 'bg-green-200' : 'bg-red-200'}`}>
                                {insight.trust}
                            </td>
                            <td className={`border border-gray-300 p-2 ${insight.convenience > 0 ? 'bg-green-200' : 'bg-red-200'}`}>
                                {insight.convenience}
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
