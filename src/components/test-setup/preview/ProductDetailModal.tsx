import React, { useState } from 'react';
import { AmazonProduct } from '../../../features/amazon/types';
import { Star, X, Share2, Heart, ArrowLeft } from 'lucide-react';

interface ProductDetails {
  images: string[];
  feature_bullets: string[];
}

interface ProductDetailModalProps {
  product: AmazonProduct;
  onClose: () => void;
  productDetails: ProductDetails | null;
}

export default function ProductDetailModal({
  product,
  onClose,
  productDetails,
}: ProductDetailModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header with Back Button */}
        <div className="sticky top-0 bg-white border-b border-[#DDD] p-4 z-10">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 text-[#0F1111] text-[14px] hover:text-[#C7511F] transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Go Back</span>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column - Images */}
            <div className="col-span-1 md:col-span-5">
              <div className="flex gap-4">
                {/* Thumbnails */}
                <div className="hidden md:flex flex-col gap-2">
                  {productDetails?.images?.map((image: string, index: number) => (
                    <div
                      key={index}
                      className="w-16 h-16 bg-white rounded-lg cursor-pointer border border-gray-200 hover:border-[#C7511F]"
                      onClick={() => setCurrentIndex(index)}
                    >
                      <img
                        src={image}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                  ))}
                </div>

                {/* Main Image */}
                <div className="flex-1">
                  <div className="w-full aspect-square rounded-lg max-w-[450px] max-h-[450px] bg-white border border-gray-200">
                    <img
                      src={
                        currentIndex === 0
                          ? product.image_url
                          : productDetails?.images?.[currentIndex]
                      }
                      alt={`Product image ${currentIndex + 1}`}
                      className="w-full h-full object-contain p-4"
                    />
                  </div>

                  {/* Mobile Image Indicators */}
                  <div className="relative md:hidden py-2">
                    <div className="flex items-center justify-center gap-2">
                      {productDetails?.images?.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2.5 h-2.5 rounded-full ${
                            currentIndex === index ? 'bg-black' : 'bg-white border border-black'
                          }`}
                        ></div>
                      ))}
                    </div>
                    <div className="absolute top-0 right-0 flex items-center justify-end">
                      <button className="flex items-center space-x-2 text-[#0F1111] text-[14px] hover:text-[#C7511F] transition-colors duration-200">
                        <Share2 className="h-5 w-5" />
                      </button>
                      <button className="flex items-center space-x-2 text-[#0F1111] text-[14px] hover:text-[#C7511F] transition-colors duration-200">
                        <Heart className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div className="md:col-span-5">
              <div className="flex flex-col gap-4">
                <div>
                  <h1 className="text-[24px] font-medium text-[#0F1111] mb-1 leading-tight">
                    {product.title}
                  </h1>
                  <a
                    href="#"
                    className="text-[#007185] text-[14px] hover:text-[#C7511F] hover:underline transition-colors duration-200"
                  >
                    Visit the {product?.brand} Store
                  </a>
                  <div className="items-center flex pb-2">
                    <small className="text-[14px] text-[#0F1111] pr-2">{product.rating}</small>
                    <div className="flex items-center p-1">
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
                              clipPath: isHalfStar
                                ? 'polygon(0 0, 50% 0, 50% 100%, 0 100%)'
                                : 'none',
                            }}
                          />
                        );
                      })}
                    </div>
                    <a
                      href="#"
                      className="text-[#007185] text-[14px] hover:text-[#C7511F] hover:underline transition-colors duration-200 ml-2"
                    >
                      {product.reviews_count} reviews
                    </a>
                  </div>
                </div>

                <div className="border-t border-[#DDD] py-4">
                  <p className="text-[14px] text-[#0F1111] font-bold">About this product:</p>
                  <ul className="list-disc pl-5 py-2">
                    {productDetails?.feature_bullets?.map((bullet: string, index: number) => (
                      <li key={index} className="text-[14px] text-[#0F1111]">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-start justify-between border-t border-[#DDD] w-full pt-4">
                  <button className="flex items-center space-x-2 text-[#0F1111] text-[14px] hover:text-[#C7511F] transition-colors duration-200">
                    <Share2 className="h-5 w-5" />
                    <span>Share</span>
                  </button>
                  <button className="flex items-center space-x-2 text-[#0F1111] text-[14px] hover:text-[#C7511F] transition-colors duration-200">
                    <Heart className="h-5 w-5" />
                    <span>Add to List</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Price Column */}
            <div className="col-span-1 md:col-span-2">
              <div className="space-y-2 border border-[#DDD] rounded-lg p-4">
                <strong className="text-[14px] text-[#0F1111]">Buy for first time</strong>
                <div className="border-b border-[#DDD]">
                  <div className="flex items-start gap-[2px]">
                    <span className="text-[13px] text-[#0F1111] mt-1">US$</span>
                    <span className="md:text-[28px] text-[#0F1111] text-6xl">
                      {Math.floor(product.price)}
                    </span>
                    <span className="text-[13px] text-[#0F1111] mt-1">
                      {(product.price % 1).toFixed(2).substring(1)}
                    </span>
                  </div>
                </div>
                <div className="text-[14px] text-[#007185]">
                  FREE delivery
                  <span className="text-[#0F1111]"> Tomorrow</span>
                </div>
                <div className="text-[12px] text-[#007185]">Order within 12 hrs 34 mins</div>
                <span className="text-[18px] text-[#007600]">In Stock</span>

                <p className="text-[14px] text-[#0F1111]">Quantity:</p>
                <div className="flex space-x-2 text-[#0F1111] text-[14px] flex-col">
                  <select className="border border-[#DDD] rounded-lg px-2 py-1 bg-[#F0F2F2]">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[13px] text-[#0F1111] py-3 rounded-full border border-[#FCD200] font-medium flex items-center justify-center space-x-2 transition-colors duration-200"
                  aria-label="Add to Cart"
                >
                  <span>Add to Cart</span>
                </button>
                <button
                  className="w-full bg-[#ff8c04] hover:bg-[#ff8c04] text-[13px] text-[#0F1111] py-3 rounded-full border border-[#FCD200] font-medium flex items-center justify-center space-x-2 transition-colors duration-200"
                  aria-label="Buy Now"
                >
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile View */}
          <div className="block md:hidden p-2">
            <div className="items-center flex">
              <a
                href="#"
                className="text-[#007185] text-[14px] hover:text-[#C7511F] hover:underline transition-colors duration-200"
              >
                Visit the {product?.brand} Store
              </a>
              <small className="text-[14px] text-[#0F1111] px-1">{product.rating}</small>
              <div className="flex items-center p-1">
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
              <a
                href="#"
                className="text-[#007185] text-[14px] hover:text-[#C7511F] hover:underline transition-colors duration-200 ml-2"
              >
                {product.reviews_count} reviews
              </a>
            </div>
            <h1 className="text-[14px] font-medium text-[#565959] py-1 leading-tight">
              {product.title}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
