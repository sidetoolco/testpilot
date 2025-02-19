import React from 'react';

const Summary: React.FC = ({ variant }: any) => {
    const variantsArray = [variant.a, variant.b, variant.c].filter(v => v !== null);

    return (
        <div className="p-6 bg-gray-100 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Summary Results</h1>
            <div className="mb-6">
                <p className="text-lg font-semibold">
                    Congrats, Amanda! 
                </p>
                <p className="text-gray-700">
                    Your first variant, Eucalyptus Glow, significantly outperformed the competitive set.
                    The bold but familiar scent name stood out from more traditional competitive options.
                    At your price point, perceived value was exceptional outperforming all other items on shelf.
                    Unfortunately, the other two options underperformed.
                </p>
            </div>
            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr className="bg-green-500 text-white">
                        <th className="py-2 px-4 border">Variant</th>
                        <th className="py-2 px-4 border">Share of Clicks</th>
                        <th className="py-2 px-4 border">Share of Buy</th>
                        <th className="py-2 px-4 border">Value Score</th>
                        <th className="py-2 px-4 border">Win? (90% Confidence)</th>
                    </tr>
                </thead>
                <tbody>
                    {variantsArray.length > 0 ? (
                        variantsArray.map((v: any) => (
                            <tr className="text-center" key={v.id}>
                                <td className="py-2 px-4 border">{v.title}</td>
                                <td className="py-2 px-4 border">14%</td>
                                <td className="py-2 px-4 border">14%</td>
                                <td className="py-2 px-4 border">6.7</td>
                                <td className="py-2 px-4 border">No</td>
                            </tr>
                        ))
                    ) : (
                        <tr className="text-center">
                            <td colSpan={5} className="py-2 px-4 border">No variants found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Summary;
