import { Star, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { updateSession } from '../../features/tests/services/testersSessionService';
import { useSessionStore } from '../../store/useSessionStore';

interface PreviewGridProps {
    products: any[];
    addToCart: (item: any) => void;
}

export default function FakeAmazonGrid({ products, addToCart }: PreviewGridProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<any>(null);
    const navigate = useNavigate();
    const { shopperId } = useSessionStore();


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
                                    <span className="text-xs align-top mt-[1px]">$</span>
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
                    <div className="bg-white p-4 rounded shadow-lg">
                        <h2 className="text-lg font-bold">Product Added to Cart</h2>
                        <p className="mt-2">Name: {currentProduct.title || currentProduct.name}</p>
                        <p>Price: ${currentProduct.price.toFixed(2)}</p>
                        <button
                            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
                            onClick={closeModal}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}