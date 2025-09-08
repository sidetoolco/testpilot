import React from 'react';
import AmazonPreview from './preview/AmazonPreview';
import { AmazonProduct } from '../../features/amazon/types';

interface TestPreviewProps {
  searchTerm: string;
  competitors: AmazonProduct[];
  variations: {
    a: AmazonProduct | null;
    b: AmazonProduct | null;
    c: AmazonProduct | null;
  };
}

export default function TestPreview({ searchTerm, competitors, variations }: TestPreviewProps) {
  // Memoize the initial product list with variation A prioritized
  const allProducts = React.useMemo(() => {
    const products = [...competitors];
    if (variations.a) {
      products.unshift(variations.a); // Ensure variation A is first if available
    }
    return products;
  }, [competitors, variations.a]);

  const [displayProducts, setDisplayProducts] = React.useState(allProducts);
  const [selectedVariant, setSelectedVariant] = React.useState<string | null>(
    variations.a ? 'a' : null
  );

  React.useEffect(() => {
    setDisplayProducts(allProducts);
  }, [allProducts]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleSelectVariant = (variantKey: string, variant: AmazonProduct | null) => {
    if (variant) {
      const allProductsToShuffle = [variant, ...competitors];
      const shuffledProducts = shuffleArray(allProductsToShuffle);
      setDisplayProducts(shuffledProducts);
      setSelectedVariant(variantKey);
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

      <AmazonPreview searchTerm={searchTerm} products={displayProducts} variations={variations} />
    </div>
  );
}
