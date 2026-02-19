import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { AmazonProduct } from '../../features/amazon/types';
import { WalmartProduct } from '../../features/walmart/services/walmartService';
import { useProductFetch } from '../../features/amazon/hooks/useProductFetch';
import { useWalmartProducts } from '../../features/walmart/hooks/useWalmartProducts';
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
  selectedCompetitors: (AmazonProduct | WalmartProduct)[];
  onSearchTermChange: (term: string) => void;
  onCompetitorsChange: (competitors: (AmazonProduct | WalmartProduct)[]) => void;
  skin: 'amazon' | 'walmart' | 'tiktokshop';
}

export default function SearchAndCompetitorSelection({
  searchTerm,
  selectedCompetitors,
  onSearchTermChange,
  onCompetitorsChange,
  skin,
}: SearchAndCompetitorSelectionProps) {
  const [currentSearchTerm, setCurrentSearchTerm] = useState(searchTerm);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasUserSearched, setHasUserSearched] = useState(false);
  const [originalSearchTerm] = useState(searchTerm); // Preserve the original search term
  
  // Use appropriate hook based on skin - only call useProductFetch when we actually want to search
  const { products: amazonProducts, loading: amazonLoading, error: amazonError, refetch: amazonRefetch } = useProductFetch(
    hasUserSearched && (skin === 'amazon' || skin === 'tiktokshop') ? currentSearchTerm : ''
  );
  const { products: walmartProducts, loading: walmartLoading, error: walmartError, searchProducts: walmartSearchProducts } = useWalmartProducts();
  
  // Monitor skin prop changes
  useEffect(() => {
    console.log('SearchAndCompetitorSelection: Skin prop changed to:', skin);
  }, [skin]);

  // Single consolidated search effect - handles initial search only
  useEffect(() => {
    console.log('Initial search useEffect triggered:', {
      searchTerm: searchTerm.trim(),
      hasUserSearched,
      skin,
      currentSearchTerm
    });
    
    // Only proceed if we have a search term and haven't searched yet
    if (searchTerm.trim() && !hasUserSearched) {
      setCurrentSearchTerm(searchTerm);
      setHasUserSearched(true);
      setIsSearching(true);
      
      // Trigger search based on skin
      if (skin === 'amazon' || skin === 'tiktokshop') {
        console.log('Initial Amazon search for:', searchTerm);
        // Amazon search is handled by useProductFetch hook
      } else if (skin === 'walmart') {
        console.log('Initial Walmart search for:', searchTerm);
        walmartSearchProducts(searchTerm);
      }
      
      // Reset searching state after a short delay
      setTimeout(() => setIsSearching(false), 100);
    }
  }, [searchTerm, hasUserSearched, skin, walmartSearchProducts]);

  // Get products and loading state based on skin (tiktokshop uses Amazon API)
  const products = skin === 'walmart' ? walmartProducts : amazonProducts;
  const loading = skin === 'walmart' ? walmartLoading : amazonLoading;
  const error = skin === 'walmart' ? walmartError : amazonError;
  
  // Debug logging
  console.log('SearchAndCompetitorSelection state:', {
    skin,
    hasUserSearched,
    currentSearchTerm,
    isSearching,
    loading,
    amazonProducts: amazonProducts.length,
    walmartProducts: walmartProducts.length,
    products: products.length,
    error
  });

  const {
    handleProductSelect,
    handleRemoveCompetitor,
    isPopping,
    isAllSelected,
    maxCompetitors,
  } = useCompetitorSelection({
    selectedCompetitors,
    onCompetitorsChange,
    maxCompetitors: MAX_COMPETITORS,
  });

  const handleSearch = useCallback((term: string) => {
    const next = term.trim();
    if (!next) return;
    
    setCurrentSearchTerm(next);
    setIsSearching(true);
    setHasUserSearched(true);
    
    // Trigger search based on skin (tiktokshop uses Amazon API)
    if (skin === 'amazon' || skin === 'tiktokshop') {
      console.log('Using Amazon search for:', next);
      amazonRefetch();
    } else if (skin === 'walmart') {
      console.log('Using Walmart search for:', next);
      walmartSearchProducts(next);
    }
    
    // Reset searching state after a short delay
    setTimeout(() => setIsSearching(false), 100);
  }, [skin, walmartSearchProducts, amazonRefetch]);

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
  const isSearchingForProducts = (loading || isSearching) && hasUserSearched;

  // Memoize expensive computations to prevent re-renders during scrolling
  const memoizedProducts = useMemo(() => {
    return products.map((product, index) => {
      // Handle both Amazon and Walmart products
      const productId = 'asin' in product ? product.asin : (product as any).walmart_id;
      const isSelected = selectedCompetitors.find(p => {
        if ('asin' in p && 'asin' in product) {
          return p.asin === product.asin;
        } else if ('walmart_id' in p && 'walmart_id' in product) {
          return p.walmart_id === product.walmart_id;
        }
        return false;
      });
      const canSelect = !isSelected && selectedCompetitors.length < MAX_COMPETITORS;
      
      return {
        product,
        isSelected: !!isSelected,
        canSelect,
        key: `${productId}-${index}`,
      };
    });
  }, [products, selectedCompetitors, MAX_COMPETITORS]);

  // Show loading screen for initial search or when searching with no results
  if (isSearchingForProducts && !hasSearchResults && selectedCompetitors.length === 0) {
    return <LoadingState showProgress message={`Searching for products matching "${searchTerm}"...`} />;
  }
  if (error) return <ErrorState error={error} onRetry={() => {
    if (skin === 'amazon' || skin === 'tiktokshop') {
      amazonRefetch();
    } else if (skin === 'walmart') {
      walmartSearchProducts(currentSearchTerm);
    }
  }} />;

  return (
    <div className="max-w-6xl mx-auto">
      <SearchHeader
        title={`Search & Select Competitors - "${originalSearchTerm}"`}
        subtitle={` Search for additional products or select from existing results. You can also search for specific brands if needed.`}
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
              placeholder="Search for additional products..."
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
        {hasSearchResults && currentSearchTerm && currentSearchTerm !== originalSearchTerm && (
          <div className="mt-2 text-sm text-gray-500">
            Additional search: <span className="font-medium">"{currentSearchTerm}"</span>
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
              {currentSearchTerm === originalSearchTerm 
                ? `Showing results for your original search: "${currentSearchTerm}"`
                : `Showing results for additional search: "${currentSearchTerm}"`
              }
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {memoizedProducts.map(({ product, isSelected, canSelect, key }) => (
              <ProductCard
                key={key}
                product={product}
                isSelected={isSelected}
                canSelect={canSelect}
                onSelect={handleProductSelect}
              />
            ))}
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
          <p className="text-gray-400">No products matched "{currentSearchTerm}". Try a different search term.</p>
        </div>
      )}

      {/* No Search Performed Yet */}
      {!loading && !hasSearchResults && !hasUserSearched && (
        <div className="mb-8 text-center py-12">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            Preparing your search...
          </h3>
          <p className="text-gray-400">
            Setting up search for "{originalSearchTerm}". This will only take a moment.
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