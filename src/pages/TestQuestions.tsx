import React, { useState, useCallback } from 'react';
import { useSessionStore } from '../store/useSessionStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const TestDisplay: React.FC = () => {
    const { test, itemSelectedAtCheckout, shopperId } = useSessionStore((state) => state);
    const navigate = useNavigate();
    
    const [responses, setResponses] = useState({
        valueRating: '',
        designAppeal: '',
        confidence: '',
        trust: '',
        convenience: '',
        likes: '',
        improvements: '',
        valueComparison: '',
        designComparison: '',
        confidenceComparison: '',
        trustComparison: '',
        convenienceComparison: '',
        likesItemA: '',
        improvementsItemA: '',
        chooseItemB: ''
    });

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setResponses((prevResponses) => ({
            ...prevResponses,
            [name]: value
        }));
    }, []);

    const handleSubmit = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('testers_session')
                .update({ response: JSON.stringify(responses), ended_at: new Date() } as any)
                .eq('id', shopperId!);

            if (error) {
                console.error('Error updating data:', error);
                alert('Error updating responses');
            } else {
                alert('Responses updated successfully');
            }
            navigate('/thanks');
        } catch (error) {
            console.error('Unexpected error:', error);
            alert('Unexpected error occurred');
        }
    }, [responses]);

    if (!test) {
        return <div>No test data available</div>;
    }

    const isVariationSelected = test.variations?.some((variation: any) => variation.id === itemSelectedAtCheckout?.id);
    const competitorItem = test.variations?.[0].product;

    return (
        <div className="p-4 bg-gray-100 rounded shadow-md">
            <h2 className="text-xl font-bold mb-2">Test Information</h2>
            <p><strong>Search Term:</strong> {test.search_term}</p>
            {isVariationSelected ? (
                <SelectedVariation item={itemSelectedAtCheckout} handleChange={handleChange} handleSubmit={handleSubmit} />
            ) : (
                <ComparisonView competitorItem={competitorItem} itemSelected={itemSelectedAtCheckout} handleChange={handleChange} handleSubmit={handleSubmit} />
            )}
        </div>
    );
};

const SelectedVariation: React.FC<{ item: any, handleChange: any, handleSubmit: any }> = ({ item, handleChange, handleSubmit }) => (
    <div>
        <div className="card bg-white p-4 rounded-lg shadow-lg mb-4">
            <img className="w-full h-48 object-cover rounded-t-lg" src={item?.image_url} alt={item?.title} />
            <h3 className="text-lg font-semibold mt-2">{item?.title}</h3>
            <p className="text-gray-700">Price: {item?.price}</p>
            <p className="text-gray-700">Reviews: {item?.reviews_count}</p>
        </div>
        <div className="questions space-y-4">
            <p className="font-medium">How would you rate the value of this product? (1 = Very Poor Value, 5 = Excellent Value)</p>
            <input className="w-full p-2 border border-gray-300 rounded" type="text" name="valueRating" onChange={handleChange} />

            <p className="font-medium">How appealing do you find the design and appearance of this product? (1 = Not Appealing at All, 5 = Extremely Appealing)</p>
            <input className="w-full p-2 border border-gray-300 rounded" type="text" name="designAppeal" onChange={handleChange} />

            <p className="font-medium">How confident are you that this product will deliver its promised results? (1 = Not Confident at All, 5 = Extremely Confident)</p>
            <input className="w-full p-2 border border-gray-300 rounded" type="text" name="confidence" onChange={handleChange} />

            <p className="font-medium">How much do you trust this brand to meet your expectations? (1 = No Trust at All, 5 = Complete Trust)</p>
            <input className="w-full p-2 border border-gray-300 rounded" type="text" name="trust" onChange={handleChange} />

            <p className="font-medium">How convenient does this product seem to use? (1 = Not Convenient at All, 5 = Extremely Convenient)</p>
            <input className="w-full p-2 border border-gray-300 rounded" type="text" name="convenience" onChange={handleChange} />

            <p className="font-medium">What do you like most about this product?</p>
            <textarea className="w-full p-2 border border-gray-300 rounded" name="likes" onChange={handleChange}></textarea>

            <p className="font-medium">What would make this product even better? (open text)</p>
            <textarea className="w-full p-2 border border-gray-300 rounded" name="improvements" onChange={handleChange}></textarea>

            <button className="bg-blue-500 text-white p-2 rounded mt-4 hover:bg-blue-600" onClick={handleSubmit}>Submit</button>
        </div>
    </div>
);

