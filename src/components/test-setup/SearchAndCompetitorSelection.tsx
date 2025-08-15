import React, { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { AmazonProduct } from '../../features/amazon/types';
import { useProductFetch } from '../../features/amazon/hooks/useProductFetch';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { SearchHeader } from './SearchHeader';
import { useCompetitorSelection } from './hooks/useCompetitorSelection';
import { FloatingCounter } from './components/FloatingCounter';
import { ProductCard } from './components/ProductCard';
import { SelectedProductsDisplay } from './components/SelectedProductsDisplay';
import { MAX_COMPETITORS } from './constants';

interface SearchAndCompetitorSelectionProps {
  searchTerm: string;
  selectedCompetitors: AmazonProduct[];
  onSearchTermChange: (term: string) => void;
  onCompetitorsChange: (competitors: AmazonProduct[]) => void;
}

export default function SearchAndCompetitorSelection({
  searchTerm,
  selectedCompetitors,
  onSearchTermChange,
  onCompetitorsChange,
}: SearchAndCompetitorSelectionProps) {
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [searchInputValue, setSearchInputValue] = useState(searchTerm);
  const [isSearching, setIsSearching] = useState(false);
  const [hasUserSearched, setHasUserSearched] = useState(false);
  
  // Only fetch products when user explicitly searches, not on mount
  const { products, loading, error, refetch } = useProductFetch(hasUserSearched ? currentSearchTerm : '');
  
  const {
    handleProductSelect,
    handleRemoveCompetitor,
    isPopping,
    isAllSelected,
    MAX_COMPETITORS: maxCompetitors,
  } = useCompetitorSelection({
    selectedCompetitors,
    onCompetitorsChange,
    maxCompetitors: MAX_COMPETITORS,
  });

  const handleSearch = useCallback((term: string) => {
    const next = term.trim();
    if (!next) return;
    
    setCurrentSearchTerm(next);
    onSearchTermChange(next);
    setIsSearching(true);
    setHasUserSearched(true);
  }, [onSearchTermChange]);

  const handleSearchInputChange = useCallback((value: string) => {
    setSearchInputValue(value);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    handleSearch(searchInputValue);
  }, [handleSearch, searchInputValue]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  }, [handleSearchSubmit]);

  const hasSearchResults = products.length > 0;
  const isSearchingForProducts = loading && isSearching;

  // Only show loading screen if we have no products and no selected competitors
  if (isSearchingForProducts && !hasSearchResults && selectedCompetitors.length === 0) {
    return <LoadingState showProgress message="Searching for products..." />;
  }
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="max-w-6xl mx-auto">
      <SearchHeader
        title={hasUserSearched ? `Search & Select Competitors${currentSearchTerm ? ` - "${currentSearchTerm}"` : ''}` : "Search & Select Competitors"}
        subtitle={`Search for products and select ${MAX_COMPETITORS} competitors for your test.`}
      />

      {/* Search Input - Always visible at top */}
      <div className="mb-8">
        <div className="flex gap-3  mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchInputValue}
              onChange={e => handleSearchInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E] transition-colors"
              placeholder="e.g., 'Fabric Softener'"
            />
          </div>
          <button
            onClick={handleSearchSubmit}
            disabled={!searchInputValue.trim() || loading}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              searchInputValue.trim() && !loading
                ? 'bg-[#00A67E] text-white hover:bg-[#008f6b]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {/* Show current search term if there are results */}
        {hasSearchResults && currentSearchTerm && (
          <div className="mt-2 text-sm text-gray-500">
            Current search: <span className="font-medium">"{currentSearchTerm}"</span>
          </div>
        )}
      </div>

      {/* Selected Products Display */}
      <SelectedProductsDisplay
        selectedCompetitors={selectedCompetitors}
        maxCompetitors={MAX_COMPETITORS}
        onRemoveCompetitor={handleRemoveCompetitor}
        isPopping={isPopping}
        isAllSelected={isAllSelected}
      />

      {/* Search Results - Only show when there are results and not searching */}
      {hasSearchResults && !isSearchingForProducts && (
        <div className="mb-8">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results ({products.length} products)
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Showing results for: <span className="font-medium">"{currentSearchTerm}"</span>
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product, index) => {
              const isSelected = selectedCompetitors.find(p => p.asin === product.asin);
              const canSelect = !isSelected && selectedCompetitors.length < MAX_COMPETITORS;
              
              return (
                <ProductCard
                  key={`${product.asin}-${product.id || index}`}
                  product={product}
                  isSelected={!!isSelected}
                  canSelect={canSelect}
                  onSelect={handleProductSelect}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Loading Spinner for Search Results - Only replaces the results area */}
      {isSearchingForProducts && (
        <div className="mb-8">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Searching for: <span className="font-medium">"{currentSearchTerm}"</span>
            </h3>
          </div>
          
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#00A67E] border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Searching for products...</p>
              <p className="text-gray-400 text-sm mt-1">This may take a few moments</p>
            </div>
          </div>
        </div>
      )}

      {/* No Results Found */}
      {!loading && !hasSearchResults && hasUserSearched && (
        <div className="mb-8 text-center py-12">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">No results found</h3>
          <p className="text-gray-400">No products matched "{currentSearchTerm}". Try a different term.</p>
        </div>
      )}

      {/* No Search Performed Yet */}
      {!loading && !hasSearchResults && !hasUserSearched && (
        <div className="mb-8 text-center py-12">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            Ready to search for products?
          </h3>
          <p className="text-gray-400">
            Enter a search term above and click Search to find competitor products
          </p>
        </div>
      )}

      {/* Floating counter */}
      <FloatingCounter
        selectedCount={selectedCompetitors.length}
        maxCount={MAX_COMPETITORS}
        isPopping={isPopping}
        isAllSelected={isAllSelected}
        variant="simple"
      />
    </div>
  );
}