import React, { useEffect, useState } from 'react';
import { AmazonProduct } from '../../../features/amazon/types';
import { Star, X } from 'lucide-react';
import apiClient from '../../../lib/api';

interface ProductDetailModalProps {
  product: AmazonProduct;
  onClose: () => void;
}

interface ProductDetails {
  images: string[];
  feature_bullets: string[];
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>(product.image_url);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await apiClient.get(`/amazon/products/${product.asin}`);
        setProductDetails(response.data);
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (product.asin) {
      fetchProductDetails();
    }
  }, [product.asin]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <img
                  src={selectedImage}
                  alt={product.title}
                  className="w-full h-[400px] object-contain"
                />
              </div>

              {/* Thumbnails */}
              {productDetails?.images && productDetails.images.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {productDetails.images.slice(0, 5).map((image, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-1 cursor-pointer ${
                        selectedImage === image ? 'border-2 border-[#C7511F]' : 'border-gray-200 hover:border-[#C7511F]'
                      }`}
                      onClick={() => setSelectedImage(image)}
                    >
                      <img
                        src={image}
                        alt={`${product.title} - Image ${index + 1}`}
                        className="w-full h-20 object-contain"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Product Info */}
            <div className="space-y-6">
              {/* Title and Close Button */}
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-[#0F1111] pr-4">{product.title}</h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Price */}
              <div>
                <span className="text-sm text-[#565959]">Price: </span>
                <div className="flex items-baseline gap-[2px] text-[#0F1111]">
                  <span className="text-xs align-top mt-[1px]">US$</span>
                  <span className="text-[28px] font-medium">{Math.floor(product.price)}</span>
                  <span className="text-[13px]">{(product.price % 1).toFixed(2).substring(1)}</span>
                </div>
              </div>

              {/* Rating and Reviews */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => {
                      const fullStars = Math.round(product.rating || 5);
                      const isFullStar = i < fullStars;
                      const isHalfStar = !isFullStar && i < product.rating;
                      return (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            isFullStar
                              ? 'text-[#dd8433] fill-[#dd8433]'
                              : isHalfStar
                                ? 'text-[#dd8433] fill-current'
                                : 'text-gray-200 fill-gray-200'
                          }`}
                          style={{
                            clipPath: isHalfStar ? 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' : 'none',
                          }}
                        />
                      );
                    })}
                  </div>
                  <span className="text-[#0F1111]">{product.rating} rating</span>
                </div>
                <span className="text-[#0F1111]">
                  {product.reviews_count?.toLocaleString()} reviews
                </span>
              </div>

              {/* Delivery Info */}
              <div className="border-t border-b py-4">
                <div className="flex items-center gap-2 mb-2">
                  <img src="/assets/images/amazon-prime-icon.png" alt="Prime" className="h-8" />
                  <span className="text-[#007185] font-medium">FREE delivery</span>
                </div>
                <p className="text-sm text-[#0F1111]">
                  Get it by <span className="font-medium">Tomorrow</span>
                </p>
              </div>

              {/* About this item */}
              {productDetails?.feature_bullets && productDetails.feature_bullets.length > 0 && (
                <div className="border-t border-b py-4">
                  <h3 className="text-lg font-semibold mb-3">About this item</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {productDetails.feature_bullets.map((bullet, index) => (
                      <li key={index} className="text-sm text-[#0F1111]">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                {product.product_url && (
                  <a
                    href={product.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-[#FFA41C] hover:bg-[#FA8900] border border-[#DD8C00] rounded-lg py-2 text-sm text-white"
                  >
                    View on Amazon
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
