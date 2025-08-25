import React, { useState, useRef, useEffect } from 'react';
import { Search, Info } from 'lucide-react';
import { useAuthStore } from '../../features/auth/stores/authStore';
import { useProductFetch } from '../../features/amazon/hooks/useProductFetch';
import { AmazonProduct } from '../../features/amazon/types';
import { SearchHeader } from './SearchHeader';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { useCompetitorSelection } from './hooks/useCompetitorSelection';
import { FloatingCounter } from './components/FloatingCounter';
import { ProductCard } from './components/ProductCard';
import { MAX_COMPETITORS } from './constants';
import apiClient from '../../lib/api';

interface CompetitorSelectionProps {
  searchTerm: string;
  selectedCompetitors: AmazonProduct[];
  onChange: (competitors: AmazonProduct[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function CompetitorSelection({
  searchTerm,
  selectedCompetitors,
  onChange,
  onNext,
}: CompetitorSelectionProps) {
  const [searchFilter, setSearchFilter] = useState('');
  const { user } = useAuthStore();
  const { products, loading, error } = useProductFetch(searchTerm);
  const isInitialLoad = useRef(true);

  const {
    handleProductSelect,
    isPopping,
    isAllSelected,
    maxCompetitors,
  } = useCompetitorSelection({
    selectedCompetitors,
    onCompetitorsChange: onChange,
    maxCompetitors: MAX_COMPETITORS,
  });

  // Enhanced product selection with auto-save
  const handleProductSelectWithSave = async (product: AmazonProduct) => {
    if (selectedCompetitors.find(p => p.asin === product.asin)) {
      onChange(selectedCompetitors.filter(p => p.asin !== product.asin));
    } else if (selectedCompetitors.length < MAX_COMPETITORS) {
      const newCompetitors = [...selectedCompetitors, product];
      onChange(newCompetitors);

      // Auto-save when reaching 11 products
      if (newCompetitors.length === MAX_COMPETITORS) {
        try {
          await apiClient.post('/amazon/products', {
            products: newCompetitors,
            userId: user?.id,
          });
        } catch (error) {
          console.error('Error saving competitors:', error);
        }
      }
    }
  };

  // Reset selection only on initial load, not on every search term change
  React.useEffect(() => {
    if (products.length && isInitialLoad.current) {
      onChange([]);
      isInitialLoad.current = false;
    }
  }, [products.length, onChange]);

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  if (loading) return <LoadingState showProgress message="Gathering competitive products..." />;
  if (error) return <ErrorState error={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="max-w-6xl mx-auto">
      <SearchHeader
        title="Select Competitor Products"
        subtitle={`Select ${MAX_COMPETITORS} selling products in your category. This will help us improve the test results.`}
      />

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Filter products..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A67E]"
            />
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Info className="h-5 w-5 text-gray-400" />
            <span className={`text-sm ${isAllSelected ? 'text-green-600' : 'text-gray-500'}`}>
              Selected: {selectedCompetitors.length} of {MAX_COMPETITORS}
            </span>
          </div>
        </div>
      </div>

      {/* Floating counter */}
      <FloatingCounter
        selectedCount={selectedCompetitors.length}
        maxCount={MAX_COMPETITORS}
        isPopping={isPopping}
        isAllSelected={isAllSelected}
        variant="detailed"
      />

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product, index) => {
          const isSelected = selectedCompetitors.find(p => p.asin === product.asin);
          const canSelect = !isSelected && selectedCompetitors.length < MAX_COMPETITORS;
          
          return (
            <ProductCard
              key={`${product.asin}-${product.id || index}`}
              product={product}
              isSelected={!!isSelected}
              canSelect={canSelect}
              onSelect={handleProductSelectWithSave}
              showTooltip={true}
            />
          );
        })}
      </div>
    </div>
  );
}
