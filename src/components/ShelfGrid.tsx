import React from 'react';
import { ShelfSlot } from './ShelfSlot';
import { Product, ShelfLayout } from '../types';

interface ShelfGridProps {
  layout: ShelfLayout;
  onDrop: (row: number, col: number, product: Product) => void;
}

export function ShelfGrid({ layout, onDrop }: ShelfGridProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Shelf Layout</h2>
      <div className="grid grid-cols-6 gap-4">
        {Array.from({ length: layout.rows }).map((_, row) =>
          Array.from({ length: layout.columns }).map((_, col) => (
            <ShelfSlot
              key={`${row}-${col}`}
              product={layout.products[row]?.[col] || null}
              onDrop={(product) => onDrop(row, col, product)}
            />
          ))
        )}
      </div>
    </div>
  );
}