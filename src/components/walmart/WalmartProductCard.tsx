import React from 'react';
import {  Star } from 'lucide-react';
import { trackEvent } from '../../lib/events';

interface WalmartProductCardProps {
  product: any;
  onAddToCart: (product: any) => void;
  onProductClick: (product: any) => void;
  variantType: string;
  testId: string;
}

export default function WalmartProductCard({
  product,
  onAddToCart: handleAddToCart,
  onProductClick,
  variantType,
  testId,
}: WalmartProductCardProps) {
  const { id, image_url, image, title, name, rating, reviews_count, price, images } = product;

  const handleProductClick = () => {
    trackEvent(
      'click',
      {
        test_id: testId,
        variation_type: variantType,
        product_id: id,
      },
      window.location.pathname
    );
    onProductClick(product);
  };

  return (
    <div 
      className="h-full flex cursor-pointer"
      onClick={handleProductClick}
    >
      <div className="relative flex flex-col w-full p-4 hover:outline hover:outline-[#0071dc] hover:outline-[1px] rounded">
        {/* Product Image with Add Button Overlay */}
        <div className="h-48 mb-4 flex items-center justify-center relative">
          <img
            src={image_url || image}
            alt={title || name}
            className="max-h-full max-w-full object-contain"
          />
          
          {/* Add Button Overlay - Left Bottom */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart(product);
            }}
            className="absolute bottom-2 left-2 bg-[#0071dc] text-white font-bold py-2 px-3 rounded-full hover:bg-[#005cb4] transition-colors flex items-center justify-center gap-1 text-sm shadow-lg"
          >
            <span className="text-lg font-light">+</span> Add
          </button>
        </div>

        {/* Product Info */}
        <div className="flex-grow flex flex-col">
          {/* Price - At the top */}
          <div className="flex items-baseline gap-[2px] text-[#0F1111] mb-2">
            <span className="text-xs align-top mt-[1px]">US$</span>
            <span className="text-[21px] font-medium">{Math.floor(price)}</span>
            <span className="text-[13px]">{(price % 1).toFixed(2).substring(1)}</span>
          </div>

          {/* Product Name - In the middle */}
          <h3 className="text-[13px] leading-[19px] text-[#0F1111] font-medium mb-2 hover:text-[#0071dc] line-clamp-2">
            {title || name}
          </h3>

          {/* Rating and Reviews - At the bottom */}
          {rating && (
            <div className="flex items-center">
              <div className="flex">
                {[...Array(5)].map((_, i) => {
                  const fullStars = Math.round(rating || 5);
                  const isFullStar = i < fullStars;
                  const isHalfStar = !isFullStar && i < rating;
                  return (
                    <Star
                      key={`${id}-star-${i}`}
                      className={`h-4 w-4 ${
                        isFullStar
                          ? 'text-yellow-400 fill-current'
                          : isHalfStar
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-200 fill-gray-200'
                      }`}
                      style={{
                        clipPath: isHalfStar ? 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' : 'none',
                      }}
                    />
                  );
                })}
              </div>
              {reviews_count && (
                <span className="ml-1 text-[12px] text-[#0071dc] hover:text-[#005cb4] hover:underline">
                  {reviews_count.toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
