import React from 'react';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price?: number;
}

interface ChosenProductCardProps {
  product: Product;
  isCompetitor: boolean;
  onProductClick: (product: Product) => void;
  count?: number; // Number of times this competitor was chosen
}

// Helper function to determine product styling
const getProductStyling = (isCompetitor: boolean) => {
  const baseClasses = "mb-3 p-3 bg-white rounded border-l-4 cursor-pointer hover:bg-gray-50 transition-colors";
  const borderClass = isCompetitor ? 'border-red-400' : 'border-green-500';
  const textClass = isCompetitor ? 'text-red-400' : 'text-green-600';
  
  return {
    containerClass: `${baseClasses} ${borderClass}`,
    textClass: `text-xs font-medium mt-1 ${textClass}`
  };
};

const ChosenProductCard: React.FC<ChosenProductCardProps> = ({ 
  product, 
  isCompetitor, 
  onProductClick,
}) => {
  const styling = getProductStyling(isCompetitor);
  
  return (
    <div 
      className={styling.containerClass}
      onClick={() => onProductClick(product)}
    >
      <div className="flex items-center space-x-3">
        {product.image_url && (
          <img 
            src={product.image_url} 
            alt={product.title}
            className="w-12 h-12 object-cover rounded"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {product.title}
          </p>
          <p className="text-sm text-gray-600">
            ${product.price?.toFixed(2) || 'N/A'}
          </p>
        </div>
      </div>
      <p className={styling.textClass}>
        ✓ Chosen Product
      </p>
    </div>
  );
};

export default ChosenProductCard;
export type { Product, ChosenProductCardProps }; 