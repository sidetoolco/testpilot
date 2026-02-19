import React from 'react';
import AmazonPreview from './preview/AmazonPreview';
import WalmartPreview from './preview/WalmartPreview';
import TikTokShopPreview from './preview/TikTokShopPreview';
import { AmazonProduct } from '../../features/amazon/types';
import { WalmartProduct } from '../../features/walmart/services/walmartService';
import { TikTokProduct } from '../../features/tiktok/types';

interface TestPreviewProps {
  searchTerm: string;
  competitors: (AmazonProduct | WalmartProduct | TikTokProduct)[];
  variations: {
    a: any | null;
    b: any | null;
    c: any | null;
  };
  skin?: 'amazon' | 'walmart' | 'tiktokshop';
}

export default function TestPreview({ searchTerm, competitors, variations, skin = 'amazon' }: TestPreviewProps) {
  // Filter products based on skin type
  const filteredCompetitors = React.useMemo(() => {
    if (skin === 'walmart') {
      return competitors.filter(product => 'walmart_id' in product) as WalmartProduct[];
    }
    if (skin === 'tiktokshop') {
      return competitors.filter(product => 'tiktok_id' in product) as TikTokProduct[];
    }
    return competitors.filter(product => 'asin' in product) as AmazonProduct[];
  }, [competitors, skin]);

  // Memoize the initial product list with variation A prioritized
  const allProducts = React.useMemo(() => {
    const products = [...filteredCompetitors];
    if (variations.a) {
      // During test creation, variations are stored in the generic products table
      // and don't have 'asin' field. We need to check the skin type instead.
      if (skin === 'walmart') {
        // For Walmart skin, add the variation (it should be a Walmart product)
        products.unshift(variations.a as WalmartProduct);
      } else if (skin === 'amazon') {
        products.unshift(variations.a as AmazonProduct);
      } else if (skin === 'tiktokshop') {
        products.unshift(variations.a as TikTokProduct);
      }
    }
    return products;
  }, [filteredCompetitors, variations.a, skin]);

  // Use separate state for each skin type to maintain type safety
  const [amazonDisplayProducts, setAmazonDisplayProducts] = React.useState<AmazonProduct[]>([]);
  const [walmartDisplayProducts, setWalmartDisplayProducts] = React.useState<WalmartProduct[]>([]);
  const [tiktokDisplayProducts, setTiktokDisplayProducts] = React.useState<TikTokProduct[]>([]);
  const [selectedVariant, setSelectedVariant] = React.useState<string | null>(
    variations.a ? 'a' : null
  );

  React.useEffect(() => {
    if (skin === 'amazon') {
      setAmazonDisplayProducts(allProducts as AmazonProduct[]);
      setWalmartDisplayProducts([]);
      setTiktokDisplayProducts([]);
    } else if (skin === 'tiktokshop') {
      setTiktokDisplayProducts(allProducts as TikTokProduct[]);
      setAmazonDisplayProducts([]);
      setWalmartDisplayProducts([]);
    } else {
      setWalmartDisplayProducts(allProducts as WalmartProduct[]);
      setAmazonDisplayProducts([]);
      setTiktokDisplayProducts([]);
    }
  }, [allProducts, skin]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleSelectVariant = (variantKey: string, variant: any | null) => {
    if (variant) {
      // During test creation, variations are stored in the generic products table
      // and don't have 'asin' field. We need to check the skin type instead.
      let variantToUse = null;
      if (skin === 'walmart') {
        variantToUse = variant as WalmartProduct;
      } else if (skin === 'amazon') {
        variantToUse = variant as AmazonProduct;
      } else if (skin === 'tiktokshop') {
        variantToUse = variant as TikTokProduct;
      }
      
      if (variantToUse) {
        const allProductsToShuffle = [variantToUse, ...filteredCompetitors];
        const shuffledProducts = shuffleArray(allProductsToShuffle);
        
        if (skin === 'amazon') {
          setAmazonDisplayProducts(shuffledProducts as AmazonProduct[]);
        } else if (skin === 'tiktokshop') {
          setTiktokDisplayProducts(shuffledProducts as TikTokProduct[]);
        } else {
          setWalmartDisplayProducts(shuffledProducts as WalmartProduct[]);
        }
        setSelectedVariant(variantKey);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">Preview Test Layout</h3>
        <p className="text-lg text-gray-500">
          This is how your test will appear to participants. Products are shown in random order to
          simulate a real shopping experience.
        </p>
      </div>
      <div className="bg-gray-100 p-4 rounded-lg mb-8">
        <div className="flex justify-center items-center">
          <div className="flex space-x-3">
            {Object.entries(variations).map(([key, variant]) => (
              <button
                key={key}
                onClick={() => handleSelectVariant(key, variant)}
                className={`px-6 py-2 rounded font-medium transition-colors
                  ${
                    variant
                      ? selectedVariant === key
                        ? 'bg-green-500 text-white hover:bg-green-600' // Selected variant in green
                        : 'bg-green-200 text-black hover:bg-gray-400' // Other available variants in light gray
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed' // Unavailable variants in gray
                  }`}
                disabled={!variant}
              >
                Variant {key.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {skin === 'tiktokshop' ? (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-inner max-h-[80vh] overflow-y-auto">
          <TikTokShopPreview embedded searchTerm={searchTerm} products={tiktokDisplayProducts} variations={variations} />
        </div>
      ) : skin === 'walmart' ? (
        (() => {
          // Calculate competitor indices - competitors start from index 1 (after variation A)
          const competitorIndices = walmartDisplayProducts.length > 1 
            ? Array.from({ length: walmartDisplayProducts.length - 1 }, (_, i) => i + 1)
            : [];
          return (
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-inner max-h-[80vh] overflow-y-auto">
            <WalmartPreview searchTerm={searchTerm} products={walmartDisplayProducts} competitorIndices={competitorIndices} />
          </div>
        );
        })()
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-inner max-h-[80vh] overflow-y-auto">
          <AmazonPreview searchTerm={searchTerm} products={amazonDisplayProducts} variations={variations} />
        </div>
      )}
    </div>
  );
}
