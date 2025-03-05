import React from 'react';

interface Recommendation {
    text: string;
}

const recommendations: Recommendation[] = [
    { text: "While a bit polarizing, Eucalyptus Glow is a standout with great metrics and comments overall. Well done, Amanda!" },
    { text: "Packaging looks to be well received — consider using your pack's natural calming visuals in other marketing touchpoints." },
    { text: "Continue to optimize on 'natural' eucalyptus communications and stay away from 'spa' imagery which has less favorable connotations in the category." },
];

const Recommendations: React.FC = () => {
    return (
        <div>
            <h2>Recommendations</h2>
            <ul>
                {recommendations.map((recommendation, index) => (
                    <li key={index}>{recommendation.text}</li>
                ))}
            </ul>
        </div>
    );
};

export default Recommendations;
