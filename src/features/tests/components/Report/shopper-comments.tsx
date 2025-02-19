import React from 'react';

interface Comment {
    name: string;
    ageGroup: string;
    text: string;
}

const positiveComments: Comment[] = [
    { name: 'Mary', ageGroup: '18-24', text: "Eucalyptus Glow sounds refreshing and unique—I can imagine it being clean and calming, like something I'd use for my bedding." },
    { name: 'Frank', ageGroup: '25-34', text: "I'd probably choose Eucalyptus Glow over the others because the name makes me think of a natural, fresh scent that's not too strong." },
    { name: 'Oliver', ageGroup: '55+', text: "The name Eucalyptus Glow caught my attention right away - it feels premium and soothing, like a scent I'd want for my favorite clothes." },
];

const negativeComments: Comment[] = [
    { name: 'Rose', ageGroup: '18-24', text: "Eucalyptus Glow didn't really stand out to me—it sounds too niche, and I'm not sure I'd want my laundry to smell like eucalyptus." },
    { name: 'Martin', ageGroup: '55+', text: "The name Eucalyptus Glow makes me think of a spa, not something I'd want on my clothes every day. It feels a bit too specialized for my taste." },
    { name: 'Ellen', ageGroup: '35-44', text: "Eucalyptus Glow seems interesting, but if it's more expensive than other scents, I wouldn't go for it. I don't need to pay extra for a fabric softener." },
];

const ShopperComments: React.FC = () => {
    return (
        <div>
            <h2>Shopper Comments</h2>
            <div>
                <h3>Positive Comments (87%)</h3>
                {positiveComments.map((comment, index) => (
                    <div key={index}>
                        <p>{comment.text}</p>
                        <p><strong>{comment.name}</strong>, {comment.ageGroup}</p>
                    </div>
                ))}
            </div>
            <div>
                <h3>Negative Comments (13%)</h3>
                {negativeComments.map((comment, index) => (
                    <div key={index}>
                        <p>{comment.text}</p>
                        <p><strong>{comment.name}</strong>, {comment.ageGroup}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShopperComments;
