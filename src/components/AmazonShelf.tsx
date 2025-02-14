import React from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '../types';

interface AmazonShelfProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export function AmazonShelf({ products, onProductClick }: AmazonShelfProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onProductClick(product)}
        >
          <div className="aspect-square mb-4 relative group">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain"
            />
            {!product.isCompetitor && (
              <div className="absolute top-2 right-2 bg-primary-400 text-white px-2 py-1 rounded-full text-xs">
                Your Product
              </div>
            )}
          </div>
          
          <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
            {product.name}
          </h3>
          
          {product.rating && (
            <div className="flex items-center space-x-1 mb-1">
              <div className="flex text-[#dd8433]">
                {Array.from({ length: 5 }).map((_, i) => (
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
                ({product.reviews?.toLocaleString()})
              </span>
            </div>
          )}
          
          <div className="flex items-baseline space-x-1 mb-2">
            <span className="text-sm text-gray-500">US$</span>
            <span className="text-xl font-semibold">{product.price.toFixed(2)}</span>
          </div>
          
          <button className="w-full flex items-center justify-center space-x-2 bg-primary-400 text-white rounded-lg py-2 hover:bg-primary-500 transition-colors">
            <ShoppingCart className="h-4 w-4" />
            <span>Add to Cart</span>
          </button>
        </div>
      ))}
    </div>
  );
}