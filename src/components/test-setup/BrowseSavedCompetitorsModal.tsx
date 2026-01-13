import { useState, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AmazonProduct } from '../../features/amazon/types';
import { WalmartProduct } from '../../features/walmart/services/walmartService';
import { toast } from 'sonner';

interface BrowseSavedCompetitorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (competitors: (AmazonProduct | WalmartProduct)[]) => void;
  skin: 'amazon' | 'walmart';
  currentlySelected: (AmazonProduct | WalmartProduct)[];
  maxCompetitors: number;
}

export function BrowseSavedCompetitorsModal({
  isOpen,
  onClose,
  onSelect,
  skin,
  currentlySelected,
  maxCompetitors,
}: BrowseSavedCompetitorsModalProps) {
  const [savedCompetitors, setSavedCompetitors] = useState<(AmazonProduct | WalmartProduct)[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCompetitors, setSelectedCompetitors] = useState<(AmazonProduct | WalmartProduct)[]>(
    currentlySelected
  );

  useEffect(() => {
    if (isOpen) {
      fetchSavedCompetitors();
    }
  }, [isOpen, skin]);

  const fetchSavedCompetitors = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Not authenticated');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) {
        toast.error('Company profile not found');
        return;
      }

      // Fetch all test competitors for this company based on skin
      const { data: tests } = await supabase
        .from('tests')
        .select('id')
        .eq('company_id', profile.company_id)
        .eq('skin', skin);

      if (!tests || tests.length === 0) {
        setSavedCompetitors([]);
        return;
      }

      const testIds = tests.map(t => t.id);

      // Fetch competitor IDs from test_competitors
      const { data: competitorIds } = await supabase
        .from('test_competitors')
        .select('product_id')
        .in('test_id', testIds);

      if (!competitorIds || competitorIds.length === 0) {
        setSavedCompetitors([]);
        return;
      }

      const uniqueProductIds = [...new Set(competitorIds.map(c => c.product_id))];

      // Fetch actual products based on skin
      let products: any[] = [];
      if (skin === 'amazon') {
        const { data: amazonProducts } = await supabase
          .from('amazon_products')
          .select('*')
          .in('id', uniqueProductIds);
        products = amazonProducts || [];
      } else {
        const { data: walmartProducts } = await supabase
          .from('walmart_products')
          .select('*')
          .in('id', uniqueProductIds);
        products = walmartProducts || [];
      }

      // Additional deduplication by product identifier (asin or walmart_id)
      const uniqueProducts = products.reduce((acc: any[], product: any) => {
        const identifier = skin === 'amazon' ? product.asin : product.walmart_id;
        const exists = acc.find(p => {
          const pId = skin === 'amazon' ? p.asin : p.walmart_id;
          return pId === identifier;
        });
        if (!exists) {
          acc.push(product);
        }
        return acc;
      }, []);

      setSavedCompetitors(uniqueProducts);
    } catch (error) {
      console.error('Error fetching saved competitors:', error);
      toast.error('Failed to load saved competitors');
    } finally {
      setLoading(false);
    }
  };

  const toggleCompetitorSelection = (competitor: AmazonProduct | WalmartProduct) => {
    const competitorId = 'asin' in competitor ? competitor.asin : competitor.walmart_id;
    const isSelected = selectedCompetitors.find(c => {
      const cId = 'asin' in c ? c.asin : (c as WalmartProduct).walmart_id;
      return cId === competitorId;
    });

    if (isSelected) {
      setSelectedCompetitors(selectedCompetitors.filter(c => {
        const cId = 'asin' in c ? c.asin : (c as WalmartProduct).walmart_id;
        return cId !== competitorId;
      }));
    } else {
      if (selectedCompetitors.length >= maxCompetitors) {
        toast.error(`You can only select up to ${maxCompetitors} competitors`);
        return;
      }
      setSelectedCompetitors([...selectedCompetitors, competitor]);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedCompetitors);
    onClose();
  };

  const filteredCompetitors = savedCompetitors.filter(competitor =>
    competitor.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Saved Competitors</h2>
            <p className="text-sm text-gray-500 mt-1">
              Select from competitors you've used in previous tests ({selectedCompetitors.length}/{maxCompetitors} selected)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E]"
              placeholder="Search competitors..."
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A67E]"></div>
            </div>
          ) : filteredCompetitors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <p className="text-lg font-medium">No saved competitors found</p>
              <p className="text-sm mt-2">
                {savedCompetitors.length === 0
                  ? 'You haven\'t saved any competitors yet'
                  : 'No competitors match your search'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCompetitors.map(competitor => {
                const competitorId = 'asin' in competitor ? competitor.asin : (competitor as WalmartProduct).walmart_id;
                const isSelected = selectedCompetitors.find(c => {
                  const cId = 'asin' in c ? c.asin : (c as WalmartProduct).walmart_id;
                  return cId === competitorId;
                });

                return (
                  <div
                    key={competitorId}
                    onClick={() => toggleCompetitorSelection(competitor)}
                    className={`relative bg-white border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#00A67E] bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-[#00A67E] text-white rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                    <img
                      src={competitor.image_url || ''}
                      alt={competitor.title}
                      className="w-full h-40 object-contain mb-3"
                    />
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                      {competitor.title}
                    </h3>
                    <p className="text-lg font-bold text-gray-900">
                      ${typeof competitor.price === 'number' ? competitor.price.toFixed(2) : competitor.price}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedCompetitors.length === 0}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              selectedCompetitors.length > 0
                ? 'bg-[#00A67E] text-white hover:bg-[#008f6b]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Select {selectedCompetitors.length} Competitor{selectedCompetitors.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

