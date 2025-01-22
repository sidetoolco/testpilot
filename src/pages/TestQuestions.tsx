import React from 'react';
import { useSessionStore } from '../store/useSessionStore';
const TestDisplay: React.FC = () => {
    const { test } = useSessionStore((state) => state);

    if (!test) {
        return <div>No test data available</div>;
    }

    return (
        <div className="p-4 bg-gray-100 rounded shadow-md">
            <h2 className="text-xl font-bold mb-2">Test Information</h2>
            <p><strong>Search Term:</strong> {test.search_term}</p>
        </div>
    );
};

export default TestDisplay;
