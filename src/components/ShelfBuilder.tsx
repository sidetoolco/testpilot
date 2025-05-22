import React, { useState } from 'react';
import { LayoutGrid, Save } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ShelfGrid } from './ShelfGrid';
import { ProductLibrary } from './ProductLibrary';

export function ShelfBuilder({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { currentLayout, updateLayout } = useStore();
  const [shelfName, setShelfName] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <LayoutGrid className="h-6 w-6 text-primary-400" />
              <h2 className="text-xl font-semibold">Create New Shelf Layout</h2>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ×
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-hidden flex flex-col">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Enter shelf name..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
              value={shelfName}
              onChange={e => setShelfName(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-hidden flex gap-6">
            <div className="w-1/4 overflow-auto">
              <ProductLibrary products={[]} onUpload={() => {}} />
            </div>
            <div className="flex-1 overflow-auto">
              <ShelfGrid
                layout={currentLayout}
                onDrop={(row, col, product) => {
                  const newLayout = {
                    ...currentLayout,
                    products: currentLayout.products.map((rowProducts, r) =>
                      rowProducts.map((p, c) => (r === row && c === col ? product : p))
                    ),
                  };
                  updateLayout(newLayout);
                }}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Save shelf layout logic here
                onClose();
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-400 text-white rounded-lg hover:bg-primary-500"
            >
              <Save className="h-5 w-5" />
              <span>Save Layout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
