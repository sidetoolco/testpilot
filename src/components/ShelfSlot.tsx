import React from 'react';
import { useDrop } from 'react-dnd';
import { Product } from '../types';

interface ShelfSlotProps {
  onDrop: (product: Product) => void;
  product: Product | null;
}

export function ShelfSlot({ onDrop, product }: ShelfSlotProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'PRODUCT',
    drop: (item: Product) => onDrop(item),
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`aspect-square border-2 rounded-lg ${
        isOver ? 'border-indigo-400 bg-indigo-50' : 'border-dashed border-gray-200'
      }`}
    >
      {product && (
        <img src={product.image} alt={product.name} className="w-full h-full object-contain p-2" />
      )}
    </div>
  );
}