const ComparisonView: React.FC<{ competitorItem: any, itemSelected: any, handleChange: any, handleSubmit: any }> = ({ competitorItem, itemSelected, handleChange, handleSubmit }) => (
    <div>
        <div className="flex space-x-4">
            <ProductCard title="Item A" item={competitorItem} />
            <ProductCard title="Item B" item={itemSelected} />
        </div>
        <div className="questions space-y-4">
            <p className="font-medium">Compared to Item B, how would you rate the value of Item A?</p>
            <select className="w-full p-2 border border-gray-300 rounded" name="valueComparison" onChange={handleChange}>
                <option>Much Worse</option>
                <option>Slightly Worse</option>
                <option>Equal</option>
                <option>Slightly Better</option>
                <option>Much Better</option>
            </select>

            <p className="font-medium">Compared to Item B, how would you rate the design and appearance of Item A?</p>
            <select className="w-full p-2 border border-gray-300 rounded" name="designComparison" onChange={handleChange}>
                <option>Much Worse</option>
                <option>Slightly Worse</option>
                <option>Equal</option>
                <option>Slightly Better</option>
                <option>Much Better</option>
            </select>

            <p className="font-medium">Compared to Item B, how would you rate your confidence that Item A will deliver promised results?</p>
            <select className="w-full p-2 border border-gray-300 rounded" name="confidenceComparison" onChange={handleChange}>
                <option>Much Worse</option>
                <option>Slightly Worse</option>
                <option>Equal</option>
                <option>Slightly Better</option>
                <option>Much Better</option>
            </select>

            <p className="font-medium">Compared to Item B, how would you rate your brand trust for Item A?</p>
            <select className="w-full p-2 border border-gray-300 rounded" name="trustComparison" onChange={handleChange}>
                <option>Much Worse</option>
                <option>Slightly Worse</option>
                <option>Equal</option>
                <option>Slightly Better</option>
                <option>Much Better</option>
            </select>

            <p className="font-medium">Compared to Item B, how would you rate the convenience of Item A?</p>
            <select className="w-full p-2 border border-gray-300 rounded" name="convenienceComparison" onChange={handleChange}>
                <option>Much Worse</option>
                <option>Slightly Worse</option>
                <option>Equal</option>
                <option>Slightly Better</option>
                <option>Much Better</option>
            </select>

            <p className="font-medium">What do you like most about Item A?</p>
            <textarea className="w-full p-2 border border-gray-300 rounded" name="likesItemA" onChange={handleChange}></textarea>

            <p className="font-medium">What would make Item A even better?</p>
            <textarea className="w-full p-2 border border-gray-300 rounded" name="improvementsItemA" onChange={handleChange}></textarea>

            <p className="font-medium">What would make you choose Item B?</p>
            <textarea className="w-full p-2 border border-gray-300 rounded" name="chooseItemB" onChange={handleChange}></textarea>

            <button className="bg-blue-500 text-white p-2 rounded mt-4 hover:bg-blue-600" onClick={handleSubmit}>Submit</button>
        </div>
    </div>
);

const ProductCard: React.FC<{ title: string, item: any }> = ({ title, item }) => (
    <div className="card bg-white p-4 rounded-lg shadow-lg mb-4 w-1/2">
        <h3 className="text-lg font-semibold mt-2">{title}</h3>
        <img className="w-full h-48 object-cover rounded-t-lg" src={item?.image_url} alt={item?.title} />
        <p className="text-gray-700">Title: {item?.title}</p>
        <p className="text-gray-700">Price: {item?.price}</p>
        <p className="text-gray-700">Reviews: {item?.reviews_count}</p>
    </div>
);

export default TestDisplay;
