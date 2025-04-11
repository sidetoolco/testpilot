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
    const [sortedComments, setSortedComments] = useState<Comment[] | null>(null);

    const variants: ('a' | 'b' | 'c')[] = ['a', 'b', 'c'];

    const handleVariantChange = () => {
        const currentIndex = variants.indexOf(variant);
        setVariant(variants[(currentIndex + 1) % variants.length]);
    };

    const sortComments = (criteria: 'age' | 'sex' | 'country_residence') => {
        const currentComments = [...(comparision[variant] || []), ...(surveys[variant] || [])];
        const sorted = currentComments.sort((a, b) => {
            const aValue = a.tester_id.shopper_demographic[criteria];
            const bValue = b.tester_id.shopper_demographic[criteria];
            if (aValue === null || bValue === null) return 0;
            if (aValue < bValue) return -1;
            if (aValue > bValue) return 1;
            return 0;
        });
        setSortedComments(sorted);
    };

    const hasComparision = comparision[variant]?.length > 0;
    const hasSurveys = surveys[variant]?.length > 0;

    const currentComparision = comparision[variant];
    const currentSurveys = surveys[variant];

    const displayedComments = sortedComments || [...(currentComparision || []), ...(currentSurveys || [])];

    return (
        <div className="p-6 bg-white rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Shopper Comments</h2>
                <div className="flex items-center space-x-4">
                    <select
                        id="sortCriteria"
                        onChange={(e) => sortComments(e.target.value as 'age' | 'sex' | 'country_residence')}
                        className="block px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                    >
                        <option value="" className="text-gray-400">sort by....</option>
                        <option value="age">Age</option>
                        <option value="sex">Gender</option>
                        <option value="country_residence">Country</option>
                    </select>
                    <button
                        onClick={handleVariantChange}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Switch Variant ({variant.toUpperCase()})
                    </button>
                </div>
            </div>

            {displayedComments.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                    {displayedComments.map((comment, index) => (
                        <div
                            key={index}
                            className="p-4 rounded-lg border bg-gray-50"
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
};

export default ShopperComments;
