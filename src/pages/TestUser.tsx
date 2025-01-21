import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AmazonHeader from '../components/test-setup/preview/AmazonHeader';
import AmazonNavigation from '../components/test-setup/preview/AmazonNavigation';
import FakeAmazonGrid from '../components/test-setup/preview/FakeAmazonGrid';
import HeaderLayout from '../components/HeaderLayout';
import { Product } from '../types';

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

// Type the Modal component props
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const Modal = ({ isOpen, onClose }: ModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg text-center z-60">
                <h2 className="text-xl font-bold mb-4">Welcome to your shopping experience</h2>
                <p>
                    Imagine you are shopping for category-term. Please browse as you normally would, add your selection to cart, and then checkout.
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
        // Copia el arreglo de competidores
        const competitorsWithVariations = [...item.competitors];

        // Agrega cada variación al arreglo de competidores
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
    const [isModalOpen, setIsModalOpen] = useState(() => {
        return !localStorage.getItem('modalClosed');
    });
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);

    const addToCart = (item: any) => {
        if (cartItems.length === 0) {
            setCartItems([item]); // Solo agrega el título
        } else {
            setIsWarningModalOpen(true); // Muestra el modal de advertencia
        }
    };

    const closeModal = async () => {
        setIsModalOpen(false);
        localStorage.setItem('modalClosed', 'true');
        try {
            const { data, error } = await supabase
                .from('testers_session')
                .insert([{ test_id: id, status: 'started' }])
                .select('id');

            if (error) {
                console.error('Error al guardar en la base de datos:', error);
            } else if (data && data.length > 0) {
                localStorage.setItem('recordId', data[0].id);
            }
        } catch (error) {
            console.error('Error al intentar guardar en la base de datos:', error);
        }
    };

    const closeWarningModal = () => {
        setIsWarningModalOpen(false);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    const combinedData = combineVariantsAndCompetitors(data);

    return (
        <HeaderLayout cartItems={cartItems} addToCart={addToCart}>
            <Modal isOpen={isModalOpen} onClose={closeModal} />
            {isWarningModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded shadow-lg text-center z-60">
                        <p>Only one product can be added to cart.</p>
                        <button
                            onClick={closeWarningModal}
                            className="mt-4 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] py-2 px-4 rounded-full border border-[#FCD200] font-medium"
                        >
                            Ok
                        </button>
                    </div>
                </div>
            )}
            <div className="mt-16">
                {combinedData && combinedData[0] ? (
                    <div key={combinedData[0].id}>
                        <div className="bg-[#EAEDED] min-h-[600px]">
                            <AmazonHeader searchTerm={combinedData[0].searchTerm} />
                            <AmazonNavigation />

                            <div className="max-w-screen-2xl mx-auto px-4 py-4">
                                <div className="bg-white p-4 mb-4 rounded-sm">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-[#565959]">
                                            {combinedData[0].competitors.length} results for
                                        </span>
                                        <span className="text-sm font-bold text-[#0F1111]">
                                            "{combinedData[0].searchTerm}"
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
                    </div>
                ) : (
                    <p>No data found</p>
                )}
            </div>
        </HeaderLayout>
    );
};

export default TestUserPage;