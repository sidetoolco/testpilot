import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Product } from '../../../../types';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import ProductActions from './ProductActions';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onAddToCart: () => void;
}

export default function ProductDetail({ product, onClose, onAddToCart }: ProductDetailProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 overflow-y-auto">
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <div className="bg-[#1B1B31] text-white">
          <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onClose}
                className="flex items-center space-x-2 text-white/80 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Go back</span>
              </button>
              <h1 className="text-lg font-medium">Product Details</h1>
            </div>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Image Gallery */}
            <div className="col-span-7">
              <ProductGallery images={product.images} />
            </div>

            {/* Product Info */}
            <div className="col-span-5">
              <ProductInfo product={product} />
              <ProductActions onAddToCart={onAddToCart} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}