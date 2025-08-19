import React from 'react';
import { Heart, Star, ShoppingCart } from 'lucide-react';

interface WalmartProductCardProps {
  product: any;
  onAddToCart: (item: any) => void;
  variantType: string;
  testId: string;
}

export default function WalmartProductCard({
  product,
  onAddToCart,
  variantType,
  testId,
}: WalmartProductCardProps) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col hover:shadow-lg transition-shadow">
      {/* Wishlist Button */}
      <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 z-10">
        <Heart size={24} />
      </button>

      {/* Product Image */}
      <div className="h-48 mb-4 flex items-center justify-center">
        <img
          src={product.image_url || product.image}
          alt={product.title || product.name}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* Product Info */}
      <div className="flex-grow flex flex-col">
        {/* Price */}
        <p className="text-lg font-bold text-gray-900 mb-2">
          ${product.price?.toFixed(2) || 'N/A'}
        </p>

        {/* Product Name */}
        <p className="text-sm text-gray-700 h-12 overflow-hidden mb-2 line-clamp-2">
          {product.title || product.name}
        </p>

        {/* Size/Weight */}
        {product.size && (
          <p className="text-xs text-gray-500 mb-2">{product.size}</p>
        )}

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={
                  i < Math.round(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">
              ({product.reviews || 0})
            </span>
          </div>
        )}

        {/* Add to Cart Button */}
        <div className="mt-auto pt-2">
          <button
            onClick={handleAddToCart}
            className="w-full bg-[#0071dc] text-white font-bold py-2 px-3 rounded-full hover:bg-[#005cb4] transition-colors flex items-center justify-center gap-1 text-sm"
          >
            <ShoppingCart size={16} />
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
