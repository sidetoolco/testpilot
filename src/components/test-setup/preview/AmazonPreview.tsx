import React, { useState } from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { AmazonProduct } from '../../../features/amazon/types';
import AmazonHeader from './AmazonHeader';
import AmazonNavigation from './AmazonNavigation';
import ProductDetailModal from './ProductDetailModal';

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
      // For Amazon products, search in the database using ASIN
      const { data, error } = await supabase
        .from('amazon_products')
        .select('*')
        .eq('asin', product.asin as any)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching product details:', error);
        // If there's an error, use the product data
        setProductDetails({
          images: [product.image_url],
          feature_bullets: [],
        });
      } else if (data) {
        setProductDetails({
          images: [product.image_url],
          feature_bullets: [],
        });
      }
      setSelectedProduct(product);
    } catch (error) {
      console.error('Error fetching product details:', error);
      // In case of error, use the product data
      setProductDetails({
        images: [product.image_url],
        feature_bullets: [],
      });
      setSelectedProduct(product);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(product => (
                <div
                  key={product.id || product.asin}
                  className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer flex flex-col"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="flex flex-col flex-grow">
                    <div className="relative">
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-48 object-contain mb-4"
                      />
                    </div>
                    <h3 className="text-sm font-medium text-[#0F1111] mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => {
                          const fullStars = Math.round(product.rating || 5);
                          const isFullStar = i < fullStars;
                          return (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                isFullStar
                                  ? 'text-[#dd8433] fill-[#dd8433]'
                                  : 'text-gray-200 fill-gray-200'
                              }`}
                            />
                          );
                        })}
                      </div>
                      <span className="ml-1 text-[12px] text-[#007185] hover:text-[#C7511F] hover:underline">
                        {product.reviews_count?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-[2px] text-[#0F1111]">
                      <span className="text-xs align-top mt-[1px]">US$</span>
                      <span className="text-[21px] font-medium">{Math.floor(product.price)}</span>
                      <span className="text-[13px]">{(product.price % 1).toFixed(2).substring(1)}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      <img src="/assets/images/amazon-prime-icon.png" alt="Prime" className="h-12" />
                      <div>
                        <span className="text-[12px] text-[#007185]">FREE delivery</span>
                        <span className="text-[12px] text-[#0F1111] ml-1">Tomorrow</span>
                      </div>
                    </div>
                  </div>
                  <button className="w-full mt-auto flex items-center justify-center gap-2 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-lg py-1 text-sm">
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
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
