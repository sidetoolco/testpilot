import React, { useState, useCallback } from 'react';
import { useSessionStore } from '../store/useSessionStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

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
        setResponses((prevResponses) => ({
            ...prevResponses,
            [name]: value
        }));
    }, []);


    const filterEmptyResponses = (responses: Record<string, string>) => {
        return Object.fromEntries(
            Object.entries(responses).filter(([_, value]) => value !== '')
        );
    };

    // Uso de la función antes de enviar los datos
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

            // Datos a guardar
            const payload = {
                test_id: test.id,
                tester_id: shopperId,
                product_id: productId,
                ...filteredResponses,
                ...(isComparison ? { competitor_id: itemSelectedAtCheckout?.id } : {}),
            };

            const tableName = isComparison ? 'responses_comparisons' : 'responses_surveys';

            // Inserta los datos en la tabla correspondiente
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
            navigate('/thanks'); // Navega a la página de agradecimiento
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
            <h2 className="text-xl font-bold mb-2">Test Information</h2>
            <p><strong>Search Term:</strong> {test.search_term}</p>
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
    <div>
        <div className="card bg-white p-4 rounded-lg shadow-lg mb-4">
            <img className="w-full h-48 object-cover rounded-t-lg" src={item?.image_url} alt={item?.title} />
            <h3 className="text-lg font-semibold mt-2">{item?.title}</h3>
            <p className="text-gray-700">Price: {item?.price}</p>
            <p className="text-gray-700">Reviews: {item?.reviews_count}</p>
        </div>
        <div className="questions space-y-4">
            <p className="font-medium">How would you rate the value of this product? (1 = Very Poor Value, 5 = Excellent Value)</p>
            <input className="w-full p-2 border border-gray-300 rounded" type="text" name="value_rating" onChange={handleChange} />

            <p className="font-medium">How appealing do you find the design and appearance of this product? (1 = Not Appealing at All, 5 = Extremely Appealing)</p>
            <input className="w-full p-2 border border-gray-300 rounded" type="text" name="appearance_rating" onChange={handleChange} />

            <p className="font-medium">How confident are you that this product will deliver its promised results? (1 = Not Confident at All, 5 = Extremely Confident)</p>
            <input className="w-full p-2 border border-gray-300 rounded" type="text" name="confidence_rating" onChange={handleChange} />

            <p className="font-medium">How much do you trust this brand to meet your expectations? (1 = No Trust at All, 5 = Complete Trust)</p>
            <input className="w-full p-2 border border-gray-300 rounded" type="text" name="trust_rating" onChange={handleChange} />

            <p className="font-medium">How convenient does this product seem to use? (1 = Not Convenient at All, 5 = Extremely Convenient)</p>
            <input className="w-full p-2 border border-gray-300 rounded" type="text" name="convenience_rating" onChange={handleChange} />

            <p className="font-medium">What do you like most about this product?</p>
            <textarea className="w-full p-2 border border-gray-300 rounded" name="like_most" onChange={handleChange}></textarea>

            <p className="font-medium">What would make this product even better? (open text)</p>
            <textarea className="w-full p-2 border border-gray-300 rounded" name="improve_suggestions" onChange={handleChange}></textarea>

            <button className="bg-blue-500 text-white p-2 rounded mt-4 hover:bg-blue-600" onClick={handleSubmit}>Submit</button>
        </div>
    </div>
);

const ComparisonView: React.FC<{ responses: any, competitorItem: any, itemSelected: any, handleChange: (e: any) => void, handleSubmit: () => void }> = ({ responses, competitorItem, itemSelected, handleChange, handleSubmit }) => (
    <div>
        <div className="flex space-x-4">
            <ProductCard title="Item A" item={competitorItem} />
            <ProductCard title="Item B" item={itemSelected} />
        </div>
        <div className="questions space-y-4">
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
            <select className="w-full p-2 border border-gray-300 rounded" name="brand_comparison" onChange={handleChange} value={responses.brand_comparison}    >
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
