import React from 'react';
import { useDrag } from 'react-dnd';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'PRODUCT',
    item: product,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`p-3 border rounded-lg shadow-sm cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <img
        src={product.image_url}
        alt={product.title}
        className="w-full h-32 object-contain mb-2 rounded"
      />
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-900">{product.title}</h3>
        <p className="text-sm text-gray-500">US${product.price.toFixed(2)}</p>
      </div>
    </div>
  );
}