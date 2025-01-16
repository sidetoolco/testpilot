import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AmazonHeader from '../components/test-setup/preview/AmazonHeader';
import AmazonNavigation from '../components/test-setup/preview/AmazonNavigation';
import PreviewGrid2 from '../components/test-setup/preview/previewgrid2';

// ... existing imports ...

const useFetchTestData = (id) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                setError(error.message);
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

const Modal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg text-center z-60">
                <h2 className="text-xl font-bold mb-4">Welcome to your shopping experience</h2>
                <button
                    onClick={onClose}
                    className="mt-4 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] py-2 px-4 rounded-full border border-[#FCD200] font-medium"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

const combineVariantsAndCompetitors = (data) => {
    return data.map((item) => {
        // Copia el arreglo de competidores
        const competitorsWithVariations = [...item.competitors];

        // Agrega cada variación al arreglo de competidores
        item.variations.forEach((variation) => {
            competitorsWithVariations.push({
                product: { ...variation.product },
                variation_type: variation.variation_type,
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
    const [isModalOpen, setIsModalOpen] = useState(true);

    const closeModal = () => {
        setIsModalOpen(false);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    const combinedData = combineVariantsAndCompetitors(data);

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <Modal isOpen={isModalOpen} onClose={closeModal} />

            {combinedData && combinedData[0] ? (
                <div key={combinedData[0].id}>
                    <div className="bg-[#EAEDED] min-h-[600px]">
                        <AmazonHeader searchTerm={combinedData[0].searchTerm} />
                        <AmazonNavigation />

                        <div className="max-w-screen-2xl mx-auto px-4 py-4">
                            {/* Results Count */}
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
                                    <PreviewGrid2 products={combinedData[0].competitors} />
                                    {/* Render variations with competitors */}
                                    {combinedData[0].variations.map((variation) => (
                                        <div key={variation.product.id}>
                                            <h3>{variation.product.name}</h3>
                                            {variation.competitor && (
                                                <p>Competitor: {variation.competitor.title}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <p>No data found</p>
            )}
        </div>
    );
};

export default TestUserPage;