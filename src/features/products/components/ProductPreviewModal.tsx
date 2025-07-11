import React from 'react';
import { X } from 'lucide-react';
import { Product } from '../../../types';
import ProductPreview from './ProductPreview';

interface ProductPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export default function ProductPreviewModal({
  isOpen,
  onClose,
  product,
}: ProductPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[95vh] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Product Preview</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            This is a preview of what the tester will see when they click on the product.
          </p>
        </div>

        <div className="flex-1 overflow-auto">
          <ProductPreview product={product} />
        </div>
      </div>
    </div>
  );
}
