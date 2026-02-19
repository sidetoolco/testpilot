import { useState } from 'react';
import { Star, Truck, ArrowLeft } from 'lucide-react';

interface ProductDetails {
  images: string[];
  feature_bullets: string[];
}

interface TikTokShopProductDetailProps {
  product: {
    id: string;
    title: string;
    price?: number;
    rating?: number;
    reviews_count?: number;
    image_url: string;
    brand?: string;
    description?: string;
    bullet_points?: string[];
  };
  productDetails: ProductDetails | null;
  onBack: () => void;
  onAddToCart?: () => void;
}

function formatSold(count: number) {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return String(count);
}

export default function TikTokShopProductDetail({
  product,
  productDetails,
  onBack,
  onAddToCart,
}: TikTokShopProductDetailProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = productDetails?.images?.length
    ? productDetails.images
    : [product.image_url];
  const rating = typeof product.rating === 'number' && Number.isFinite(product.rating)
    ? Math.min(5, Math.max(0, product.rating))
    : 4.6;
  const reviewsCount = typeof product.reviews_count === 'number' ? product.reviews_count : 163;
  const soldCount = Math.max(reviewsCount * 5, 853);

  const starCounts = [138, 7, 7, 6, 5];
  const maxCount = Math.max(...starCounts);

  return (
    <div className="bg-white min-h-[600px]">
      <button
        type="button"
        className="flex items-center gap-2 text-sm text-gray-700 hover:text-black my-4 transition-colors"
        onClick={onBack}
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Main image + thumbnails + global reviews */}
        <div className="md:col-span-6 space-y-4">
          <div className="w-full aspect-square max-w-[500px] bg-gray-50 rounded-lg overflow-hidden">
            <img
              src={currentIndex === 0 ? product.image_url : images[currentIndex]}
              alt={product.title}
              className="w-full h-full object-contain p-4"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {images.map((img, index) => (
              <button
                key={`thumb-${index}`}
                type="button"
                className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                  currentIndex === index ? 'border-black' : 'border-gray-200'
                }`}
                onClick={() => setCurrentIndex(index)}
              >
                <img src={img} alt="" className="w-full h-full object-contain bg-white" />
              </button>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-800">
              {rating.toFixed(1)} ★ {reviewsCount} global reviews
            </p>
            <div className="mt-2 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star, i) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-8">{star} ★</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${(starCounts[i] / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8">{starCounts[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Info + variants */}
        <div className="md:col-span-6 space-y-4">
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <Truck className="h-4 w-4" />
            Free shipping
          </div>

          <h1 className="text-xl font-bold text-gray-900 leading-tight">
            {product.title}
          </h1>

          <p className="text-sm text-gray-500">
            Sold by {product.brand || 'Seller'}
          </p>

          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="font-medium">{rating.toFixed(1)} ★</span>
            <span>({reviewsCount})</span>
            <span>{formatSold(soldCount)} sold</span>
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          </div>

          {/* Description */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-800 mb-2">Description</p>
            {product.description ? (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.description}</p>
            ) : (productDetails?.feature_bullets?.length || product.bullet_points?.length) ? (
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                {(productDetails?.feature_bullets ?? product.bullet_points ?? []).map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No description available.</p>
            )}
          </div>

          {product.price != null && (
            <p className="text-lg font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </p>
          )}

          {onAddToCart && (
            <button
              type="button"
              className="w-full py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800"
              onClick={onAddToCart}
            >
              Add to cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
