import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, ShoppingCart, Share2, Heart } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSessionStore } from '../store/useSessionStore'; // Asegúrate de importar el hook
import HeaderTesterSessionLayout from '../components/testers-session/HeaderLayout';

export default function ProductDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;
  const addToCart = useSessionStore((state) => state.selectItemAtCheckout); // Usa el hook
  const itemSelectedAtCheckout = useSessionStore((state) => state.itemSelectedAtCheckout);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (itemSelectedAtCheckout) {
      setIsModalOpen(true);
    }
  }, [itemSelectedAtCheckout]);

  const closeModal = () => {
    setIsModalOpen(false);
    navigate('/questions');
  };

  if (!product) {
    return <div>Producto no encontrado</div>;
  }

  return (
    <HeaderTesterSessionLayout>
      <div>
        <div className="bg-black bg-opacity-75 z-50 overflow-y-auto">
          <div className="min-h-screen bg-white">
            <div className="max-w-screen-2xl mx-auto px-4 py-8">
              <button
                className="flex items-center space-x-2 text-[#0F1111] text-[14px] hover:text-[#C7511F] mb-4 mt-8"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Go Back</span>
              </button>
              <div className="grid grid-cols-12 gap-8">
                {/* Image Gallery */}
                <div className="col-span-7">
                  <div className="sticky top-20">
                    <div className="relative aspect-square bg-[#F8F8F8] mb-4 rounded-lg">
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-contain p-4"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="col-span-5">
                  <div className="mb-4">
                    <h1 className="text-[24px] font-medium text-[#0F1111] mb-1 leading-tight">
                      {product.title}
                    </h1>
                    <a href="#" className="text-[#007185] text-[14px] hover:text-[#C7511F] hover:underline">
                      Visit the {product.brand} Store
                    </a>
                  </div>

                  <div className="flex items-center mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => {
                        const isFullStar = i < Math.floor(product.rating || 5);
                        const isHalfStar = !isFullStar && i < product.rating;
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
                    <a href="#reviews" className="ml-2 text-[14px] text-[#007185] hover:text-[#C7511F] hover:underline">
                      {product.reviews?.toLocaleString()} ratings
                    </a>
                    {product.bestSeller && (
                      <span className="ml-4 bg-[#CC6B10] text-white text-[12px] px-1.5 py-0.5 rounded-sm font-medium">
                        #1 Best Seller
                      </span>
                    )}
                  </div>

                  <div className="border-b border-[#DDD] pb-4 mb-4">
                    <div className="flex items-baseline gap-[2px]">
                      <span className="text-[13px] text-[#0F1111]">$</span>
                      <span className="text-[28px] text-[#0F1111]">{Math.floor(product.price)}</span>
                      <span className="text-[22px] text-[#0F1111]">
                        {(product.price % 1).toFixed(2).substring(1)}
                      </span>
                    </div>
                    {product.loads && (
                      <div className="text-[14px] text-[#565959]">
                        ${(product.price / product.loads).toFixed(2)}/Fl Oz
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="font-bold text-[#0F1111]">About this item:</span>
                      <p className="text-[14px] text-[#0F1111] mt-1">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <div>
                        <div className="text-[14px] text-[#007185]">
                          FREE delivery
                          <span className="text-[#0F1111]"> Tomorrow</span>
                        </div>
                        <div className="text-[12px] text-[#007185]">
                          Order within 12 hrs 34 mins
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[18px] text-[#007600]">In Stock</span>
                    </div>

                    <div className="flex items-center space-x-2 text-[#0F1111] text-[14px]">
                      <span>Quantity:</span>
                      <select className="border border-[#DDD] rounded-lg px-2 py-1 bg-[#F0F2F2]">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[13px] text-[#0F1111] py-3 rounded-full border border-[#FCD200] font-medium flex items-center justify-center space-x-2"
                      aria-label="Add to Cart"
                      onClick={() => addToCart(product)} // Añade el producto al carrito
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Add to Cart</span>
                    </button>
                    <div className="flex flex-col gap-2">
                      <p className="text-[14px] text-[#0F1111] font-bold">
                        About this product
                      </p>
                      <ul className="list-disc pl-5">
                        {product.bullet_points.map((bullet: string) => (
                          <li key={bullet} className="text-[14px] text-[#0F1111]">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-[#DDD]">
                      <button className="flex items-center space-x-2 text-[#0F1111] text-[14px] hover:text-[#C7511F]">
                        <Share2 className="h-5 w-5" />
                        <span>Share</span>
                      </button>
                      <button className="flex items-center space-x-2 text-[#0F1111] text-[14px] hover:text-[#C7511F]">
                        <Heart className="h-5 w-5" />
                        <span>Add to List</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg font-bold mb-4">Product Selected</h2>
            <p>You have a product selected. Redirecting to questions...</p>
            <button
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </HeaderTesterSessionLayout>
  );
}