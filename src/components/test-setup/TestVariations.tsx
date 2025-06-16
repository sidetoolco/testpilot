import { useState } from 'react';
import { Package, Search } from 'lucide-react';
import { Product } from '../../types';
import { useProducts } from '../../features/tests/hooks/useProducts';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import ProductModal from '../../features/products/components/ProductModal';
import { useProductStore } from '../../store/useProductStore';

interface TestVariationsProps {
  variations: {
    a: any;
    b: any;
    c: any;
  };
  onChange: (variations: any) => void;
  onNext: () => void;
  onBack: () => void;
}

type Variations = 'a' | 'b' | 'c';

export default function TestVariations({ variations, onChange }: TestVariationsProps) {
  const [showProductSelector, setShowProductSelector] = useState<Variations | null>(null);
  const [showProductForm, setShowProductForm] = useState<Variations | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { products, loading, error } = useProducts();
  const { addProduct, updateProduct } = useProductStore();

  const handleSelectProduct = (variation: Variations, product: Product) => {
    onChange({
      ...variations,
      [variation]: {
        ...product,
        isExisting: true,
      },
    });
    setShowProductSelector(null);
  };

  const handleDuplicateProduct = (variation: Variations, product: Product) => {
    const duplicatedProduct = {
      ...product,
      id: undefined,
      title: `${product.title} (Copy)`,
    };
    
    onChange({
      ...variations,
      [variation]: {
        ...duplicatedProduct,
        isExisting: false,
      },
    });
    
    setShowProductSelector(null);
    setShowProductForm(variation);
  };

  const handleRemoveProduct = (key: Variations) => {
    onChange({
      ...variations,
      [key]: null,
    });
  };

  const handleProductSubmit = async (
    variation: Variations,
    productData: Omit<Product, 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    let idProduct: any;
    try {
      if (productData.id) {
        await updateProduct(productData.id, productData);
      } else {
        idProduct = await addProduct(productData);
      }
    } catch (err) {
      console.error('Failed to save product:', err);
    }
    onChange({
      ...variations,
      [variation]: {
        ...productData,
        id: idProduct,
        isExisting: false,
      },
    });
    setShowProductForm(null);
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderVariation = (key: Variations) => {
    const isRequired = key === 'a';
    const variation = variations[key];

    if (!variation) {
      return (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium">
              Variant {key.toUpperCase()}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </h4>
          </div>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <button
              onClick={() => setShowProductForm(key)}
              className="w-full py-4 px-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-400 hover:text-primary-400 transition-colors cursor-pointer"
            >
              Create New Product
            </button>
            <div className="relative w-full text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative">
                <span className="px-2 bg-white text-sm text-gray-500">or</span>
              </div>
            </div>
            <button
              onClick={() => setShowProductSelector(key)}
              disabled={products.length === 0}
              className={`flex items-center justify-center space-x-2 ${
                products.length === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-primary-400 hover:text-primary-500'
              }`}
            >
              <Package className="h-4 w-4" />
              <span>Select Existing Product</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium">
            Variant {key.toUpperCase()}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </h4>
          {!variation.isExisting && (
            <button
              onClick={() => setShowProductSelector(key)}
              className="flex items-center space-x-2 text-primary-400 hover:text-primary-500"
            >
              <Package className="h-4 w-4" />
              <span>Select Existing Product</span>
            </button>
          )}
        </div>
        <div className="flex items-start space-x-4">
          <div className="w-24 h-24 flex-shrink-0">
            <img
              src={variation.image_url}
              alt={variation.title}
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div>
            <h5 className="font-medium text-gray-900">{variation.title}</h5>
            <p className="text-sm text-gray-500 mt-1">US${variation.price.toFixed(2)}</p>
            {variation.isExisting ? (
              <>
                <span className="inline-block mt-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Existing Product
                </span>
                <button
                  onClick={() => handleRemoveProduct(key)}
                  className="text-red-500 hover:text-red-600 text-xs mt-2 ml-2"
                >
                  Remove Product
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowProductForm(key)}
                  className="text-primary-400 hover:text-primary-500 text-sm mt-2"
                >
                  Edit Product
                </button>
                <span className="text-sm mt-2 text-gray-500">&nbsp;|&nbsp;</span>
                <button
                  onClick={() => handleRemoveProduct(key)}
                  className="text-red-500 hover:text-red-600 text-sm mt-2"
                >
                  Remove Product
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-semibold text-gray-900 mb-3">Create Product Variants</h3>
        <p className="text-lg text-gray-500">
          Set up to three variants (A/B/C) of your product to test different versions. Variant A is
          required.
        </p>
      </div>

      <div className="space-y-6">
        {renderVariation('a')}
        {renderVariation('b')}
        {renderVariation('c')}
      </div>

      {showProductSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-8 flex-1">
                <h3 className="text-lg font-medium whitespace-nowrap">Select Existing Product</h3>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by product name..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E] transition-all"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowProductSelector(null)}
                className="text-gray-500 hover:text-gray-700 ml-4"
              >
                ×
              </button>
            </div>

            {loading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}

            {!loading && !error && (
              <>
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery
                      ? 'No products found matching your search.'
                      : 'No products available.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                    {filteredProducts.map(product => (
                      <div
                        key={product.id}
                        className="border rounded-xl p-4 hover:border-primary-400 transition-colors flex flex-col"
                      >
                        <div className="aspect-square mb-3">
                          <img
                            src={product.image_url}
                            alt={product.title}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{product.title}</h4>
                          <p className="text-sm text-gray-500 mb-3">${product.price.toFixed(2)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSelectProduct(showProductSelector, product)}
                            className="flex-1 px-3 py-1.5 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors"
                          >
                            Select
                          </button>
                          <button
                            onClick={() => handleDuplicateProduct(showProductSelector, product)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Duplicate
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {showProductForm && (
        <ProductModal
          isOpen={showProductForm ? true : false}
          onClose={() => setShowProductForm(null)}
          onSubmit={data => handleProductSubmit(showProductForm, data)}
          initialData={showProductForm ? variations[showProductForm] : undefined}
        />
      )}
    </div>
  );
}
