import { Star } from 'lucide-react';

interface TikTokProduct {
  id: string;
  title: string;
  price: number;
  rating?: number;
  reviews_count?: number;
  image_url: string;
}

interface TikTokShopProductCardProps {
  product: TikTokProduct;
  showFreeShipping?: boolean;
  showFlashSale?: boolean;
  showImmediateShip?: boolean;
  originalPrice?: number;
  onProductClick?: (product: TikTokProduct) => void;
  onAddToCart?: (product: TikTokProduct) => void;
}

function formatPrice(value: number) {
  return value.toFixed(2);
}

function formatSold(count: number) {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return String(count);
}

export default function TikTokShopProductCard({
  product,
  showFreeShipping = false,
  showFlashSale = false,
  showImmediateShip = false,
  originalPrice,
  onProductClick,
  onAddToCart,
}: TikTokShopProductCardProps) {
  const rating = typeof product.rating === 'number' && Number.isFinite(product.rating)
    ? Math.min(5, Math.max(0, product.rating))
    : 4;
  const reviewsCount = typeof product.reviews_count === 'number' ? product.reviews_count : 0;
  const hasDiscount = originalPrice != null && originalPrice > product.price && originalPrice > 0;
  const discountPct = hasDiscount
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;

  const canClick = Boolean(onProductClick);

  return (
    <div className="bg-white rounded-lg flex flex-col w-full min-w-0 flex-shrink-0 overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
      <div
        className={`relative aspect-square bg-gray-50 ${canClick ? 'cursor-pointer' : 'cursor-default'}`}
        onClick={() => onProductClick?.(product)}
      >
        <img
          src={product.image_url}
          alt={product.title}
          className="w-full h-full object-contain p-1.5"
        />
        {showFreeShipping && (
          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-medium rounded">
            Free shipping
          </span>
        )}
        {showImmediateShip && (
          <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-orange-500 text-white text-[10px] font-medium rounded">
            Immediate shipping
          </span>
        )}
      </div>

      <div className="p-1.5 flex flex-col flex-1 min-h-0">
        <h3
          className={`text-xs text-gray-800 line-clamp-2 mb-0.5 ${canClick ? 'cursor-pointer hover:text-red-600' : 'cursor-default'}`}
          onClick={() => onProductClick?.(product)}
        >
          {product.title}
        </h3>

        <div className="flex items-center gap-0.5 text-[11px] text-gray-600 mb-0.5">
          <span className="font-medium">{rating.toFixed(1)}</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={`${product.id}-star-${i}`}
                className={`h-3 w-3 ${
                  i <= Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                }`}
              />
            ))}
          </div>
          <span>{formatSold(reviewsCount)} sold</span>
        </div>

        <div className="mt-auto">
          {hasDiscount && (
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-gray-400 text-[11px] line-through">
                ${formatPrice(originalPrice!)}
              </span>
              <span className="text-red-600 font-bold text-sm">${formatPrice(product.price)}</span>
              <span className="text-red-600 text-[10px] font-medium">-{discountPct}%</span>
            </div>
          )}
          {!hasDiscount && (
            <p className="text-gray-900 font-bold text-sm">${formatPrice(product.price)}</p>
          )}
          {showFlashSale && (
            <p className="text-orange-600 text-[10px] font-medium mt-0.5">Flash sale 19:44:36</p>
          )}
        </div>

        {onAddToCart && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onAddToCart(product);
            }}
            className="mt-1.5 w-full py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800"
          >
            Add to cart
          </button>
        )}
      </div>
    </div>
  );
}
