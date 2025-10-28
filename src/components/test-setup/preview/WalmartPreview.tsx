import React, { useState, useEffect } from 'react';
import { Search, Star, ShoppingCart, Menu, MapPin, User, Save } from 'lucide-react';
import { WalmartProduct } from '../../../features/walmart/services/walmartService';
import WalmartProductDetail from '../../walmart/WalmartProductDetail';
import { walmartService, WalmartProductDetail as WalmartProductDetailType } from '../../../features/walmart/services/walmartService';
import { walmartProductService } from '../../../features/walmart/services/walmartProductService';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

interface ProductDetails {
  images: string[];
  feature_bullets: string[];
}

interface WalmartPreviewProps {
  searchTerm: string;
  products: WalmartProduct[];
  competitorIndices?: number[]; // Array of indices that are competitors
}

export default function WalmartPreview({ searchTerm, products, competitorIndices = [] }: WalmartPreviewProps) {
  const [selectedProduct, setSelectedProduct] = useState<WalmartProduct | null>(null);
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // State for full product details for each product
  const [fullProductDetails, setFullProductDetails] = useState<Record<string, WalmartProductDetailType>>({});
  
  // Randomize product positions once on mount
  const [shuffledProducts, setShuffledProducts] = useState<WalmartProduct[]>([]);
  const [shuffledCompetitorIndices, setShuffledCompetitorIndices] = useState<number[]>([]);

  // Shuffle products on mount
  useEffect(() => {
    if (products.length === 0) return;

    const ownProductIndex = 0;
    const randomPosition = Math.floor(Math.random() * products.length);
    
    const newProducts = [...products];
    const newCompetitorIndices = [...competitorIndices];
    
    if (randomPosition !== ownProductIndex) {
      [newProducts[ownProductIndex], newProducts[randomPosition]] = [newProducts[randomPosition], newProducts[ownProductIndex]];
      
      const updatedCompetitorIndices = newCompetitorIndices.map(index => {
        if (index === randomPosition) return ownProductIndex;
        if (index === ownProductIndex) return randomPosition;
        return index;
      });
      
      setShuffledProducts(newProducts);
      setShuffledCompetitorIndices(updatedCompetitorIndices);
    } else {
      setShuffledProducts(newProducts);
      setShuffledCompetitorIndices(newCompetitorIndices);
    }
  }, [products, competitorIndices]);

  // Fetch full details for all products when component mounts
  useEffect(() => {
    const fetchAllProductDetails = async () => {
      const details: Record<string, WalmartProductDetailType> = {};
      
      for (const product of products) {
        if (product.walmart_id) {
          try {
            const productDetail = await walmartService.getProductDetails(product.walmart_id);
            if (product.id) {
              details[product.id] = productDetail;
            }
          } catch (error) {
            console.warn(`Failed to fetch details for product ${product.walmart_id}:`, error);
          }
        }
      }
      
      setFullProductDetails(details);
    };

    if (products.length > 0) {
      fetchAllProductDetails();
    }
  }, [products]);

  const handleProductClick = async (product: WalmartProduct, index: number) => {
    // Check if this product is a competitor
    if (shuffledCompetitorIndices.includes(index)) {
      return; // Don't allow clicking on competitors
    }

    setIsLoading(true);
    try {
      // Set product details from the Walmart product data
      setProductDetails({
        images: (product as any).images || [product.image_url],
        feature_bullets: (product as any).bullet_points || (product as any).feature_bullets || [],
      });

      setSelectedProduct(product);
    } catch (error) {
      // In case of error, use the product data
      setProductDetails({
        images: (product as any).images || [product.image_url],
        feature_bullets: (product as any).bullet_points || (product as any).feature_bullets || [],
      });
      setSelectedProduct(product);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setProductDetails(null);
  };

  const handleSaveDraft = async () => {
    if (products.length === 0) {
      toast.error('No products to save');
      return;
    }

    setIsSaving(true);
    try {
      // Get the current user's company ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Not authenticated');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.company_id) {
        toast.error('Company profile not found');
        return;
      }

      // Step 1: Save basic product info to database
      await walmartProductService.cacheProducts(products, profile.company_id);
      
      // Step 2: Fetch and save rich product details
      await walmartProductService.fetchAndSaveRichDetails(products);
      
      // Note: Backend API call removed to avoid duplicate key constraint errors
      // The cacheProducts function already handles database saves with proper upsert logic
      
      toast.success(`Successfully saved ${products.length} Walmart products with rich details`);
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  if (shuffledProducts.length === 0) return null;

  return (
    <>
      {/* Walmart Header */}
      <header className="bg-[#0071dc] text-white p-2 md:p-3 ">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button className="md:hidden" disabled>
              <Menu size={28} />
            </button>
            <img 
              src="/assets/images/walmart-icon.svg" 
              alt="Walmart Logo" 
              className="h-8 md:h-9" 
            />
          </div>
          
          <div className="hidden md:flex items-center gap-2 bg-[#005cb4] p-2 rounded-full cursor-default">
            <MapPin size={20} />
            <div>
              <p className="text-xs font-bold">Pickup or delivery?</p>
              <p className="text-xs">Sacramento, 95829 • Sacramento Supe...</p>
            </div>
          </div>
          
          <div className="flex-grow mx-2 md:mx-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder={`Searching for "${searchTerm}"...`}
                className="w-full p-2 pl-4 pr-12 rounded-full text-black text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" 
                readOnly
              />
              <button className="absolute right-0 top-0 h-full px-4 bg-yellow-400 rounded-full flex items-center justify-center cursor-default" disabled>
                <Search size={20} className="text-black" />
              </button>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center text-xs cursor-default">
              <span className="text-2xl">❤️</span>
              <p>My Items</p>
            </div>
            <div className="text-center text-xs cursor-default">
              <User size={24} className="mx-auto" />
              <p>Sign In</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center cursor-default">
            <ShoppingCart size={28} />
            <span className="text-xs font-bold">$0.00</span>
          </div>
        </div>
      </header>

      {/* Secondary Navigation */}
      <nav className="bg-[#C9DCFD] shadow-sm  border-b  border-gray-200 block relative z-30 p-1">
        <div className="max-w-full px-4 flex  items-center justify-center gap-6 overflow-x-auto scrollbar-hide">
          <a href="#" className="flex items-center gap-1 text-sm font-bold text-gray-800 whitespace-nowrap bg-white px-3 py-1 rounded-full shadow-sm cursor-default pointer-events-none">
            <Menu size={16}/><span>Departments</span>
          </a>
          <a href="#" className="text-sm font-bold text-gray-800 whitespace-nowrap bg-white px-3 py-1 rounded-full shadow-sm cursor-default pointer-events-none">
            Services
          </a>
          <a href="#" className="text-sm text-yellow-600 whitespace-nowrap font-medium flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm cursor-default pointer-events-none">
            ⚡ Get it Fast
          </a>
          <a href="#" className="text-sm text-gray-800 whitespace-nowrap bg-white px-3 py-1 rounded-full shadow-sm cursor-default pointer-events-none">
            🆕 New Arrivals
          </a>
          <a href="#" className="text-sm text-gray-800 whitespace-nowrap bg-white px-3 py-1 rounded-full shadow-sm cursor-default pointer-events-none">
            🎒 Back to School
          </a>
          <a href="#" className="text-sm text-gray-800 whitespace-nowrap bg-white px-3 py-1 rounded-full shadow-sm cursor-default pointer-events-none">
            🍽️ Dinner Made Easy
          </a>
        </div>
      </nav>

      {/* Results Count and Save Draft Button */}
      <div className="bg-white p-4  rounded-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-[#565959]">{shuffledProducts.length} results for</span>
            <span className="text-sm font-bold text-[#0F1111]">"{searchTerm}"</span>
          </div>
          
          
        </div>
      </div>

      {/* Product Grid */}
      <div className="bg-white p-4 rounded-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {shuffledProducts.map((product, index) => {
            const isCompetitor = shuffledCompetitorIndices.includes(index);
            return (
              <div 
                key={`walmart-preview-product-${product.id || index}`} 
                className={`bg-white p-4 w-full flex flex-col relative ${
                  isCompetitor ? 'cursor-not-allowed' : 'cursor-pointer'
                }`} 
                onClick={() => handleProductClick(product, index)}
              >
              {/* Add Button Overlay - Above the image */}
              <div className="h-48 mb-4 flex items-center justify-center relative">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="max-h-full max-w-full object-contain"
                />
                
                
                <button 
                  className="absolute bottom-2 left-2 bg-[#0071dc] text-white font-bold py-2 px-3 rounded-full flex items-center justify-center gap-1 text-sm shadow-lg cursor-default"
                  disabled
                >
                  <span className="text-lg font-light">+</span> Add
                </button>
              </div>
              
              <div className="flex-grow flex flex-col">
                {/* Price - At the top */}
                <div className="flex items-baseline gap-[2px] text-[#0F1111] mb-2">
                  <span className="text-xs align-top mt-[1px]">US$</span>
                  <span className="text-[21px] font-medium">{product.price ? Math.floor(product.price) : 'N/A'}</span>
                  <span className="text-[13px]">{product.price && product.price % 1 !== 0 ? (product.price % 1).toFixed(2).substring(1) : '.00'}</span>
                </div>

                {/* Product Name - In the middle */}
                <h3 className="text-[13px] leading-[19px] text-[#0F1111] font-medium mb-2 hover:text-[#0071dc] line-clamp-2 cursor-pointer">
                  {product.title}
                </h3>

                {/* Rating and Reviews - At the bottom */}
                {product.rating && (
                  <div className="flex items-center mt-auto">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => {
                        const fullStars = Math.round(product.rating || 5);
                        const isFullStar = i < fullStars;
                        const isHalfStar = !isFullStar && i < product.rating;
                        return (
                          <Star
                            key={`${product.id}-star-${i}`}
                            className={`h-4 w-4 ${
                              isFullStar
                                ? 'text-yellow-400 fill-current'
                                : isHalfStar
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-200 fill-gray-200'
                            }`}
                            style={{
                              clipPath: isHalfStar ? 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' : 'none',
                            }}
                          />
                        );
                      })}
                    </div>
                    {product.reviews_count && (
                      <span className="ml-1 text-[12px] text-[#0071dc] hover:text-[#005cb4] hover:underline">
                        {product.reviews_count.toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-12 w-8 border-b-2 border-[#0071dc]"></div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white w-full max-w-7xl max-h-[95vh] overflow-y-auto relative rounded-md"
            onClick={(e) => e.stopPropagation()}
          >


            <WalmartProductDetail
              product={{
                ...selectedProduct,
                images: productDetails?.images || [selectedProduct.image_url],
                bullet_points: productDetails?.feature_bullets || [],
                // Pass the full product details if available
                ...(selectedProduct.id && fullProductDetails[selectedProduct.id] ? fullProductDetails[selectedProduct.id] : {})
              }}
              onBack={handleCloseModal}
              onAddToCart={() => {
                // Mock add to cart for preview
                console.log('Product added to cart in preview');
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
