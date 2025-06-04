import React from 'react';
import { Star } from 'lucide-react';
import { AmazonProduct } from '../types';
import { formatNumber } from '../../../utils/format';

interface ProductCardProps {
  product: AmazonProduct;
  isSelected: boolean;
  onSelect: (product: AmazonProduct) => void;
  renderTooltip?: (product: AmazonProduct) => React.ReactNode;
}

export function ProductCard({ product, isSelected, onSelect, renderTooltip }: ProductCardProps) {
  return (
    <div
      className={`relative p-4 border rounded-lg cursor-pointer transition-all group ${
        isSelected ? 'border-[#00A67E] bg-[#00A67E]/5' : 'border-gray-200 hover:border-[#00A67E]/30'
      }`}
      onClick={() => onSelect(product)}
    >
      {renderTooltip && renderTooltip(product)}
      <div className="aspect-square mb-3">
        <img
          src={product.image_url}
          alt={product.title}
          className="w-full h-full object-contain"
        />
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{product.title}</h3>
      <div className="flex items-center space-x-1 mb-2">
        <div className="flex">
          {[...Array(5)].map((_, i) => {
            const isFullStar = i < Math.floor(product.rating || 0);
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
        <span className="text-xs text-gray-500">
          {formatNumber(product.reviews_count)}
        </span>
      </div>
      <div className="flex items-baseline">
        <span className="text-sm">US$</span>
        <span className="text-lg font-medium">{Math.floor(product.price)}</span>
        <span className="text-sm">{(product.price % 1).toFixed(2).substring(1)}</span>
      </div>
    </div>
  );
}
