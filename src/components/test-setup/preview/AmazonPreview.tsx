import React, { useState } from 'react';
import AmazonHeader from './AmazonHeader';
import AmazonNavigation from './AmazonNavigation';
import PreviewGrid from './PreviewGrid';
import ProductDetailModal from './ProductDetailModal';
import { AmazonProduct } from '../../../features/amazon/types';
import apiClient from '../../../lib/api';

interface ProductDetails {
  images: string[];
  feature_bullets: string[];
}

interface AmazonPreviewProps {
  searchTerm: string;
  products: AmazonProduct[];
}

export default function AmazonPreview({ searchTerm, products }: AmazonPreviewProps) {
  const [selectedProduct, setSelectedProduct] = useState<AmazonProduct | null>(null);
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleProductClick = async (product: AmazonProduct) => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/amazon/products/${product.asin}`);
      setProductDetails(response.data);
      setSelectedProduct(product);
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setProductDetails(null);
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

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFA41C]"></div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && productDetails && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={handleCloseModal} 
          productDetails={productDetails}
        />
      )}
    </div>
  );
}
