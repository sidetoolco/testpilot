import React from 'react';
import { Star } from 'lucide-react';
import { AmazonProduct } from '../types';
import { formatNumber } from '../../../utils/format';

interface ProductCardProps {
  product: AmazonProduct;
  isSelected: boolean;
  onSelect: (product: AmazonProduct) => void;
}

export function ProductCard({ product, isSelected, onSelect }: ProductCardProps) {
  return (
    <div
      onClick={() => onSelect(product)}
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected ? 'border-[#00A67E] bg-[#00A67E]/5' : 'border-gray-200 hover:border-[#00A67E]/30'
      }`}
    >
      <div className="aspect-square mb-4 relative group">
        <img src={product.image_url} alt={product.title} className="w-full h-full object-contain" />
        {isSelected && (
          <div className="absolute inset-0 bg-[#00A67E] bg-opacity-5 flex items-center justify-center rounded-lg">
            <div className="h-8 w-8 bg-[#00A67E] text-white rounded-full flex items-center justify-center">
              ✓
            </div>
          </div>
        )}
      </div>

      <h4 className="font-medium text-gray-900 line-clamp-2 mb-1">{product.title}</h4>

      <div className="flex items-center space-x-1 mb-1">
        <div className="flex text-[#dd8433]">
          {[...Array(5)].map((_, i) => {
            const fullStars = Math.round(product.rating || 5);
            const isFullStar = i < fullStars;
            const isHalfStar = !isFullStar && i < product.rating;
            return (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  isFullStar
                    ? 'text-[#dd8433] fill-[#dd8433]'
                    : isHalfStar
                      ? 'text-[#dd8433] fill-current'
                      : 'text-gray-200 fill-gray-200'
                }`}
                style={{
                  clipPath: isHalfStar ? 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' : 'none',
                }}
              />
            );
          })}
        </div>
        <span className="text-sm text-gray-500">({formatNumber(product.reviews_count)})</span>
      </div>

      <div className="flex items-baseline space-x-1">
        <span className="text-sm text-gray-500">US$</span>
        <span className="text-xl font-semibold">{product.price.toFixed(2)}</span>
      </div>
    </div>
  );
}
