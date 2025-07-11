import { useState } from 'react';
import { Star, Share2, Heart, ChevronDown } from 'lucide-react';
import { Product } from '../../../types';

const RatingStars = ({ rating }: { rating: number }) => {
  // Handle edge cases
  if (!rating || rating <= 0) {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star key={`empty-star-${i}`} className="h-4 w-4 text-gray-200 fill-gray-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => {
        const starPosition = i + 1;
        const isFullStar = starPosition <= Math.floor(rating);
        const isHalfStar = !isFullStar && starPosition <= Math.ceil(rating) && rating % 1 !== 0;

        return (
          <Star
            key={`star-${i}-${rating}`}
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
  );
};

interface ProductPreviewProps {
  product: Product;
}

export default function ProductPreview({ product }: ProductPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="max-w-screen-xl mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-[350px_1fr_260px] gap-6 md:gap-4 items-start w-full">
        {/* Left: Images (thumbnails + main image) */}
        <div className="w-full md:w-[350px] flex flex-col md:flex-row gap-2 pt-2">
          {/* Thumbnails sidebar (desktop only) */}
          <div className="hidden md:flex flex-col gap-2 w-14 pl-2 mr-2">
            {product.images.map((image: string, index: number) => (
              <div
                key={`desktop-thumbnail-${image}-${index}`}
                className={`w-12 h-12 bg-black rounded-lg mb-1 cursor-pointer border-2 ${currentIndex === index ? 'border-primary-400' : 'border-transparent'}`}
                onClick={() => setCurrentIndex(index)}
              >
                <img
                  src={image}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
          {/* Main image */}
          <div className="w-full aspect-square rounded-lg max-w-[340px] max-h-[340px] overflow-hidden flex items-center justify-center bg-white border border-gray-200">
            <img
              src={product.images[currentIndex]}
              alt={`Product image ${currentIndex + 1}`}
              className="w-full h-full object-contain"
              style={{ maxHeight: 330, maxWidth: 330 }}
            />
          </div>
          {/* Thumbnails below main image (mobile only) */}
          <div className="flex md:hidden flex-row gap-2 mt-2 justify-center">
            {product.images.map((image: string, index: number) => (
              <div
                key={`mobile-thumbnail-${image}-${index}`}
                className={`w-10 h-10 bg-black rounded-lg cursor-pointer border-2 ${currentIndex === index ? 'border-primary-400' : 'border-transparent'}`}
                onClick={() => setCurrentIndex(index)}
              >
                <img
                  src={image}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Center: Product Info */}
        <div className="flex flex-col gap-2 min-w-0 break-words">
          <h1 className="text-[24px] font-medium text-[#0F1111] mb-1 leading-tight pt-2 break-words overflow-wrap break-word">
            {product.title}
          </h1>
          <div className="flex items-center pb-2 flex-wrap gap-2">
            <small className="text-[14px] text-[#0F1111] pr-2">{product.rating}</small>
            <div className="flex items-center p-1">
              <RatingStars rating={product.rating} />
            </div>
            <ChevronDown className="h-4 w-4" />
            <a
              href="#"
              className="text-[#007185] text-[14px] hover:text-[#C7511F] hover:underline transition-colors duration-200 ml-2 break-all"
            >
              {product.reviews_count} reviews
            </a>
          </div>
          <div className="border-t border-[#DDD] py-4">
            <p className="text-[14px] text-[#0F1111] font-bold">About this product:</p>
            <ul className="list-disc pl-5 py-2">
              {product.bullet_points &&
                product.bullet_points.map((bullet: string, idx: number) => (
                  <li
                    key={`bullet-${bullet}-${idx}`}
                    className="text-[14px] text-[#0F1111] break-words overflow-wrap break-word"
                  >
                    {bullet}
                  </li>
                ))}
            </ul>
          </div>
          <div className="flex items-center gap-6 py-2">
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

        {/* Right: Buy Box */}
        <div className="space-y-2 border border-[#DDD] rounded-lg p-4 m-1 w-full max-w-[250px] bg-white">
          <strong className="text-[14px] text-[#0F1111]">Buy for first time</strong>
          <div className="border-b border-[#DDD] ">
            <div className="flex items-start gap-[2px]">
              <span className="text-[13px] text-[#0F1111] mt-1">US$</span>
              <span className="md:text-[28px] text-[#0F1111] text-4xl">
                {Math.floor(product.price)}
              </span>
              <span className="text-[13px] text-[#0F1111] mt-1">
                {(product.price % 1).toFixed(2).substring(1)}
              </span>
            </div>
            {product.loads && (
              <div className="text-[14px] text-[#565959]">
                ${(product.price / product.loads).toFixed(2)}/Fl Oz
              </div>
            )}
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
                <option key={`quantity-${num}`} value={num}>
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
            aria-label="Add to Cart"
          >
            <span>Buy Now</span>
          </button>
        </div>
      </div>

      {/* Description and Brand Table */}
      <div className="text-[14px] text-[#0F1111] space-y-4 p-4 mt-2 w-full break-words">
        <strong className="block text-lg font-semibold">Description about the product</strong>
        <p className="mb-4 pb-4 break-words overflow-wrap break-word">
          {product?.description ? product.description : 'No description available'}
        </p>

        <div className="border-t border-[#DDD] py-6">
          <h2 className="text-[20px] font-medium text-[#0F1111] mb-4">Customer reviews</h2>
          <div className="bg-[#F3F3F3] p-6 rounded-lg">
            <div className="flex items-center justify-center flex-col text-center">
              <p className="text-[#565959] text-[14px] mb-2">
                Reviews are not included in this test
              </p>
              <p className="text-[#565959] text-[12px]">
                This is a test environment where reviews are not available. In a real shopping
                experience, you would see customer reviews here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
