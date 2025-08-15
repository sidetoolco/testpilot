import React from 'react';
import { X, Check } from 'lucide-react';
import { AmazonProduct } from '../../../features/amazon/types';
import { ProductCard } from './ProductCard';

interface SelectedProductsDisplayProps {
  selectedCompetitors: AmazonProduct[];
  maxCompetitors: number;
  onRemoveCompetitor: (asin: string) => void;
  isPopping: boolean;
  isAllSelected: boolean;
}

export function SelectedProductsDisplay({
  selectedCompetitors,
  maxCompetitors,
  onRemoveCompetitor,
  isPopping,
  isAllSelected,
}: SelectedProductsDisplayProps) {
  if (selectedCompetitors.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Selected Competitors ({selectedCompetitors.length}/{maxCompetitors})
        </h3>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-2 pt-2">
        {selectedCompetitors.map((product, index) => (
          <div
            key={`${product.asin}-${product.id || index}`}
            className={`flex-shrink-0 relative group ${
              isPopping && index === selectedCompetitors.length - 1
                ? 'animate-bounce'
                : ''
            }`}
          >
            <ProductCard
              product={product}
              isSelected={false}
              canSelect={false}
              onSelect={() => {}} // No-op for selected products
              variant="horizontal"
            />
            <button
              onClick={() => onRemoveCompetitor(product.asin)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      
      {/* Selection status message */}
      <div className="mt-4 text-center">
        {isAllSelected ? (
          <div className="flex items-center justify-center text-green-600">
            <Check className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">
              Perfect! You have selected exactly {maxCompetitors} competitors. You can now continue to the next step.
            </span>
          </div>
        ) : (
          <div className="text-gray-500 text-sm">
            {selectedCompetitors.length < maxCompetitors 
              ? `Select ${maxCompetitors - selectedCompetitors.length} more competitor${maxCompetitors - selectedCompetitors.length !== 1 ? 's' : ''} to continue`
              : `You have selected ${selectedCompetitors.length} competitors. Please select exactly ${maxCompetitors} to continue.`
            }
          </div>
        )}
      </div>
    </div>
  );
}
