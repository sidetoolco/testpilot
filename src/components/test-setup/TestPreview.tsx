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
  onNext: () => void;
  onBack: () => void;
}

export default function TestPreview({ searchTerm, competitors, variations, onNext, onBack }: TestPreviewProps) {
  // Combine and randomize selected products and variations
  const allProducts = React.useMemo(() => {
    const selectedProducts = [
      ...competitors,
      ...Object.values(variations).filter((v): v is AmazonProduct => v !== null)
    ];
    
    // Fisher-Yates shuffle
    const shuffled = [...selectedProducts];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  }, [competitors, variations]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">
          Preview Test Layout
        </h3>
        <p className="text-lg text-gray-500">
          This is how your test will appear to participants. Products are shown in random order to simulate a real shopping experience.
        </p>
      </div>

      <AmazonPreview searchTerm={searchTerm} products={allProducts} />
    </div>
  );
}