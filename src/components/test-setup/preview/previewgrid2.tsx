import { Star, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PreviewGridProps {
    products: {
        products: any;
    }
}

export default function PreviewGrid2({ products }: PreviewGridProps) {

    return (
        <div className="bg-white p-4 rounded-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => {
                    const { id, image_url, image, title, name, rating, starRating, reviews_count, reviewCount, price } = product.product;

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
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-[14px] w-[14px] ${i < Math.floor(rating || starRating)
                                                ? 'text-[#F8991D] fill-[#F8991D]'
                                                : 'text-[#DDD] fill-[#DDD]'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="ml-1 text-[12px] text-[#007185] hover:text-[#C7511F] hover:underline">
                                    {(reviews_count || reviewCount)?.toLocaleString()}
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

                            <button className="mt-4 w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] py-2 rounded-full border border-[#FCD200] font-medium flex items-center justify-center space-x-2">
                                <ShoppingCart className="h-4 w-4" />
                                <span>Add to Cart</span>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}