import React from 'react';
import { Star } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  price: number;
  rating: number;
  reviews_count: number;
  image_url: string;
  product_url: string;
}

interface CompetitorProductsProps {
  products: Product[];
  selectedProducts: Product[];
  onProductSelect: (product: Product) => void;
}

export default function CompetitorProducts({ products, selectedProducts, onProductSelect }: CompetitorProductsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => {
        const isSelected = selectedProducts.some(p => p.id === product.id);
        
        return (
          <div
            key={product.id}
            onClick={() => onProductSelect(product)}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              isSelected 
                ? 'border-[#00A67E] bg-[#00A67E]/5'
                : 'border-gray-200 hover:border-[#00A67E]/30'
            }`}
          >
            <div className="aspect-square mb-4 relative group">
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-contain"
              />
              {isSelected && (
                <div className="absolute inset-0 bg-[#00A67E] bg-opacity-5 flex items-center justify-center rounded-lg">
                  <div className="h-8 w-8 bg-[#00A67E] text-white rounded-full flex items-center justify-center">
                    ✓
                  </div>
                </div>
              )}
            </div>
            
            <h4 className="font-medium text-gray-900 line-clamp-2 mb-1">
              {product.title}
            </h4>
            
            <div className="flex items-center space-x-1 mb-1">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-current'
                        : 'fill-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                ({product.reviews_count.toLocaleString()})
              </span>
            </div>
            
            <div className="flex items-baseline space-x-1">
              <span className="text-sm text-gray-500">$</span>
              <span className="text-xl font-semibold">{product.price.toFixed(2)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}