import React from 'react';
import { Star } from 'lucide-react';
import { Product } from '../../../../types';

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  return (
    <div className="mb-6">
      <h1 className="text-[24px] font-medium text-[#0F1111] mb-1 leading-tight">
        {product.name}
      </h1>
      <a href="#" className="text-[#007185] text-[14px] hover:text-[#C7511F] hover:underline">
        Visit the {product.brand} Store
      </a>

      <div className="flex items-center mb-2 mt-2">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-[18px] w-[18px] ${
                i < Math.floor(product.rating || 0)
                  ? 'text-[#F8991D] fill-[#F8991D]'
                  : 'text-[#DDD] fill-[#DDD]'
              }`}
            />
          ))}
        </div>
        <a href="#reviews" className="ml-2 text-[14px] text-[#007185] hover:text-[#C7511F] hover:underline">
          {product.reviews?.toLocaleString()} ratings
        </a>
      </div>

      <div className="border-b border-[#DDD] pb-4 mb-4">
        <div className="flex items-baseline gap-[2px]">
          <span className="text-[13px] text-[#0F1111]">$</span>
          <span className="text-[28px] text-[#0F1111]">{Math.floor(product.price)}</span>
          <span className="text-[22px] text-[#0F1111]">
            {(product.price % 1).toFixed(2).substring(1)}
          </span>
        </div>
        {product.loads && (
          <div className="text-[14px] text-[#565959]">
            ${(product.price / product.loads).toFixed(2)}/Fl Oz
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <span className="font-bold text-[#0F1111]">About this item:</span>
          <p className="text-[14px] text-[#0F1111] mt-1">
            {product.description}
          </p>
        </div>
      </div>
    </div>
  );
}