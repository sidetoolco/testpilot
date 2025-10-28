import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { AmazonProduct } from '../../../features/amazon/types';
import AmazonHeader from './AmazonHeader';
import AmazonNavigation from './AmazonNavigation';
import ProductDetailModal from './ProductDetailModal';
import PreviewGrid from './PreviewGrid';

interface ProductDetails {
  images: string[];
  feature_bullets: string[];
}

interface AmazonPreviewProps {
  searchTerm: string;
  products: AmazonProduct[];
  variations?: {
    a: AmazonProduct | null;
    b: AmazonProduct | null;
    c: AmazonProduct | null;
  };
}

export default function AmazonPreview({ searchTerm, products, variations }: AmazonPreviewProps) {
  const [selectedProduct, setSelectedProduct] = useState<AmazonProduct | null>(null);
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Randomize product positions
  const [shuffledProducts, setShuffledProducts] = useState<AmazonProduct[]>(products);

  // Shuffle products when products change (client-only)
  useEffect(() => {
    if (!products.length) {
      setShuffledProducts([]);
      return;
    }

    const arr = products.slice();
    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffledProducts(arr);
  }, [products]);

  // Helper function to build product details from a product
  const buildProductDetails = (product: AmazonProduct) => {
    const extendedProduct = product as AmazonProduct & { images?: string[]; bullet_points?: string[]; feature_bullets?: string[] };
    return {
      images: extendedProduct.images && extendedProduct.images.length > 0 
        ? extendedProduct.images 
        : [product.image_url],
      feature_bullets: extendedProduct.bullet_points || extendedProduct.feature_bullets || [],
    };
  };

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
        .maybeSingle();

      if (error) {
        console.error('Error fetching product details:', error);
        // If there's an error, use the product data with fallback
        setProductDetails(buildProductDetails(product));
      } else if (data) {
        // Use the fetched data from database
        console.log('Fetched product data from database:', data);
        const extendedData = data as unknown as AmazonProduct & { images?: string[]; bullet_points?: string[]; feature_bullets?: string[] };
        setProductDetails({
          images: extendedData.images && extendedData.images.length > 0 
            ? extendedData.images 
            : [extendedData.image_url || product.image_url],
          feature_bullets: extendedData.bullet_points || extendedData.feature_bullets || [],
        });
      } else {
        // No data found, use product data
        console.log('No data found, using product data:', product);
        setProductDetails(buildProductDetails(product));
      }
      setSelectedProduct(product);
    } catch (error) {
      console.error('Error fetching product details:', error);
      // In case of error, use the product data
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
    <div className="bg-[#EAEDED] min-h-[600px]">
      <AmazonHeader searchTerm={searchTerm} />
      <AmazonNavigation />

      <div className="max-w-screen-2xl mx-auto px-4 py-4">
        {/* Results Count */}
        <div className="bg-white p-4 mb-4 rounded-sm">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-[#565959]">{shuffledProducts.length} results for</span>
            <span className="text-sm font-bold text-[#0F1111]">"{searchTerm}"</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex gap-4">
          {/* Product Grid */}
          <div className="flex-1">
            <PreviewGrid 
              products={shuffledProducts} 
              onProductClick={handleProductClick as any}
              variations={variations}
            />
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
