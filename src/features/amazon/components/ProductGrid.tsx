import React from 'react';
import { AmazonProduct } from '../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: AmazonProduct[];
  selectedProducts: AmazonProduct[];
  onProductSelect: (product: AmazonProduct) => void;
}

export function ProductGrid({ products, selectedProducts, onProductSelect }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isSelected={selectedProducts.some(p => p.id === product.id)}
          onSelect={onProductSelect}
        />
      ))}
    </div>
  );
}