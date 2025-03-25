import React, { useState } from "react";

interface Comment {
    likes_most?: string;
    improve_suggestions?: string;
    choose_reason?: string;
    tester_id: {
        shopper_demographic: {
            age: null | number;
            sex: null | string;
            country_residence: null | string;
        };
    };
}

interface ShopperCommentsProps {
    comparision: {
        a: Comment[];
        b: Comment[];
        c: Comment[];
    };
    surveys: {
        a: Comment[];
        b: Comment[];
        c: Comment[];
    };
}

const CommentSection: React.FC<{
    title: string;
    comments: Comment[];
    isPositive?: boolean;
}> = ({ title, comments, isPositive = true }) => (
    <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
        {comments.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
                {comments.map((comment, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg border justify-between flex flex-col ${isPositive
                            ? "bg-green-50 border-green-200"
                            : "bg-red-50 border-red-200"
                            }`}
                    >
                        <p className="text-gray-700">{comment.likes_most || comment.improve_suggestions || comment.choose_reason}</p>
                        <div className="mt-2 text-sm text-gray-500">
                            {comment.tester_id?.shopper_demographic?.age && <p>Age: {comment.tester_id.shopper_demographic.age}</p>}
                            {comment.tester_id?.shopper_demographic?.sex && <p>Sex: {comment.tester_id.shopper_demographic.sex}</p>}
                            {comment.tester_id?.shopper_demographic?.country_residence && <p>Country: {comment.tester_id.shopper_demographic.country_residence}</p>}
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-gray-500">No comments available.</p>
        )}
    </div>
);

const ShopperComments: React.FC<ShopperCommentsProps> = ({ comparision, surveys }) => {
    const [variant, setVariant] = useState<'a' | 'b' | 'c'>('a');
    const variants: ('a' | 'b' | 'c')[] = ['a', 'b', 'c'];

    const handleVariantChange = () => {
        const currentIndex = variants.indexOf(variant);
        setVariant(variants[(currentIndex + 1) % variants.length]);
    };

    const hasComparision = comparision[variant]?.length > 0;
    const hasSurveys = surveys[variant]?.length > 0;

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

    const getComments = (data: Comment[], field: keyof Comment) =>
        data.filter(comment => comment[field]).map(comment => comment);

    const currentComparision = comparision[variant];
    const currentSurveys = surveys[variant];

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

            {hasSurveys && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Our Product Comments</h2>
                    <CommentSection
                        title="What do you like most about our product?"
                        comments={getComments(currentSurveys, 'likes_most')}
                        isPositive={true}
                    />
                    <CommentSection
                        title="What would make this product even better?"
                        comments={getComments(currentSurveys, 'improve_suggestions')}
                        isPositive={false}
                    />
                </div>
            )}

            {hasComparision && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Competitor Comments</h2>
                    <CommentSection
                        title="What do you like most about the competitor?"
                        comments={getComments(currentComparision, 'likes_most')}
                        isPositive={true}
                    />
                    <CommentSection
                        title="What would make the competitor even better?"
                        comments={getComments(currentComparision, 'improve_suggestions')}
                        isPositive={false}
                    />
                    <CommentSection
                        title="What would make you choose our product?"
                        comments={getComments(currentComparision, 'choose_reason')}
                        isPositive={true}
                    />
                </div>
            )}
        </div>
    );
};

export default ShopperComments;
