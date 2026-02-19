import { useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import TikTokShopProductCard from './TikTokShopProductCard';
import TikTokShopProductCardTester from './TikTokShopProductCardTester';

interface Product {
  id: string;
  title?: string;
  name?: string;
  price: number;
  rating?: number;
  reviews_count?: number;
  image_url?: string;
  image?: string;
  images?: string[];
}

interface TikTokShopCarouselProps {
  title?: string;
  products: Product[];
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  tester?: {
    testId: string;
    variantType: string;
    mainProduct?: any;
  };
}

export default function TikTokShopCarousel({
  title,
  products,
  onProductClick,
  onAddToCart,
  tester,
}: TikTokShopCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  if (!products.length) return null;

  return (
    <section className="mb-6">
      {title ? <h2 className="text-xl font-bold text-gray-900 mb-4 px-4">{title}</h2> : null}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pl-4 pr-12 pb-2"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {products.map((product, index) => (
            <div
              key={product.id}
              className="scroll-snap-start flex-shrink-0 w-[calc((100%-3rem)/5)] min-w-[120px] max-w-[160px]"
              style={{ scrollSnapAlign: 'start' }}
            >
              {tester && onAddToCart ? (
                <TikTokShopProductCardTester
                  product={product}
                  onAddToCart={onAddToCart}
                  testId={tester.testId}
                  variantType={tester.variantType}
                  mainProduct={tester.mainProduct}
                />
              ) : (
                <TikTokShopProductCard
                  product={{
                    id: product.id,
                    title: product.title || product.name || '',
                    price: product.price,
                    rating: product.rating,
                    reviews_count: product.reviews_count,
                    image_url: product.image_url || product.image || '',
                  }}
                  showFreeShipping={index % 3 === 0}
                  showFlashSale={index === 1}
                  showImmediateShip={index === products.length - 1 && products.length > 2}
                  onProductClick={onProductClick}
                  onAddToCart={onAddToCart}
                />
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={scrollRight}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center hover:bg-gray-50 z-10"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </section>
  );
}
