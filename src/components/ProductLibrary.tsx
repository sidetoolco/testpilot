import React from 'react';
import { Upload } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductLibraryProps {
  products: Product[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProductLibrary({ products, onUpload }: ProductLibraryProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Product Library</h2>
        <label className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer">
          <Upload className="h-4 w-4" />
          <span>Upload Product</span>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={onUpload}
          />
        </label>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}