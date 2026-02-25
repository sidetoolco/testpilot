import { Star } from 'lucide-react';
import { useEffect } from 'react';
import { useSessionStore } from '../../store/useSessionStore';
import { recordTimeSpent } from '../../features/tests/services/testersSessionService';
import { Link } from 'react-router-dom';
import { trackEvent } from '../../lib/events';

interface TikTokShopProductCardTesterProps {
  product: {
    id: string;
    title: string;
    name?: string;
    price: number;
    rating?: number;
    reviews_count?: number;
    image_url?: string;
    image?: string;
    images?: string[];
  };
  onAddToCart: (product: any) => void;
  variantType: string;
  testId: string;
  mainProduct?: any;
}

function formatPrice(value: number) {
  return value.toFixed(2);
}

export default function TikTokShopProductCardTester({
  product,
  onAddToCart: handleAddToCart,
  testId,
  variantType,
  mainProduct,
}: TikTokShopProductCardTesterProps) {
  const { shopperId } = useSessionStore();
  const id = product.id;
  const image = product.image_url || product.image;
  const title = product.title || product.name;
  const rating = typeof product.rating === 'number' && Number.isFinite(product.rating)
    ? Math.min(5, Math.max(0, product.rating))
    : 4;

  useEffect(() => {
    const startTime = Date.now();
    return () => {
      const endTime = Date.now();
      const timeSpent = endTime - startTime;
      if (shopperId && product.id && timeSpent > 0) {
        recordTimeSpent(
          shopperId,
          product.id,
          startTime,
          endTime,
          true,
          false,
          mainProduct?.id,
          product.id
        );
      }
    };
  }, [product, shopperId, mainProduct?.id]);

  return (
    <Link
      to={`/product/${id}?test=${testId}&variant=${variantType}`}
      state={{ product: { ...product, images: product.images }, skin: 'tiktokshop' }}
      onClick={() =>
        trackEvent('click', {
          test_id: testId,
          variation_type: variantType,
          product_id: id,
        }, location.pathname)
      }
      className="h-full flex"
    >
      <div className="relative flex flex-col w-full rounded-lg overflow-hidden border border-gray-100 hover:shadow-md transition-shadow bg-white">
        <div className="relative aspect-square bg-gray-50">
          <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-contain p-1.5"
          />
          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-medium rounded">
            Free shipping
          </span>
        </div>

        <div className="p-1.5 flex flex-col flex-1 min-h-0">
          <h3 className="text-xs text-gray-800 line-clamp-2 mb-0.5 hover:text-red-600">
            {title}
          </h3>

          <div className="flex items-center gap-0.5 text-[11px] text-gray-600 mb-0.5">
            <span className="font-medium">{rating.toFixed(1)}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={`${id}-star-${i}`}
                  className={`h-3 w-3 ${
                    i <= Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <p className="text-gray-900 font-bold text-sm">${formatPrice(product.price)}</p>
          </div>

          <button
            type="button"
            className="mt-1.5 w-full py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800"
            onClick={(e) => {
              e.preventDefault();
              handleAddToCart(product);
            }}
          >
            Add to cart
          </button>
        </div>
      </div>
    </Link>
  );
}
