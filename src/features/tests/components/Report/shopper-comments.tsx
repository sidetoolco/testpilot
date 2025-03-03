import React from "react";

interface ShopperCommentsProps {
    comparision: { improve_suggestions?: string }[];
    surveys: { likes_most?: string }[];
}

const ShopperComments: React.FC<ShopperCommentsProps> = ({ comparision, surveys }) => {
    if (comparision.length === 0 || surveys.length === 0 || comparision) {
        return <div className="h-80 flex items-center justify-center">
            <p className="text-gray-500 text-center">
                No comments available
            </p>
        </div>;
    }

    // Extraer comentarios y filtrar valores vacíos
    const negativeComments = comparision.map((comment: any) => comment.improve_suggestions);

    const positiveComments = surveys.map((comment) => comment.likes_most)

    // Calcular porcentaje de comentarios
    const totalComments = positiveComments.length + negativeComments.length;
    const positivePercentage = totalComments ? ((positiveComments.length / totalComments) * 100).toFixed(1) : "0";
    const negativePercentage = totalComments ? ((negativeComments.length / totalComments) * 100).toFixed(1) : "0";

    return (
        <div className="p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Shopper Comments</h2>

            {/* Sección de comentarios positivos */}
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-green-600">
                    Positive Comments ({positivePercentage}%)
                </h3>
                {positiveComments.length > 0 ? (
                    <div className="space-y-4 mt-2">
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

            {/* Sección de comentarios negativos */}
            <div>
                <h3 className="text-xl font-semibold text-red-600">
                    Negative Comments ({negativePercentage}%)
                </h3>
                {negativeComments.length > 0 ? (
                    <div className="space-y-4 mt-2">
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
        </div>
    );
};

export default ShopperComments;
