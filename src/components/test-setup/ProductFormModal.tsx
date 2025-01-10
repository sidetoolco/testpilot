import React from 'react';
import { X } from 'lucide-react';
import { Product } from '../../types';
import ProductForm from '../ProductForm';

interface ProductFormModalProps {
  onSubmit: (product: Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
  initialData?: Product;
}

export function ProductFormModal({ onSubmit, onClose, initialData }: ProductFormModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {initialData ? 'Edit Product' : 'Create New Product'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <ProductForm
            onSubmit={onSubmit}
            onClose={onClose}
            initialData={initialData}
          />
        </div>
      </div>
    </div>
  );
}