import React from 'react';
import { Check } from 'lucide-react';
import { AmazonProduct } from '../../../features/amazon/types';
import { WalmartProduct } from '../../../features/walmart/services/walmartService';

interface ProductCardProps {
  product: AmazonProduct | WalmartProduct;
  isSelected: boolean;
  canSelect: boolean;
  onSelect: (product: AmazonProduct | WalmartProduct) => void;
  showTooltip?: boolean;
  variant?: 'grid' | 'horizontal';
}

export const ProductCard = React.memo(function ProductCard({
  product,
  isSelected,
  canSelect,
  onSelect,
  showTooltip = false,
  variant = 'grid',
}: ProductCardProps) {
  const handleClick = () => {
    if (isSelected || canSelect) {
      onSelect(product);
    }
  };

  if (variant === 'horizontal') {
    return (
      <div className="flex-shrink-0 relative group">
        <div className="w-24 h-24 border border-gray-200 rounded-lg overflow-hidden bg-white">
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-600 font-medium">${product.price}</p>
          <p className="text-xs text-gray-500">{product.rating}★</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative group border rounded-lg p-3 transition-all cursor-pointer ${
        isSelected
          ? 'border-green-500 bg-green-50'
          : canSelect
          ? 'border-gray-200 hover:border-[#00A67E] hover:shadow-md'
          : 'border-gray-200 opacity-50'
      }`}
      onClick={handleClick}
    >
      <div className="w-full h-52 mb-3 rounded overflow-hidden bg-white">
        <img
          src={product.image_url}
          alt={product.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      
      <div className="flex flex-col h-28">
        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
          {product.title}
        </h4>
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-gray-900">
            ${product.price}
          </span>
          <span className="text-sm text-gray-500">
            {product.rating}★ ({product.reviews_count.toLocaleString()})
          </span>
        </div>

        <div className="mt-auto">
          {isSelected ? (
            <div className="flex items-center justify-center text-green-600">
              <Check className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Selected</span>
            </div>
          ) : canSelect ? (
            <div className="text-center text-[#00A67E] text-sm font-medium">
              Click to Select
            </div>
          ) : (
            <div className="text-center text-gray-400 text-sm">
              Max reached
            </div>
          )}
        </div>
      </div>

      {showTooltip && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-white p-2 rounded-lg shadow-lg">
            <span className="text-sm font-medium">
              {isSelected
                ? 'Click to deselect'
                : canSelect
                ? 'Click to select'
                : 'Maximum competitors reached'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});
