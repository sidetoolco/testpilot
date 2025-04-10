import { X } from 'lucide-react';
import { Product } from '../../../types';
import ProductForm from './ProductForm';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<Product, 'userId' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Product;
}

export default function ProductModal({ isOpen, onClose, onSubmit, initialData }: ProductModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {initialData ? 'Edit Product' : 'Add New Product'}
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