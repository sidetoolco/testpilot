import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface ProductActionsProps {
  onAddToCart: () => void;
}

export default function ProductActions({ onAddToCart }: ProductActionsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1">
        <img 
          src="https://m.media-amazon.com/images/G/01/prime/marketing/slashPrime/amazon-prime-delivery-lock._CB485968312_.png"
          alt="Prime"
          className="h-[22px] object-contain"
        />
        <div>
          <div className="text-[14px] text-[#007185]">
            FREE delivery
            <span className="text-[#0F1111]"> Tomorrow</span>
          </div>
          <div className="text-[12px] text-[#007185]">
            Order within 12 hrs 34 mins
          </div>
        </div>
      </div>

      <div>
        <span className="text-[18px] text-[#007600]">In Stock</span>
      </div>

      <div className="flex items-center space-x-2 text-[#0F1111] text-[14px]">
        <span>Quantity:</span>
        <select className="border border-[#DDD] rounded-lg px-2 py-1 bg-[#F0F2F2]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>

      <button
        onClick={onAddToCart}
        className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[13px] text-[#0F1111] py-3 rounded-full border border-[#FCD200] font-medium flex items-center justify-center space-x-2"
      >
        <ShoppingCart className="h-4 w-4" />
        <span>Add to Cart</span>
      </button>
    </div>
  );
}