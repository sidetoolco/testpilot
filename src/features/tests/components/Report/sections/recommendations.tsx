import React from 'react';
import { useInsightStore } from '../../../hooks/useIaInsight';
import ReactMarkdown from 'react-markdown';


const Recommendations: React.FC = () => {
    const { insight, loading } = useInsightStore();
    return (
        <div>
            <h2>Recommendations</h2>
            {insight && !loading && <ReactMarkdown>{insight.recommendations}</ReactMarkdown>}
        </div>
    );
};

export default Recommendations;
