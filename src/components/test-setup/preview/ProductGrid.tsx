import React from 'react';
import { Star } from 'lucide-react';
import { Product } from '../../../types';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white p-4 border border-gray-200 rounded hover:shadow-lg transition-shadow"
        >
          <div className="aspect-square mb-4 relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain"
            />
            {product.bestSeller && (
              <div className="absolute top-2 left-2 bg-[#e67a00] text-white text-xs px-2 py-1 rounded">
                #1 Best Seller
              </div>
            )}
          </div>

          <h3 className="text-sm font-medium text-[#0F1111] mb-1 line-clamp-2 hover:text-[#C7511F] cursor-pointer">
            {product.name}
          </h3>

          <div className="flex items-center mb-1">
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
            <span className="ml-1 text-sm text-[#007185] hover:text-[#C7511F] hover:underline">
              {product.reviewCount?.toLocaleString()}
            </span>
          </div>

          <div className="flex items-baseline mb-2">
            <span className="text-sm">US$</span>
            <span className="text-lg font-medium">{Math.floor(product.price)}</span>
            <span className="text-sm">
              {(product.price % 1).toFixed(2).substring(1)}
            </span>
          </div>

          <div className="flex items-center text-xs text-[#007185] space-x-1">
            <img
              src="https://m.media-amazon.com/images/G/01/prime/marketing/slashPrime/amazon-prime-delivery-lock._CB485968312_.png"
              alt="Prime"
              className="h-[16px]"
            />
            <span>FREE delivery</span>
          </div>
        </div>
      ))}
    </div>
  );
}