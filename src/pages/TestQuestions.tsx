import React, { useState, useCallback } from 'react';
import { useSessionStore } from '../store/useSessionStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { getTracker } from '../lib/openReplay'; // Asegúrate de tener esta función correctamente configurada

const TestDisplay: React.FC = () => {
    const { test, itemSelectedAtCheckout, shopperId } = useSessionStore((state) => state);
    const navigate = useNavigate();

    const [responses, setResponses] = useState({
        value_rating: '',
        appearance_rating: '',
        confidence_rating: '',
        trust_rating: '',
        convenience_rating: '',
        value_comparison: "Equal",
        appearence_comparison: "Equal",
        confidence_comparison: "Equal",
        brand_comparison: "Equal",
        convenience_comparison: "Equal",
        likes_most: '',
        improve_suggestions: '',
        choose_reason: '',
    });

    const handleChange = useCallback((e: any) => {
        const { name, value } = e.target;

        // Rastrear la entrada de datos con OpenReplay
        if (shopperId && test) {
            const tracker = getTracker('shopperSessionID:' + shopperId + '-' + 'testID:' + test.id);
            // Rastrear cada vez que se cambia el valor de un input
            tracker.trackWs('InputEvents')?.('Input Changed', JSON.stringify({
                fieldName: name,
                value: value,
            }), 'up');
        }

        setResponses((prevResponses) => ({
            ...prevResponses,
            [name]: value
        }));
    }, [shopperId, test?.id]);

    const filterEmptyResponses = (responses: Record<string, string>) => {
        return Object.fromEntries(
            Object.entries(responses).filter(([_, value]) => value !== '' && value !== 'Equal')
        );
    };

    const handleSubmit = useCallback(async () => {
        try {
            const filteredResponses = filterEmptyResponses(responses);

            if (!test || !shopperId) {
                console.error('Test data or shopper ID is missing.');
                return;
            }

            const isComparison = test.variations?.length > 0 && !isVariationSelected.length;
            const productId = isComparison ? competitorItem?.id : itemSelectedAtCheckout?.id;

            if (!productId) {
                console.error('Product ID is missing.');
                return;
            }

            const payload = {
                test_id: test.id,
                tester_id: shopperId,
                product_id: productId,
                ...filteredResponses,
                ...(isComparison ? { competitor_id: itemSelectedAtCheckout?.id } : {}),
            };

            const tableName = isComparison ? 'responses_comparisons' : 'responses_surveys';

            const { data, error } = await supabase.from(tableName).insert([payload] as any);

            if (error) {
                console.error(`Error inserting data into ${tableName}:`, error);
                return;
            }

            const { error: updateError } = await supabase
                .from('testers_session')
                .update({ ended_at: new Date() } as any)
                .eq('id', shopperId);

            if (updateError) {
                console.error('Error updating testers session:', updateError);
                return;
            }

            console.log('Data saved successfully:', data);
            navigate('/thanks', { state: { testId: test.id } });
        } catch (error) {
            console.error('Unexpected error:', error);
        }
    }, [responses, test, shopperId, itemSelectedAtCheckout, navigate]);

    if (!test) {
        return <div>No test data available</div>;
    }

    const isVariationSelected = test.variations?.filter((variation: any) => variation.product.id === itemSelectedAtCheckout?.id);
    const competitorItem = test.variations?.[0].product;

    return (
        <div className="p-4 bg-gray-100 rounded shadow-md">
            <h2 className="text-3xl font-bold mb-2 text-center">Last step, quick survey!</h2>
            <p className="text-center"><strong>Search Term:</strong> {test.search_term}</p>
            {isVariationSelected.length > 0 ? (
                <SelectedVariation item={itemSelectedAtCheckout} handleChange={handleChange} handleSubmit={handleSubmit} />
            ) : (
                <ComparisonView responses={responses} competitorItem={competitorItem} itemSelected={itemSelectedAtCheckout} handleChange={handleChange} handleSubmit={handleSubmit} />
            )}
        </div>
    );
};

const OPTIONS = [
    "Much Worse",
    "Slightly Worse",
    "Equal",
    "Slightly Better",
    "Much Better"
];

const SelectedVariation: React.FC<{ item: any, handleChange: (e: any) => void, handleSubmit: () => void }> = ({ item, handleChange, handleSubmit }) => (
    <div className='flex flex-col items-center justify-center w-full p-3 md:p-6'>
        <div className="card bg-white p-3 rounded-lg shadow-lg mb-6 w-full max-w-md">
            <ProductCard title="Item A" item={item} />
        </div>
        <div className="questions space-y-6 w-full max-w-md">
            <p className="font-medium text-green-800">How would you rate the value of this product? (1 = Very Poor Value, 5 = Excellent Value)</p>
            <input className="w-full p-3 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" type="text" name="value_rating" onChange={handleChange} />

            <p className="font-medium text-green-800">How appealing do you find the design and appearance of this product? (1 = Not Appealing at All, 5 = Extremely Appealing)</p>
            <input className="w-full p-3 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" type="text" name="appearance_rating" onChange={handleChange} />

            <p className="font-medium text-green-800">How confident are you that this product will deliver its promised results? (1 = Not Confident at All, 5 = Extremely Confident)</p>
            <input className="w-full p-3 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" type="text" name="confidence_rating" onChange={handleChange} />

            <p className="font-medium text-green-800">How much do you trust this brand to meet your expectations? (1 = No Trust at All, 5 = Complete Trust)</p>
            <input className="w-full p-3 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" type="text" name="trust_rating" onChange={handleChange} />

            <p className="font-medium text-green-800">How convenient does this product seem to use? (1 = Not Convenient at All, 5 = Extremely Convenient)</p>
            <input className="w-full p-3 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" type="text" name="convenience_rating" onChange={handleChange} />

            <p className="font-medium text-green-800">What do you like most about this product?</p>
            <textarea className="w-full p-3 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" name="like_most" onChange={handleChange}></textarea>

            <p className="font-medium text-green-800">What would make this product even better? (open text)</p>
            <textarea className="w-full p-3 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500" name="improve_suggestions" onChange={handleChange}></textarea>

            <button className="bg-green-500 text-white p-3 rounded mt-6 hover:bg-green-600 transition duration-300 w-full" onClick={handleSubmit}>Submit</button>
        </div>
    </div>
);

