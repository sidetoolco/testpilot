import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import FakeAmazonGrid from '../components/testers-session/FakeAmazonGrid';
import HeaderTesterSessionLayout from '../components/testers-session/HeaderLayout';
import { Product } from '../types';
import { useSessionStore } from '../store/useSessionStore';
import { checkAndFetchExistingSession } from '../components/testers-session/services/testersSessionService';
import { createNewSession } from '../components/testers-session/services/testersSessionService';

interface Variation {
    product: Product;
}
interface Competitor {
    product: Product;
}
interface TestData {
    id: string;
    searchTerm: string;
    competitors: Competitor[];
    variations: Variation[];
}

const useFetchTestData = (id: string | undefined) => {
    const [data, setData] = useState<TestData[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data, error } = await supabase
                    .from('tests')
                    .select(`
                        *,
                        competitors:test_competitors(
                          product:amazon_products(*)
                        ),
                        variations:test_variations(
                          product:products(*),
                          variation_type
                        )
                    `)
                    .eq('id', id as string);

                if (error) throw error;
                setData(data);
            } catch (error) {
                setError(error as string);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
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
            <div className="bg-white p-6 rounded shadow-lg text-center z-60">
                <h2 className="text-xl font-bold mb-4">Welcome to your shopping experience</h2>
                <p>
                    Imagine you are shopping for
                    <strong>
                        {" "}"{test}"
                    </strong>
                    . Please browse as you normally would, add your selection to cart, and then checkout.
                </p>
                <button
                    onClick={onClose}
                    className="mt-4 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] py-2 px-4 rounded-full border border-[#FCD200] font-medium"
                >
                    Ok
                </button>
            </div>
        </div>
    );
};

const combineVariantsAndCompetitors = (data: TestData[]) => {
    return data.map((item) => {
        const competitorsWithVariations = [...item.competitors];

        item.variations.forEach((variation) => {
            competitorsWithVariations.push({
                product: { ...variation.product },
            });
        });

        return {
            ...item,
            competitors: competitorsWithVariations,
        };
    });
};

const TestUserPage = () => {
    const { id } = useParams();
    const { data, loading, error } = useFetchTestData(id);
    const [cartItems] = useState<any[]>([]);

    const { startSession, shopperId } = useSessionStore();
    const isModalOpen = !shopperId;

    const combinedData = data ? combineVariantsAndCompetitors(data) : null;

    const addToCart = (item: any) => {
        if (cartItems.length === 0) {
            useSessionStore.getState().selectItemAtCheckout(item); // Actualiza el estado de itemSelectedAtCheckout
        }
    };

    const closeModal = async () => {
        try {
            const existingSession = await checkAndFetchExistingSession();

            if (existingSession) {
                startSession(existingSession.id, combinedData[0].id, combinedData[0], new Date(existingSession.created_at));
                return;
            }

            const sessionId = await createNewSession(id, combinedData);
            if (sessionId && combinedData) {
                startSession(sessionId, combinedData[0].id, combinedData[0], new Date());
            }
        } catch (error) {
            console.error('Error attempting to save to the database:', error);
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
                    combinedData && combinedData[0] ? (
                        <div key={combinedData[0].id}>
                            <Modal isOpen={isModalOpen} onClose={closeModal} test={combinedData[0].search_term} />
                            <div className="max-w-screen-2xl mx-auto px-4 py-4">
                                <div className="bg-white p-4 mb-4 rounded-sm">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-[#565959]">
                                            {combinedData[0].competitors.length} results for
                                        </span>
                                        <span className="text-sm font-bold text-[#0F1111]">
                                            "{combinedData[0].search_term}"
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <FakeAmazonGrid products={combinedData[0].competitors} addToCart={addToCart} />
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