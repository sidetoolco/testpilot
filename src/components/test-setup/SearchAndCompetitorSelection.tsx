import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Check } from 'lucide-react';
import { AmazonProduct } from '../../features/amazon/types';
import { useProductFetch } from '../../features/amazon/hooks/useProductFetch';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { SearchHeader } from './SearchHeader';
import { toast } from 'sonner';

interface SearchAndCompetitorSelectionProps {
  searchTerm: string;
  selectedCompetitors: AmazonProduct[];
  onSearchTermChange: (term: string) => void;
  onCompetitorsChange: (competitors: AmazonProduct[]) => void;
}

const MAX_COMPETITORS = 11;

export default function SearchAndCompetitorSelection({
  searchTerm,
  selectedCompetitors,
  onSearchTermChange,
  onCompetitorsChange,
}: SearchAndCompetitorSelectionProps) {
  const [currentSearchTerm, setCurrentSearchTerm] = useState(searchTerm);
  const [searchInputValue, setSearchInputValue] = useState(searchTerm);
  const [isSearching, setIsSearching] = useState(false);
  const [isPopping, setIsPopping] = useState(false);
  const { products, loading, error, refetch } = useProductFetch(currentSearchTerm);
  const prevCount = useRef(selectedCompetitors.length);

  const handleSearch = useCallback((term: string) => {
    const next = term.trim();
    if (!next) return;
    
    // Don't clear selected competitors - maintain selections during search
    setCurrentSearchTerm(next);
    onSearchTermChange(next);
    setIsSearching(true);
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

  const handleProductSelect = useCallback((product: AmazonProduct) => {
    if (selectedCompetitors.find(p => p.asin === product.asin)) {
      onCompetitorsChange(selectedCompetitors.filter(p => p.asin !== product.asin));
    } else if (selectedCompetitors.length < MAX_COMPETITORS) {
      const newCompetitors = [...selectedCompetitors, product];
      onCompetitorsChange(newCompetitors);
    } else {
      toast.error(`Please select exactly ${MAX_COMPETITORS} competitors`);
    }
  }, [selectedCompetitors, onCompetitorsChange]);

  const handleRemoveCompetitor = useCallback((asin: string) => {
    onCompetitorsChange(selectedCompetitors.filter(p => p.asin !== asin));
  }, [selectedCompetitors, onCompetitorsChange]);

  // Pop animation when item is added
  useEffect(() => {
    if (selectedCompetitors.length > prevCount.current) {
      setIsPopping(true);
      const timer = setTimeout(() => setIsPopping(false), 400);
      return () => clearTimeout(timer);
    }
    prevCount.current = selectedCompetitors.length;
  }, [selectedCompetitors.length]);

  const isAllSelected = selectedCompetitors.length === MAX_COMPETITORS;
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
        title={hasSearchResults ? `Search & Select Competitors - "${currentSearchTerm}"` : "Search & Select Competitors"}
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
      </div>

      {/* Selected Products - Always visible when there are selections */}
      {selectedCompetitors.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Selected Competitors ({selectedCompetitors.length}/{MAX_COMPETITORS})
            </h3>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 pt-2">
            {selectedCompetitors.map((product, index) => (
              <div
                key={`${product.asin}-${product.id || index}`}
                className={`flex-shrink-0 relative group ${
                  isPopping && index === selectedCompetitors.length - 1
                    ? 'animate-bounce'
                    : ''
                }`}
              >
                <div className="w-24 h-24 border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => handleRemoveCompetitor(product.asin)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-600 font-medium">${product.price}</p>
                  <p className="text-xs text-gray-500">{product.rating}★</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Selection status message */}
          {selectedCompetitors.length > 0 && (
            <div className="mt-4 text-center">
              {isAllSelected ? (
                <div className="flex items-center justify-center text-green-600">
                  <Check className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Perfect! You have selected exactly 11 competitors. You can now continue to the next step.</span>
                </div>
              ) : (
                <div className="text-gray-500 text-sm">
                  {selectedCompetitors.length < MAX_COMPETITORS 
                    ? `Select ${MAX_COMPETITORS - selectedCompetitors.length} more competitor${MAX_COMPETITORS - selectedCompetitors.length !== 1 ? 's' : ''} to continue`
                    : `You have selected ${selectedCompetitors.length} competitors. Please select exactly ${MAX_COMPETITORS} to continue.`
                  }
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
                <div
                  key={`${product.asin}-${product.id || index}`}
                  className={`border rounded-lg p-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-green-500 bg-green-50'
                      : canSelect
                      ? 'border-gray-200 hover:border-[#00A67E] hover:shadow-md'
                      : 'border-gray-200 opacity-50'
                  }`}
                  onClick={() => {
                    if (isSelected) {
                      // Unselect if already selected
                      handleProductSelect(product);
                    } else if (canSelect) {
                      // Select if can be selected
                      handleProductSelect(product);
                    }
                  }}
                >
                  <div className="w-full h-32 mb-3 rounded overflow-hidden bg-white">
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                      {product.title}
                    </h4>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        ${product.price}
                      </span>
                      <span className="text-sm text-gray-500">
                        {product.rating}★ ({product.reviews_count.toLocaleString()})
                      </span>
                    </div>

                    {isSelected ? (
                      <div className="flex items-center justify-center text-green-600">
                        <Check className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    ) : canSelect ? (
                      <div className="text-center text-[#00A67E] text-sm font-medium">
                        Click to Select
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 text-sm">
                        Max reached
                      </div>
                    )}
                  </div>
                </div>
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

      {/* No Search Performed Yet */}
      {!hasSearchResults && !loading && (
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
      <div
        className={`fixed bottom-8 right-8 rounded-lg shadow-lg p-4 z-50 border transition-all duration-300 ease-out ${
          isAllSelected
            ? 'bg-green-500 text-white border-green-600'
            : 'bg-white text-gray-700 border-gray-200'
        }`}
      >
        <div className="text-center">
          <div className="text-2xl font-bold">{selectedCompetitors.length}</div>
          <div className="text-sm">of {MAX_COMPETITORS}</div>
        </div>
      </div>
    </div>
  );
}