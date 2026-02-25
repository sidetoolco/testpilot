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

interface TikTokShopProductGridProps {
  products: Product[];
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  tester?: {
    testId: string;
    variantType: string;
    mainProduct?: any;
  };
}

export default function TikTokShopProductGrid({
  products,
  onProductClick,
  onAddToCart,
  tester,
}: TikTokShopProductGridProps) {
  if (!products.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {products.map((product, index) => (
        <div key={product.id} className="min-w-0">
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
  );
}
