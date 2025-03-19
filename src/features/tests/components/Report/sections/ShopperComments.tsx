import React, { useState } from "react";

interface ShopperCommentsProps {
    comparision: { a: { improve_suggestions: string }[], b: { improve_suggestions: string }[], c: { improve_suggestions: string }[] };
    surveys: { a: { likes_most: string }[], b: { likes_most: string }[], c: { likes_most: string }[] };
}

const ShopperComments: React.FC<ShopperCommentsProps> = ({ comparision, surveys }) => {
    const [variant, setVariant] = useState<'a' | 'b' | 'c'>('a');
    const variants: ('a' | 'b' | 'c')[] = ['a', 'b', 'c'];
    
    const handleVariantChange = () => {
        const currentIndex = variants.indexOf(variant);
        setVariant(variants[(currentIndex + 1) % variants.length]);
    };

    const hasComparision = comparision[variant] && comparision[variant].length > 0;
    const hasSurveys = surveys[variant] && surveys[variant].length > 0;

    if (!hasComparision && !hasSurveys) {
        return (
            <div className="h-80 flex flex-col items-center justify-center bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Shopper Comments</h2>
                <button
                    onClick={handleVariantChange}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mb-4"
                >
                    Switch Variant ({variant.toUpperCase()})
                </button>
                <p className="text-gray-500 text-center">No comments available for variant {variant.toUpperCase()}</p>
            </div>
        );
    }

    // Filtrar comentarios vacíos o undefined
    const negativeComments = hasComparision ? comparision[variant].map(comment => comment.improve_suggestions).filter(Boolean) : [];
    const positiveComments = hasSurveys ? surveys[variant].map(comment => comment.likes_most).filter(Boolean) : [];
    
    const totalComments = positiveComments.length + negativeComments.length;
    const positivePercentage = totalComments ? ((positiveComments.length / totalComments) * 100).toFixed(1) : "0";
    const negativePercentage = totalComments ? ((negativeComments.length / totalComments) * 100).toFixed(1) : "0";

    return (
        <div className="p-6 bg-white rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Shopper Comments</h2>
                <button
                    onClick={handleVariantChange}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Switch Variant ({variant.toUpperCase()})
                </button>
            </div>

            {/* Positive Comments Section */}
            {hasSurveys && (
                <div className="mb-6">
                    <h3 className="text-xl font-semibold text-green-600">Positive Comments ({positivePercentage}%)</h3>
                    {positiveComments.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            {positiveComments.map((comment, index) => (
                                <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-gray-700">{comment}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 mt-2">No positive comments available.</p>
                    )}
                </div>
            )}

            {/* Negative Comments Section */}
            {hasComparision && (
                <div>
                    <h3 className="text-xl font-semibold text-red-600">Negative Comments ({negativePercentage}%)</h3>
                    {negativeComments.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            {negativeComments.map((comment, index) => (
                                <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-gray-700">{comment}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 mt-2">No negative comments available.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ShopperComments;
