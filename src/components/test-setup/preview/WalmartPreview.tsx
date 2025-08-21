import React, { useState } from 'react';
import { Search, Star, ShoppingCart, Menu, MapPin, User } from 'lucide-react';
import { AmazonProduct } from '../../../features/amazon/types';
import WalmartProductDetail from '../../walmart/WalmartProductDetail';
import { supabase } from '../../../lib/supabase';

interface ProductDetails {
  images: string[];
  feature_bullets: string[];
}

interface WalmartPreviewProps {
  searchTerm: string;
  products: AmazonProduct[];
}

export default function WalmartPreview({ searchTerm, products }: WalmartPreviewProps) {
  const [selectedProduct, setSelectedProduct] = useState<AmazonProduct | null>(null);
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleProductClick = async (product: AmazonProduct) => {
    setIsLoading(true);
    try {
      // If the product doesn't have ASIN or it's empty, use its data directly
      if (!product.asin || product.asin.trim() === '') {
        setProductDetails({
          images: (product as any).images || [product.image_url],
          feature_bullets: (product as any).bullet_points || (product as any).feature_bullets || [],
        });
        setSelectedProduct(product);
        setIsLoading(false);
        return;
      }

      // If it has ASIN, search in the database
      const { data, error } = await supabase
        .from('amazon_products')
        .select('*')
        .eq('asin', product.asin as any)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching product details:', error);
        // If there's an error, use the product data
        setProductDetails({
          images: (product as any).images || [product.image_url],
          feature_bullets: (product as any).bullet_points || (product as any).feature_bullets || [],
        });
      } else if (data) {
        setProductDetails({
          images: (data as any).images || (product as any).images || [product.image_url],
          feature_bullets: (data as any).bullet_points || (product as any).bullet_points || (product as any).feature_bullets || [],
        });
      }
      setSelectedProduct(product);
    } catch (error) {
      console.error('Error fetching product details:', error);
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

      {/* Results Count */}
      <div className="bg-white p-4 mb-4 rounded-sm">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-[#565959]">{products.length} results for</span>
          <span className="text-sm font-bold text-[#0F1111]">"{searchTerm}"</span>
        </div>
      </div>

      {/* Product Grid */}
      <div className="bg-white p-4 rounded-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div key={`walmart-preview-product-${product.id || index}`} className="bg-white p-4 w-full flex flex-col relative cursor-pointer" onClick={() => handleProductClick(product)}>
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
                  <div className="flex items-center">
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
          ))}
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0071dc]"></div>
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
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              onClick={handleCloseModal}
            >
              ✕
            </button>
            
            <WalmartProductDetail
              product={{
                ...selectedProduct,
                images: productDetails?.images || [selectedProduct.image_url],
                bullet_points: productDetails?.feature_bullets || [],
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
