import React from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '../../../../types';

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductGrid({ products, onProductClick, onAddToCart }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product) => (
        <div 
          key={product.id} 
          className="relative flex flex-col p-4 hover:outline hover:outline-[#007185] hover:outline-[1px] rounded cursor-pointer"
        >
          {product.bestSeller && (
            <div className="absolute top-2 left-2 z-10 bg-[#CC6B10] text-white text-xs px-2 py-0.5 rounded-sm font-medium">
              Best Seller
            </div>
          )}
          <div 
            className="relative pt-[100%] mb-3"
            onClick={() => onProductClick(product)}
          >
            <img
              src={product.image}
              alt={product.name}
              className="absolute top-0 left-0 w-full h-full object-contain hover:scale-105 transition-transform duration-200"
            />
          </div>
          <h3 
            className="text-[13px] leading-[19px] text-[#0F1111] font-medium mb-1 hover:text-[#C7511F] line-clamp-2 cursor-pointer"
            onClick={() => onProductClick(product)}
          >
            {product.name}
          </h3>
          <div className="flex items-center mb-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-[14px] w-[14px] ${
                    i < Math.floor(product.rating || 0)
                      ? 'text-[#F8991D] fill-[#F8991D]'
                      : 'text-[#DDD] fill-[#DDD]'
                  }`}
                />
              ))}
            </div>
            <span className="ml-1 text-[12px] text-[#007185] hover:text-[#C7511F] hover:underline">
              {product.reviews?.toLocaleString()}
            </span>
          </div>
          <div className="flex items-baseline gap-[2px] text-[#0F1111]">
            <span className="text-xs align-top mt-[1px]">$</span>
            <span className="text-[17px] font-medium">{Math.floor(product.price)}</span>
            <span className="text-[13px]">
              {(product.price % 1).toFixed(2).substring(1)}
            </span>
          </div>
          <button
            onClick={() => onAddToCart(product)}
            className="mt-4 w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] py-2 rounded-full border border-[#FCD200] font-medium flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Add to Cart</span>
          </button>
        </div>
      ))}
    </div>
  );
}