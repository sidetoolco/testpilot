import React, { useState, useCallback, useEffect } from 'react';
import { useSessionStore } from '../store/useSessionStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { getTracker } from '../lib/openReplay';
import { ComparisonView } from '../features/tests/components/TestQuestions/ComparisonView';
import { SelectedVariation } from '../features/tests/components/TestQuestions/SelectedVariation';
import { compareTwoStrings } from 'string-similarity';

const REPEATED_STRING_ERROR_MSG = "Please provide different feedback for each response.";

const TestDisplay: React.FC = () => {

    const { test, itemSelectedAtCheckout, shopperId } = useSessionStore((state) => state);
    const competitorItem = test?.variations?.[0]?.product;
    const navigate = useNavigate();

    const [responses, setResponses] = useState<{
        value: number;
        appearence: number;
        confidence: number;
        brand: number;
        convenience: number;
        likes_most: string;
        improve_suggestions: string;
        choose_reason: string;
    }>({
        value: 3,
        appearence: 3,
        confidence: 3,
        brand: 3,
        convenience: 3,
        likes_most: '',
        improve_suggestions: '',
        choose_reason: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const stringFields = ['likes_most', 'improve_suggestions', 'choose_reason'];
    const numberFields = ['value', 'appearence', 'confidence', 'brand', 'convenience'];

    const handleChange = useCallback((e: any) => {
        const { name, value } = e.target;

        if (errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
        }

        if (shopperId && test) {
            const tracker = getTracker('shopperSessionID:' + shopperId + '-' + 'testID:' + test.id);
            tracker.trackWs('InputEvents')?.('Input Changed', JSON.stringify({ fieldName: name, value: value }), 'up');
        }

        setResponses((prevResponses) => ({
            ...prevResponses,
            [name]: stringFields.includes(name) ? value : Number(value)
        }));
    }, [shopperId, test?.id, errors]);

    const validateFields = () => {
        let validationErrors: Record<string, string> = {};
        const selectedVariations = test?.variations?.filter(
            (variation: any) => variation.product.id === itemSelectedAtCheckout?.id
        ) || [];
        const isSelected = selectedVariations.length > 0;

        if (isSelected) {
            if (!responses.likes_most || responses.likes_most.trim().length <= 50) {
                validationErrors.likes_most = "You must write at least 50 characters.";
            }
            if (!responses.improve_suggestions || responses.improve_suggestions.trim().length <= 50) {
                validationErrors.improve_suggestions = "You must write at least 50 characters.";
            }
        } else {
            if (!responses.likes_most || responses.likes_most.trim().length <= 50) {
                validationErrors.likes_most = "You must write at least 50 characters.";
            }
            if (!responses.improve_suggestions || responses.improve_suggestions.trim().length <= 50) {
                validationErrors.improve_suggestions = "You must write at least 50 characters.";
            }
            if (!responses.choose_reason || responses.choose_reason.trim().length <= 50) {
                validationErrors.choose_reason = "You must write at least 50 characters.";
            }
        }

        if(responses.likes_most && responses.improve_suggestions && compareTwoStrings(responses.likes_most.trim().toLowerCase(), responses.improve_suggestions.trim().toLowerCase()) >= .8) {
            validationErrors.improve_suggestions = REPEATED_STRING_ERROR_MSG;
            validationErrors.likes_most = REPEATED_STRING_ERROR_MSG;
        }
        
        return validationErrors;
    };

    const handleSubmit = useCallback(async () => {
        try {
            const validationErrors = validateFields();
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }

            if (!test || !shopperId) {
                console.error('Test data or shopper ID is missing.');
                return;
            }

            const isComparison =
                test.variations?.length > 0 &&
                !test.variations.filter((variation: any) => variation.product.id === itemSelectedAtCheckout?.id).length;
            const productId = isComparison ? competitorItem?.id : itemSelectedAtCheckout?.id;

            if (!productId) {
                console.error('Product ID is missing.');
                return;
            }
            console.log(responses);

            const payload = {
                test_id: test.id,
                tester_id: shopperId,
                product_id: productId,
                appearance: Number(responses.appearence),
                confidence: Number(responses.confidence),
                convenience: Number(responses.convenience),
                value: Number(responses.value),
                brand: Number(responses.brand),
                likes_most: responses.likes_most,
                improve_suggestions: responses.improve_suggestions,
                ...(isComparison ? { competitor_id: itemSelectedAtCheckout?.id } : {}),
                ...(isComparison ? { choose_reason: responses.choose_reason } : {}),
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
            navigate('/thanks', { state: { testId: test.id + '-' + test.variations[0].variation_type } });
        } catch (error) {
            console.error('Unexpected error:', error);
        }
    }, [responses, test, shopperId, itemSelectedAtCheckout, navigate, competitorItem]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!test) {
        return <div>No test data available</div>;
    }

    const isVariationSelected = test.variations?.filter(
        (variation: any) => variation.product.id === itemSelectedAtCheckout?.id
    );

    return (
        <div className="p-4 bg-gray-100 rounded shadow-md">
            <h2 className="text-3xl font-bold mb-2 text-center">Last step, quick survey!</h2>
            <p className="text-center"><strong>Search Term:</strong> {test.search_term}</p>
            {isVariationSelected.length > 0 ? (
                <SelectedVariation responses={responses} item={itemSelectedAtCheckout} handleChange={handleChange} handleSubmit={handleSubmit} errors={errors} />
            ) : (
                <ComparisonView responses={responses} competitorItem={competitorItem} itemSelected={itemSelectedAtCheckout} handleChange={handleChange} handleSubmit={handleSubmit} errors={errors} />
            )}
        </div>
    );
};


export default TestDisplay;
