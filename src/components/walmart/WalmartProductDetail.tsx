import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Star, CheckCircle, Truck, MapPin, Building, Loader2 } from 'lucide-react';
import { walmartService, WalmartProductDetail as WalmartProductDetailType } from '../../features/walmart/services/walmartService';
import { supabase } from '../../lib/supabase';
import { useSessionStore } from '../../store/useSessionStore';
import { recordTimeSpent } from '../../features/tests/services/testersSessionService';

// Utility function to safely render HTML content
const renderHtmlSafely = (html: string): string => {
  if (!html) return '';
  // Remove script tags and event handlers for security
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s*on\w+\s*=\s*[^>\s]+/gi, '');
};

interface WalmartProductDetailProps {
  product: any;
  onBack: () => void;
  onAddToCart: (product: any) => void;
}

export default function WalmartProductDetail({
  product,
  onBack,
  onAddToCart,
}: WalmartProductDetailProps) {
  const { shopperId } = useSessionStore();
  const [mainImage, setMainImage] = useState(product.image_url || product.image);
  
  // State for full product details
  const [fullProductDetails, setFullProductDetails] = useState<WalmartProductDetailType | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showTesterInfo, setShowTesterInfo] = useState(false);
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, boolean>>({});
  
  // Memoize thumbnails to prevent unnecessary re-renders
  const thumbnails = useMemo(() => {
    
    // First try to get images from the detailed product data
    if (fullProductDetails?.variants && fullProductDetails.variants.length > 0) {
      const variantImages = fullProductDetails.variants
        .filter(variant => variant.images && variant.images.length > 0)
        .flatMap(variant => variant.images || []);
      
      if (variantImages.length > 0) {
        return variantImages;
      }
    }
    
    // Fallback to basic product images
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    
    // Final fallback to single image
    if (product.image_url) {
      return [product.image_url];
    }
    
    // If no images available, return empty array
    return [];
  }, [fullProductDetails, product.images, product.image_url]);

  // Set main image when thumbnails change
  useEffect(() => {
    if (thumbnails.length > 0 && !mainImage) {
      setMainImage(thumbnails[0]);
    }
  }, [thumbnails, mainImage]);

  // Optimized image loading with individual load states
  const handleImageLoad = (imageUrl: string) => {
    setImageLoadStates(prev => ({ ...prev, [imageUrl]: true }));
  };

  const handleImageError = (imageUrl: string) => {
    setImageLoadStates(prev => ({ ...prev, [imageUrl]: false }));
  };

  // Fetch full product details only when needed
  useEffect(() => {
    const fetchProductDetails = async () => {
      // Check if we have a database ID (UUID format) or a Walmart product ID
      const hasDatabaseId = product.id && product.id.length === 36; // UUIDs are 36 characters
      const hasWalmartId = product.walmart_id;
      
      if (!hasDatabaseId && !hasWalmartId) return; // Skip if no identifier available
      if (fullProductDetails) return; // Skip if already loaded
      
      setIsLoadingDetails(true);
      setShowTesterInfo(false);
      
      // Set timer to show tester info after 2 seconds
      const timer = setTimeout(() => {
        if (isLoadingDetails) {
          setShowTesterInfo(true);
        }
      }, 2000);
      
      try {
        let details;
        
        // Prioritize database data first (like Amazon does)
        if (hasDatabaseId) {
          try {
            // Try to get details from database first
            const { data: dbProduct, error: dbError } = await supabase
              .from('walmart_products')
              .select('*')
              .eq('id', product.id)
              .single();
            
            if (!dbError && dbProduct) {
              // Convert database product to WalmartProductDetail format
              details = {
                id: (dbProduct as any).id,
                product_name: (dbProduct as any).title || '',
                product_short_description: (dbProduct as any).product_short_description || (dbProduct as any).description || '',
                product_category: (dbProduct as any).product_category || '',
                brand: (dbProduct as any).brand || '',
                title: (dbProduct as any).title,
                price: (dbProduct as any).price,
                rating: (dbProduct as any).rating,
                reviews_count: (dbProduct as any).reviews_count,
                image_url: (dbProduct as any).image_url,
                product_url: (dbProduct as any).product_url,
                search_term: (dbProduct as any).search_term,
                seller: (dbProduct as any).seller,
                availability: (dbProduct as any).product_availability,
                created_at: (dbProduct as any).created_at,
                updated_at: (dbProduct as any).updated_at,
                description: (dbProduct as any).description,
                bullet_points: [],
                variants: []
              };
              
              if (details) {
                setFullProductDetails(details);
                setIsLoadingDetails(false);
                return; // Exit early - database data found
              }
            }
          } catch (error) {
            // Database fetch failed, trying Walmart API fallback
          }
        }
        
        // Fallback to Walmart API if database data not available
        if (hasWalmartId) {
          try {
            details = await walmartService.getFreshWalmartProductDetails(product.walmart_id);
            if (details) {
              setFullProductDetails(details);
            }
          } catch (error) {
            // Walmart API also failed
          }
        }
      } catch (error) {
        console.error('Failed to fetch product details:', error);
      } finally {
        setIsLoadingDetails(false);
        setShowTesterInfo(false);
        clearTimeout(timer);
      }
    };

    // OPTIMIZATION: Remove artificial delay - fetch immediately for faster loading
    fetchProductDetails();
  }, [product.id, product.walmart_id]);
  
  const handleAddToCart = () => {
    onAddToCart(product);
  };

  // Optimized description getter
  const productDescription = useMemo(() => {
    if (fullProductDetails?.product_short_description) {
      return fullProductDetails.product_short_description;
    }
    if (fullProductDetails?.variants && fullProductDetails.variants.length > 0) {
      const firstVariant = fullProductDetails.variants[0];
      return `${firstVariant.criteria}: ${firstVariant.name}`;
    }
    
    if (product.description) return product.description;
    if (product.product_description) return product.product_description;
    if (product.bullet_points && product.bullet_points.length > 0) {
      return product.bullet_points[0];
    }
    return null;
  }, [fullProductDetails, product]);

  // Time tracking effect - tracks how long user spends viewing this product
  useEffect(() => {
    const startTime = Date.now(); // Capture entry time

    return () => {
      const endTime = Date.now(); // Capture exit time
      const timeSpent = endTime - startTime; // Calculate time spent
      
              // Record time spent if we have valid data
        if (shopperId && product.id && timeSpent > 0) {
          console.log(`Time spent on product: ${timeSpent / 1000} seconds`);
          console.log(`Product ID: ${product.id}, Type: ${typeof product.id}`);
          // Record time spent in database for Walmart experience
          recordTimeSpent(shopperId, product.id, startTime, endTime, false, true);
        }
    };
  }, [shopperId, product.id]);

  return (
    <div className="container mx-auto p-4 md:p-8 bg-white">
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0071dc] mb-4"
      >
        <ArrowLeft size={16} /> Back to results
      </button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image Column */}
        <div className="lg:col-span-1 flex flex-col md:flex-row gap-4">
          {thumbnails.length > 0 ? (
            <>
              <div className="flex md:flex-col gap-2 order-2 md:order-1">
                {thumbnails.map((thumb: string, index: number) => (
                  <div 
                    key={`thumb-${thumb}-${index}`}
                    className="w-16 h-16 border rounded-md p-1 cursor-pointer hover:border-[#0071dc] relative" 
                    onClick={() => setMainImage(thumb)}
                  >
                    {!imageLoadStates[thumb] && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 size={16} className="animate-spin text-gray-400" />
                      </div>
                    )}
                    <img 
                      src={thumb} 
                      alt={`Thumbnail ${index + 1}`} 
                      className={`w-full h-full object-contain ${imageLoadStates[thumb] ? 'opacity-100' : 'opacity-0'}`}
                      onLoad={() => handleImageLoad(thumb)}
                      onError={() => handleImageError(thumb)}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
              <div className="flex-grow order-1 md:order-2 relative">
                {!imageLoadStates[mainImage] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <Loader2 size={32} className="animate-spin text-gray-400" />
                  </div>
                )}
                <img 
                  src={mainImage} 
                  alt={product.title || product.name} 
                  className={`w-full rounded-lg border transition-opacity duration-200 ${imageLoadStates[mainImage] ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => handleImageLoad(mainImage)}
                  onError={() => handleImageError(mainImage)}
                  loading="eager"
                />
              </div>
            </>
          ) : (
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📷</div>
                <div className="text-sm">No images available</div>
                <div className="text-xs mt-1">Product details may still load below</div>
              </div>
            </div>
          )}
        </div>

        {/* Information Column */}
        <div className="lg:col-span-1">
          <span className="text-xs font-bold bg-blue-100 text-[#0071dc] px-2 py-1 rounded-full">
            Popular choice
          </span>
          <h1 className="text-2xl font-bold mt-2">
            {product.title || product.name}
          </h1>
          
          {/* Tester Info Box - Shows when loading takes more than 2 seconds */}
          {showTesterInfo && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 text-xs font-medium">
                💡 For Testers
              </p>
              <p className="text-blue-700 text-xs mt-1">
                During the actual test, the testers will see all product information instantly without any loading delays.
              </p>
            </div>
          )}
          
          {/* Rating and Reviews */}
          {product.rating && (
            <div className="flex items-center mt-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={`star-${i}`}
                  size={16} 
                  className={i < Math.round(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                />
              ))}
              <span className="text-sm text-gray-600 ml-2">
                {product.rating.toFixed(1)}
              </span>
              {product.reviews_count && (
                <span className="text-sm text-gray-500 ml-1">
                  ({product.reviews_count} reviews)
                </span>
              )}
            </div>
          )}
          
          {/* Product Description with Loading State */}
          <div className="mt-4">
            {isLoadingDetails && !productDescription ? (
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-gray-400" />
                <span className="text-gray-500">Loading description...</span>
              </div>
            ) : productDescription ? (
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderHtmlSafely(productDescription) }}
              />
            ) : (
              <p className="text-gray-500">Description not available</p>
            )}
          </div>
          
          {/* Brand Information with Loading State */}
          <div className="mt-4">
            {isLoadingDetails ? (
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-gray-400" />
                <span className="text-gray-500">Loading brand info...</span>
              </div>
            ) : fullProductDetails?.brand ? (
              <>
                <h3 className="font-bold text-sm mb-1">Brand:</h3>
                <p className="text-gray-600">{fullProductDetails.brand}</p>
              </>
            ) : null}
          </div>
          
          {/* Product Category with Loading State */}
          <div className="mt-4">
            {isLoadingDetails ? (
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-gray-400" />
                <span className="text-gray-500">Loading category...</span>
              </div>
            ) : fullProductDetails?.product_category ? (
              <>
                <h3 className="font-bold text-sm mb-1">Category:</h3>
                <p className="text-gray-600">{fullProductDetails.product_category}</p>
              </>
            ) : null}
          </div>
          
          {/* Variants Information with Loading State */}
          <div className="mt-4">
            {isLoadingDetails ? (
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-gray-400" />
                <span className="text-gray-500">Loading variants...</span>
              </div>
            ) : fullProductDetails?.variants && fullProductDetails.variants.length > 0 ? (
              <>
                <h3 className="font-bold text-sm mb-2">Available Variants:</h3>
                <div className="space-y-2">
                  {fullProductDetails.variants.slice(0, 5).map((variant, index) => (
                    <div key={`variant-${variant.criteria}-${index}`} className="text-sm p-2 bg-gray-50 rounded">
                      <div className="font-medium">{variant.criteria}: {variant.name}</div>
                      <div className="text-gray-600">${variant.price} {variant.price_currency}</div>
                      <div className="text-xs text-gray-500">Status: {variant.availability_status}</div>
                    </div>
                  ))}
                  {fullProductDetails.variants.length > 5 && (
                    <div className="text-xs text-gray-500">
                      +{fullProductDetails.variants.length - 5} more variants available
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
          
          {/* Product Details */}
          <div className="mt-6">
            <h2 className="font-bold text-lg mb-2">About this item</h2>
            {product.bullet_points && product.bullet_points.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {product.bullet_points.map((detail: string, i: number) => (
                  <li key={`bullet-${i}`}>{detail}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Details not available</p>
            )}
          </div>
          
          {/* Size/Weight if available */}
          {product.size && (
            <div className="mt-4">
              <h3 className="font-bold text-sm mb-1">Size/Weight:</h3>
              <p className="text-gray-600">{product.size}</p>
            </div>
          )}
        </div>

        {/* Purchase Column */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                ${product.price?.toFixed(2) || '0.00'}
              </span>
              <span className="text-gray-500 text-sm">/each</span>
            </div>
            
            <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
              <CheckCircle size={16}/> FREE shipping with 30-day trial
            </p>
            
            <button 
              onClick={handleAddToCart}
              className="w-full bg-[#0071dc] text-white font-bold py-3 rounded-full mt-4 hover:bg-[#005cb4] transition-colors"
            >
              Add to cart
            </button>
            
            <div className="mt-4 space-y-3">
              <div className="border rounded-md p-3 flex justify-between items-center">
                <label htmlFor="subscribe" className="flex flex-col">
                  <span className="font-bold">Subscribe</span>
                  <span className="text-sm text-green-600">Save and get it today</span>
                </label>
                <input type="radio" name="purchaseType" id="subscribe" />
              </div>
              <div className="border-2 border-[#0071dc] rounded-md p-3 flex justify-between items-center bg-blue-50">
                <label htmlFor="onetime" className="font-bold">One-time purchase</label>
                <input type="radio" name="purchaseType" id="onetime" defaultChecked />
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-bold mb-2">How you'll get it:</h3>
              <div className="flex justify-around text-center">
                <div className="p-2 border-b-4 border-[#0071dc]">
                  <Truck size={24} className="mx-auto text-[#0071dc]" />
                  <p className="text-sm font-bold text-[#0071dc]">Shipping</p>
                  <p className="text-xs">Starting tomorrow</p>
                </div>
                <div className="p-2">
                  <MapPin size={24} className="mx-auto" />
                  <p className="text-sm font-bold">Pickup</p>
                  <p className="text-xs">Not available</p>
                </div>
                <div className="p-2">
                  <Building size={24} className="mx-auto" />
                  <p className="text-sm font-bold">Delivery</p>
                  <p className="text-xs">Starting 7pm</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
