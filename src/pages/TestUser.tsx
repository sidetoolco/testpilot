import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FakeAmazonGrid from '../components/testers-session/FakeAmazonGrid';
import HeaderTesterSessionLayout from '../components/testers-session/HeaderLayout';
import { useSessionStore } from '../store/useSessionStore';
import { checkAndFetchExistingSession, fetchProductAndCompetitorData } from '../features/tests/services/testersSessionService';
import { createNewSession } from '../features/tests/services/testersSessionService';
import { Lightbulb } from 'lucide-react';
import { getTracker } from '../lib/openReplay';

interface TestData {
    id: string;
    searchTerm: string;
    competitors: any[];
    variations: any[];
}

const useFetchTestData = (id: string | undefined) => {
    const [data, setData] = useState<TestData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchProductAndCompetitorData(id).then((data: any) => {
                setData(data);
                setLoading(false);
            }).catch((error: any) => {
                setError(error.message);
                setLoading(false);
            });
        }
    }, [id]);

    return { data, loading, error };
};

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    test: string;
}

const Modal = ({ isOpen, onClose, test }: ModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg text-center relative z-60 max-w-lg mx-4 md:mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-center mb-4">
                    <Lightbulb className="h-10 w-10 text-yellow-500 mb-2 md:mb-0 md:mr-2" />
                    <h2 className="text-2xl md:text-3xl font-bold">Important Instructions</h2>
                </div>
                <p className="text-gray-700 text-sm md:text-base">
                    Imagine you are shopping for
                    <strong>
                        {" "}"{test}{" "}
                    </strong>
                    . Please browse as you normally would, add your selection to cart, and then checkout.
                </p>
                <button
                    onClick={onClose}
                    className="mt-4 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] py-2 px-6 md:px-7 rounded-full border border-[#FCD200] font-medium"
                >
                    Ok
                </button>
            </div>
        </div>
    );
};

const combineVariantsAndCompetitors = (data: any) => {
    const competitorsWithVariations = [...data.competitors];
    data.variations.forEach((variation: any) => {
        competitorsWithVariations.push({
            product: { ...variation.product },
        });
    });

    return {
        ...data,
        competitors: competitorsWithVariations,
    };
};

const TestUserPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, loading, error } = useFetchTestData(id);
    const [cartItems] = useState<any[]>([]);

    const { startSession, shopperId } = useSessionStore();
    const isModalOpen = !shopperId;

    const [sessionStarted, setSessionStarted] = useState(false);

    const combinedData = data ? combineVariantsAndCompetitors(data) : null;



    const closeModal = async () => {
        try {
            const existingSession = await checkAndFetchExistingSession(id);

            if (existingSession?.ended_at) {
                navigate('/thanks');
                return;
            }
            if (existingSession && combinedData) {
                startSession(existingSession.id, combinedData.id, combinedData, new Date(existingSession.created_at), existingSession.product_id ? existingSession.product_id : existingSession.competitor_id);

                if (!shopperId) return; // No tracker until shopperId is available
                const tracker = getTracker('shopperSessionID:' + shopperId + '-' + 'testID:' + id);
                const trackSessionResumed = tracker.trackWs('SessionEvents');
                trackSessionResumed?.('Session Resumed', JSON.stringify({ sessionId: existingSession.id }), 'up');

                if (existingSession.product_id || existingSession.competitor_id) {
                    navigate(`/questions`);
                }
                return;
            }
            const sessionId = await createNewSession(id, combinedData);
            if (sessionId && combinedData) {
                startSession(sessionId, combinedData.id, combinedData, new Date());
                setSessionStarted(true); // Flag to track session start

                if (!shopperId) return; // No tracker until shopperId is available
                const tracker = getTracker('shopperSessionID:' + shopperId + '-' + 'testID:' + id);
                const trackSessionStarted = tracker.trackWs('SessionEvents');
                trackSessionStarted?.('Session Started', JSON.stringify({ sessionId }), 'up');
            }
        } catch (error) {
            console.error('Error attempting to save to the database:', error);
        }
    };

    useEffect(() => {
        if (shopperId && sessionStarted && id && !loading) {
            const tracker = getTracker('shopperSessionID:' + shopperId + '-' + 'testID:' + id);
            tracker.trackWs('PageEvents')?.('Page Loaded', JSON.stringify({ page: 'Test User Page' }), 'down');
        }
    }, [shopperId, sessionStarted, id, loading]); // Solo se invoca el tracker cuando la sesión comienza.

    const addToCart = (item: any) => {
        if (cartItems.length === 0) {
            useSessionStore.getState().selectItemAtCheckout(item);
            const tracker = getTracker('shopperSessionID:' + shopperId + '-' + 'testID:' + id);
            tracker.trackWs('CartEvents')?.('Item Added', JSON.stringify({ item }), 'up');
        }
    };

    if (error) return <p>Error: {error}</p>;

    return (
        <HeaderTesterSessionLayout>
            <div className="bg-[#EAEDED] min-h-[600px]">
                {loading ? (
                    <div className="flex justify-center items-center min-h-[600px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    combinedData ? (
                        <div key={combinedData.id}>
                            <Modal isOpen={isModalOpen} onClose={closeModal} test={combinedData.search_term} />
                            <div className="max-w-screen-2xl mx-auto px-4 py-4">
                                <div className="bg-white p-4 mb-4 rounded-sm">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-[#565959]">
                                            {combinedData.competitors.length} results for
                                        </span>
                                        <span className="text-sm font-bold text-[#0F1111]">
                                            "{combinedData.search_term}"
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <FakeAmazonGrid products={combinedData.competitors} addToCart={addToCart} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p>No data found</p>
                    )
                )}
            </div>
        </HeaderTesterSessionLayout>
    );
};

export default TestUserPage;
