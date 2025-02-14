import { Star, ShoppingCart, CheckCircle, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { updateSession } from '../../features/tests/services/testersSessionService';
import { useSessionStore } from '../../store/useSessionStore';
import RedirectModal from '../test-setup/RedirectQuestionModal';

interface PreviewGridProps {
    products: any[];
    addToCart: (item: any) => void;
}

export default function FakeAmazonGrid({ products, addToCart }: PreviewGridProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<any>(null);
    const navigate = useNavigate();
    const { shopperId } = useSessionStore();
    const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);


    const handleAddToCart = (product: any) => {
        addToCart(product);
        setCurrentProduct(product);
        console.log(`Product added to cart: ${product.title}`);
        updateSession(product, shopperId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentProduct(null);
        setIsRedirectModalOpen(true);
    };
    
    const handleRedirectClose = () => {
        setIsRedirectModalOpen(false);
        navigate('/questions');
    };

    return (
        <>
            <div className="bg-white p-4 rounded-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => {
                        const { id, image_url, image, title, name, rating, reviews_count, price } = product.product;

                        return (
                            <div
                                key={id}
                                className="relative flex flex-col justify-between p-4 hover:outline hover:outline-[#007185] hover:outline-[1px] rounded cursor-pointer"
                            >

                                <div key={product.id} className="relative pt-[100%] mb-3">
                                    <Link to={`/product/${id}`} state={{ product: product.product }}>
                                        <img
                                            src={image_url || image}
                                            alt={title || name}
                                            className="absolute top-0 left-0 w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                                        />
                                    </Link>
                                </div>
                                <h3 className="text-[13px] leading-[19px] text-[#0F1111] font-medium mb-1 hover:text-[#C7511F] line-clamp-2">
                                    {title || name}
                                </h3>

                                <div className="flex items-center mb-1">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => {
                                            const isFullStar = i < Math.floor(rating || 5);
                                            const isHalfStar = !isFullStar && i < rating;
                                            return (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${isFullStar
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : isHalfStar
                                                            ? 'text-yellow-400 fill-current'
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
                                        {(reviews_count)?.toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex items-baseline gap-[2px] text-[#0F1111]">
                                    <span className="text-xs align-top mt-[1px]">US$</span>
                                    <span className="text-[21px] font-medium">{Math.floor(price)}</span>
                                    <span className="text-[13px]">
                                        {(price % 1).toFixed(2).substring(1)}
                                    </span>
                                </div>

                                <div className="mt-1 flex items-center gap-1">
                                    <img
                                        src="https://i.imghippo.com/files/nez3966nmQ.png"
                                        alt="Prime"
                                        className="h-[18px]"
                                    />
                                    <div>
                                        <span className="text-[12px] text-[#007185]">FREE delivery</span>
                                        <span className="text-[12px] text-[#0F1111] ml-1">Tomorrow</span>
                                    </div>
                                </div>

                                <button
                                    className="mt-4 w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] py-2 rounded-full border border-[#FCD200] font-medium flex items-center justify-center space-x-2"
                                    onClick={() => handleAddToCart(product.product)}
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    <span>Add to Cart</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {isModalOpen && currentProduct && (

                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg max-w-lg w-full mx-4 md:mx-auto flex flex-col justify-around relative">
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                            onClick={closeModal}
                        >
                            <X className="h-6 w-6" />
                        </button>
                        <div className="flex items-center flex-row  justify-around">
                            <img
                                src={currentProduct.image_url || currentProduct.image}
                                alt={currentProduct.title || currentProduct.name}
                                className="w-[200px] h-[200px] rounded"
                            />
                            <div className="flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
                                <h2 className="text-xl font-bold">Added to Cart</h2>
                            </div>
                        </div>
                        <p className="mt-2 text-center text-gray-700">
                            You have added <strong>{currentProduct.title || currentProduct.name}</strong> to your cart.
                        </p>
                        <div className="mt-4 flex justify-around">
                            <button
                                className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-bold py-2 px-4 rounded"
                                onClick={closeModal}
                            >
                                Go to Checkout
                            </button>
                            <button
                                className="border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white font-bold py-2 px-4 rounded"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Keep Shopping
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <RedirectModal isOpen={isRedirectModalOpen} onClose={handleRedirectClose} />
        </>
    );
}