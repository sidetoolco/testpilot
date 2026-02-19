import { useState, useEffect } from 'react';
import { TikTokProduct } from '../../../features/tiktok/types';
import TikTokShopHeader from '../../tiktokshop/TikTokShopHeader';
import TikTokShopSidebar from '../../tiktokshop/TikTokShopSidebar';
import TikTokShopProductGrid from '../../tiktokshop/TikTokShopProductGrid';
import ProductDetailModal from './ProductDetailModal';
import { tiktokService } from '../../../features/tiktok/services/tiktokService';

interface ProductDetails {
  images: string[];
  feature_bullets: string[];
}

interface TikTokShopPreviewProps {
  searchTerm: string;
  products: TikTokProduct[];
  variations?: {
    a: TikTokProduct | null;
    b: TikTokProduct | null;
    c: TikTokProduct | null;
  };
  embedded?: boolean;
}

export default function TikTokShopPreview({
  searchTerm,
  products,
  embedded = false,
}: TikTokShopPreviewProps) {
  const [selectedProduct, setSelectedProduct] = useState<TikTokProduct | null>(null);
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shuffledProducts, setShuffledProducts] = useState<TikTokProduct[]>(products);

  useEffect(() => {
    if (!products.length) {
      setShuffledProducts([]);
      return;
    }
    const arr = [...products];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffledProducts(arr);
  }, [products]);

  const buildProductDetails = (product: TikTokProduct) => {
    const ext = product as TikTokProduct & { images?: string[]; bullet_points?: string[]; feature_bullets?: string[] };
    return {
      images: ext.images?.length ? ext.images : [product.image_url],
      feature_bullets: ext.bullet_points || ext.feature_bullets || [],
    };
  };

  const handleProductClick = async (product: TikTokProduct) => {
    setIsLoading(true);
    try {
      const data = await tiktokService.getProductDetails(product.tiktok_id || product.id || '');

      if (data) {
        const ext = data as unknown as TikTokProduct & { images?: string[]; bullet_points?: string[]; feature_bullets?: string[] };
        setProductDetails({
          images: ext.images?.length ? ext.images : [ext.image_url || product.image_url],
          feature_bullets: ext.bullet_points || ext.feature_bullets || [],
        });
      } else {
        setProductDetails(buildProductDetails(product));
      }
      setSelectedProduct(product);
    } catch {
      setProductDetails(buildProductDetails(product));
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
    <div className={`bg-gray-50 flex ${embedded ? 'min-h-0' : 'min-h-screen'}`}>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <TikTokShopSidebar embedded={embedded} />
      <div className={`flex-1 ${embedded ? 'min-w-0' : 'pl-56'}`}>
        <TikTokShopHeader searchTerm={searchTerm} />

        <main className="max-w-5xl mx-auto py-6">
          <div className="px-4 mb-4">
            <p className="text-sm text-gray-600">
              {shuffledProducts.length} results for &quot;{searchTerm}&quot;
            </p>
          </div>

          <TikTokShopProductGrid
            products={shuffledProducts}
            onProductClick={embedded ? undefined : handleProductClick}
          />
        </main>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
          </div>
        </div>
      )}

      {!embedded && selectedProduct && productDetails && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={handleCloseModal}
          productDetails={productDetails}
        />
      )}
    </div>
  );
}
