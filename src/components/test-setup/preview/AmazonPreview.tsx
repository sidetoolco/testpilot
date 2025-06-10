import React, { useState } from 'react';
import AmazonHeader from './AmazonHeader';
import AmazonNavigation from './AmazonNavigation';
import PreviewGrid from './PreviewGrid';
import ProductDetailModal from './ProductDetailModal';
import { AmazonProduct } from '../../../features/amazon/types';

interface AmazonPreviewProps {
  searchTerm: string;
  products: AmazonProduct[];
}

export default function AmazonPreview({ searchTerm, products }: AmazonPreviewProps) {
  const [selectedProduct, setSelectedProduct] = useState<AmazonProduct | null>(null);

  const handleProductClick = (product: AmazonProduct) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="bg-[#EAEDED] min-h-[600px]">
      <AmazonHeader searchTerm={searchTerm} />
      <AmazonNavigation />

      <div className="max-w-screen-2xl mx-auto px-4 py-4">
        {/* Results Count */}
        <div className="bg-white p-4 mb-4 rounded-sm">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-[#565959]">{products.length} results for</span>
            <span className="text-sm font-bold text-[#0F1111]">"{searchTerm}"</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex gap-4">
          {/* Product Grid */}
          <div className="flex-1">
            <PreviewGrid products={products} onProductClick={handleProductClick} />
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={handleCloseModal} />
      )}
    </div>
  );
}
