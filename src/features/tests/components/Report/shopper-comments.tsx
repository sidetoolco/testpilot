import React, { useState } from "react";

interface ShopperCommentsProps {
    comparision: { a: { improve_suggestions: string }[], b: { improve_suggestions: string }[], c: { improve_suggestions: string }[] };
    surveys: { a: { likes_most: string }[], b: { likes_most: string }[], c: { likes_most: string }[] };
}

const ShopperComments: React.FC<ShopperCommentsProps> = ({ comparision, surveys }) => {
    const [variant, setVariant] = useState<'a' | 'b' | 'c'>('a');

    if (comparision[variant].length === 0 || surveys[variant].length === 0) {
        return <div className="h-80 flex items-center justify-center">
            <p className="text-gray-500 text-center">
                No comments available
            </p>
        </div>;
    }

    // Extraer comentarios y filtrar valores vacíos
    const negativeComments = comparision[variant].map((comment: { improve_suggestions?: string }) => comment.improve_suggestions);

    const positiveComments = surveys[variant].map((comment: any) => comment.likes_most)

    // Calcular porcentaje de comentarios
    const totalComments = positiveComments.length + negativeComments.length;
    const positivePercentage = totalComments ? ((positiveComments.length / totalComments) * 100).toFixed(1) : "0";
    const negativePercentage = totalComments ? ((negativeComments.length / totalComments) * 100).toFixed(1) : "0";

    return (
        <div className="p-6 bg-white rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Shopper Comments</h2>
                <button
                    onClick={() => setVariant(variant === 'a' ? 'b' : 'a')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Variant: {variant}
                </button>
            </div>

            {/* Sección de comentarios positivos */}
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-green-600">
                    Positive Comments ({positivePercentage}%)
                </h3>
                {positiveComments.length > 0 ? (
                    <div className={`grid grid-cols-2 gap-4 mt-2`}>
                        {positiveComments.map((comment, index: number) => (
                            <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-gray-700">{comment}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 mt-2">No positive comments available.</p>
                )}
            </div>

            {/* Sección de comentarios negativos */}
            <div>
                <h3 className="text-xl font-semibold text-red-600">
                    Negative Comments ({negativePercentage}%)
                </h3>
                {negativeComments.length > 0 ? (
                    <div className={`grid grid-cols-2 gap-4 mt-2`}>
                        {negativeComments.map((comment: string | undefined, index: number) => (
                            <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-gray-700">{comment}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 mt-2">No negative comments available.</p>
                )}
            </div>
        </div>
    );
};

export default ShopperComments;