const ComparisonView: React.FC<{ responses: any, competitorItem: any, itemSelected: any, handleChange: (e: any) => void, handleSubmit: () => void }> = ({ responses, competitorItem, itemSelected, handleChange, handleSubmit }) => (
    <div className='flex flex-col items-center justify-center w-full p-6'>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full max-w-2xl">
            <div className="card bg-white p-4 rounded-lg shadow-lg w-full md:w-1/2">
                ITEM A
                <ProductCard title="Item A" item={competitorItem} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-lg mb-4 text-center text-2xl font-bold flex items-center justify-center">
                VS
            </div>

            <div className="card bg-white p-4 rounded-lg shadow-lg mb-4 w-full md:w-1/2">
                ITEM B
                <ProductCard title="Item B" item={itemSelected} />
            </div>
        </div>
        <div className="questions space-y-4 w-full max-w-2xl mt-4">
            <p className="font-medium">Compared to Item B, how would you rate the value of Item A?</p>
            <select className="w-full p-2 border border-gray-300 rounded" name="value_comparison" onChange={handleChange} value={responses.value_comparison}>
                {OPTIONS.map(option => <option key={option}>{option}</option>)}
            </select>

            <p className="font-medium">Compared to Item B, how would you rate the design and appearance of Item A?</p>
            <select className="w-full p-2 border border-gray-300 rounded" name="appearence_comparison" onChange={handleChange} value={responses.appearence_comparison}>
                {OPTIONS.map(option => <option key={option}>{option}</option>)}
            </select>

            <p className="font-medium">Compared to Item B, how would you rate your confidence that Item A will deliver promised results?</p>
            <select className="w-full p-2 border border-gray-300 rounded" name="confidence_comparison" onChange={handleChange} value={responses.confidence_comparison}>
                {OPTIONS.map(option => <option key={option}>{option}</option>)}
            </select>

            <p className="font-medium">Compared to Item B, how would you rate your brand trust for Item A?</p>
            <select className="w-full p-2 border border-gray-300 rounded" name="brand_comparison" onChange={handleChange} value={responses.brand_comparison}>
                {OPTIONS.map(option => <option key={option}>{option}</option>)}
            </select>

            <p className="font-medium">Compared to Item B, how would you rate the convenience of Item A?</p>
            <select className="w-full p-2 border border-gray-300 rounded" name="convenience_comparison" onChange={handleChange} value={responses.convenience_comparison}>
                {OPTIONS.map(option => <option key={option}>{option}</option>)}
            </select>

            <p className="font-medium">What do you like most about Item A?</p>
            <textarea className="w-full p-2 border border-gray-300 rounded" name="likes_most" onChange={handleChange}></textarea>

            <p className="font-medium">What would make Item A even better?</p>
            <textarea className="w-full p-2 border border-gray-300 rounded" name="improve_suggestions" onChange={handleChange}></textarea>

            <p className="font-medium">What would make you choose Item B?</p>
            <textarea className="w-full p-2 border border-gray-300 rounded" name="choose_reason" onChange={handleChange}></textarea>

            <button className="bg-blue-500 text-white p-2 rounded mt-4 hover:bg-blue-600 w-full" onClick={handleSubmit}>Submit</button>
        </div>
    </div>
);

const ProductCard: React.FC<{ title: string, item: any }> = ({ title, item }) => (
    <div
        key={item.id}
        className="relative flex flex-col justify-between p-1 hover:outline hover:outline-[#007185] hover:outline-[1px] rounded cursor-pointer"
    >

        <div key={item.id} className="relative pt-[100%] mb-3">
            <img
                src={item.image_url || item.image}
                alt={title || item.name}
                className="absolute top-0 left-0 w-full h-full object-contain "
            />
        </div>
        <h3 className="text-[13px] leading-[19px] text-[#0F1111] font-medium mb-1 hover:text-[#C7511F] line-clamp-2 min-h-[38px]">
            {item.title || item.name}
        </h3>

        <div className="flex items-center mb-1">
            <div className="flex">
                {[...Array(5)].map((_, i) => {
                    const isFullStar = i < Math.floor(item.rating || 5);
                    const isHalfStar = !isFullStar && i < item.rating;
                    return (
                        <Star
                            key={i}
                            className={`h-4 w-4 ${isFullStar
                                ? 'text-[#dd8433] fill-[#dd8433]'
                                : isHalfStar
                                    ? 'text-[#dd8433] fill-current'
                                    : 'text-gray-200 fill-gray-200'
                                }`}
                            style={{
                                clipPath: isHalfStar ? 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' : 'none'
                            }}
                        />
                    );
                })}
            </div>
            <span className="ml-1 text-[12px] text-[#007185] hover:text-[#C7511F] hover:underline">
                {(item.reviews_count)?.toLocaleString()}
            </span>
        </div>

        <div className="flex items-baseline gap-[2px] text-[#0F1111]">
            <span className="text-xs align-top mt-[1px]">US$</span>
            <span className="text-[21px] font-medium">{Math.floor(item.price)}</span>
            <span className="text-[13px]">
                {(item.price % 1).toFixed(2).substring(1)}
            </span>
        </div>

    </div>
);

export default TestDisplay;
