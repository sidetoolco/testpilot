import React, { useState } from 'react';
import { X, Star, ChevronLeft, ChevronRight, Heart, Share2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onAddToCart: () => void;
}

export default function ProductDetail({ product, onClose, onAddToCart }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const navigate = useNavigate();

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 overflow-y-auto">
      <div className="min-h-screen bg-white">
        {/* TestPilot Navigation */}
        <div className="bg-[#1B1B31] text-white">
          <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onClose}
                className="flex items-center space-x-2 text-white/80 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Go back</span>
              </button>
              <h1 className="text-lg font-medium">Product Details</h1>
            </div>
          </div>
        </div>

        {/* Amazon Navigation Bar */}
        <div className="bg-[#232F3E] text-white sticky top-0 z-10">
          <div className="max-w-screen-2xl mx-auto px-4 py-2">
            <div className="flex items-center space-x-8">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
                alt="Amazon"
                className="h-8 brightness-0 invert"
              />
              <div className="text-sm font-medium">Shopping Experience Preview</div>
            </div>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Image Gallery */}
            <div className="col-span-7">
              <div className="sticky top-20">
                <div className="relative aspect-square bg-[#F8F8F8] mb-4 rounded-lg">
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                  />
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-none w-20 aspect-square border-2 rounded-lg ${
                        selectedImage === index ? 'border-[#E77600]' : 'border-gray-200'
                      } hover:border-[#E77600] transition-colors`}
                    >
                      <img 
                        src={image} 
                        alt="" 
                        className="w-full h-full object-contain p-2" 
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="col-span-5">
              <div className="mb-4">
                <h1 className="text-[24px] font-medium text-[#0F1111] mb-1 leading-tight">
                  {product.name}
                </h1>
                <a href="#" className="text-[#007185] text-[14px] hover:text-[#C7511F] hover:underline">
                  Visit the {product.brand} Store
                </a>
              </div>

              <div className="flex items-center mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-[18px] w-[18px] ${
                        i < Math.floor(product.rating)
                          ? 'text-[#F8991D] fill-[#F8991D]'
                          : 'text-[#DDD] fill-[#DDD]'
                      }`}
                    />
                  ))}
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
                  <img 
                    src="https://m.media-amazon.com/images/G/01/prime/marketing/slashPrime/amazon-prime-delivery-lock._CB485968312_.png"
                    alt="Prime"
                    className="h-[22px] object-contain"
                  />
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
                  onClick={onAddToCart}
                  className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[13px] text-[#0F1111] py-3 rounded-full border border-[#FCD200] font-medium flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Add to Cart</span>
                </button>

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
  );
}