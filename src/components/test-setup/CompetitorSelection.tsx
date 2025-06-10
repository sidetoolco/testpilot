import React, { useState, useRef } from 'react';
import { Search, Info, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../features/auth/stores/authStore';
import { useProductFetch } from '../../features/amazon/hooks/useProductFetch';
import { ProductGrid } from '../../features/amazon/components/ProductGrid';
import { AmazonProduct } from '../../features/amazon/types';
import { SearchHeader } from './SearchHeader';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { toast } from 'sonner';
import apiClient from '../../lib/api';

interface CompetitorSelectionProps {
  searchTerm: string;
  selectedCompetitors: AmazonProduct[];
  onChange: (competitors: AmazonProduct[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const MAX_COMPETITORS = 11;

export default function CompetitorSelection({
  searchTerm,
  selectedCompetitors,
  onChange,
  onNext,
}: CompetitorSelectionProps) {
  const [searchFilter, setSearchFilter] = useState('');
  const { user } = useAuthStore();
  const { products, loading, error } = useProductFetch(searchTerm, user?.id);
  const isInitialLoad = useRef(true);

  const handleProductSelect = async (product: AmazonProduct) => {
    if (selectedCompetitors.find(p => p.asin === product.asin)) {
      onChange(selectedCompetitors.filter(p => p.asin !== product.asin));
    } else if (selectedCompetitors.length < MAX_COMPETITORS) {
      const newCompetitors = [...selectedCompetitors, product];
      onChange(newCompetitors);
      
      // Si llegamos a 11 productos, guardamos automáticamente
      if (newCompetitors.length === MAX_COMPETITORS) {
        try {
          await apiClient.post('/amazon/products', { 
            products: newCompetitors,
            userId: user?.id 
          });
        } catch (error) {
          console.error('Error saving competitors:', error);
          toast.error('Failed to save competitors, but continuing with the process');
        }
      }
    } else {
      toast.error(`Please select exactly ${MAX_COMPETITORS} competitors`);
    }
  };

  // Reiniciar la selección solo cuando cambia el término de búsqueda
  React.useEffect(() => {
    if (products.length && isInitialLoad.current) {
      onChange([]);
      isInitialLoad.current = false;
    }
  }, [searchTerm, products.length]);

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  if (loading) return <LoadingState showProgress message="Gathering competitive products..." />;
  if (error) return <ErrorState error={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="max-w-6xl mx-auto">
      <SearchHeader
        title="Select Competitor Products"
        subtitle={`We've pre-selected the top ${MAX_COMPETITORS} selling products in your category. You can modify this selection to include different competitors in your test.`}
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
            <span
              className={`text-sm ${selectedCompetitors.length === MAX_COMPETITORS ? 'text-green-600' : 'text-gray-500'}`}
            >
              Selected: {selectedCompetitors.length} of {MAX_COMPETITORS}
            </span>
          </div>
        </div>
      </div>

      {/* Floating counter */}
      <div className="fixed bottom-8 right-8 bg-white rounded-lg shadow-lg p-4 z-50 border border-gray-200">
        <div className="flex items-center space-x-2">
          <CheckCircle2
            className={`h-5 w-5 ${selectedCompetitors.length === MAX_COMPETITORS ? 'text-green-500' : 'text-gray-400'}`}
          />
          <span className="text-sm font-medium">
            {selectedCompetitors.length} of {MAX_COMPETITORS} selected
          </span>
        </div>
      </div>

      <ProductGrid
        products={filteredProducts}
        selectedProducts={selectedCompetitors}
        onProductSelect={handleProductSelect}
        renderTooltip={product => (
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-white p-2 rounded-lg shadow-lg">
              <span className="text-sm font-medium">
                {selectedCompetitors.find(p => p.asin === product.asin)
                  ? 'Click to deselect'
                  : selectedCompetitors.length < MAX_COMPETITORS
                    ? 'Click to select'
                    : 'Maximum competitors reached'}
              </span>
            </div>
          </div>
        )}
      />
    </div>
  );
}
