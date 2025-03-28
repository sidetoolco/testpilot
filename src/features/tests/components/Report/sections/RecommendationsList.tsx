import React from 'react';
import { useInsightStore } from '../../../hooks/useIaInsight';
import ReactMarkdown from 'react-markdown';

const Recommendations: React.FC = () => {
    const { insight, loading } = useInsightStore();

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 my-4">
            <h2 className="text-2xl font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">
                Recommendations
            </h2>
            {insight && !loading && (
                <div className="prose prose-gray max-w-none markdown-content">
                    <ReactMarkdown>{insight.recommendations}</ReactMarkdown>
                </div>
            )}
        </div>
    );
};

export default Recommendations;
