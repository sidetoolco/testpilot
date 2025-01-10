import React from 'react';
import { useStore } from '../store/useStore';

export default function ConsumerTest() {
  const { currentLayout } = useStore();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Consumer Testing</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-6 gap-4">
          {currentLayout.products.flat().map((product, index) => (
            product && (
              <div key={index} className="aspect-square p-2 border rounded-lg">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}