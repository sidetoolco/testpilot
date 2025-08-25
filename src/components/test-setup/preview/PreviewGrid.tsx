import { Star, ShoppingCart } from 'lucide-react';
import { AmazonProduct } from '../../../features/amazon/types';
import { WalmartProduct } from '../../../features/walmart/services/walmartService';
import { useNavigate } from 'react-router-dom';

interface PreviewGridProps {
  products: (AmazonProduct | WalmartProduct)[];
  variations?: {
    a: any | null;
    b: any | null;
    c: any | null;
  };
  onProductClick?: (product: AmazonProduct | WalmartProduct) => void;
}

export default function PreviewGrid({ products, variations, onProductClick }: PreviewGridProps) {
  const handleClick = (product: AmazonProduct | WalmartProduct) => {
    console.log('Product clicked:', product);
    if (onProductClick) {
      onProductClick(product);
    } else {
      const identifier = 'asin' in product ? (product.id || product.asin) : product.id;
      console.log('Product identifier:', identifier);
      sessionStorage.setItem('previewProduct', JSON.stringify(product));
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(product => (
        <div
          key={'asin' in product ? (product.id || product.asin) : product.id}
          className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer flex flex-col"
          onClick={() => handleClick(product)}
        >
          <div className="flex flex-col flex-grow">
            <div className="relative">
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-48 object-contain mb-4"
              />
            </div>
            <h3 className="text-sm font-medium text-[#0F1111] mb-2 line-clamp-2">
              {product.title}
            </h3>
            <div className="flex items-center mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => {
                  const fullStars = Math.round(product.rating || 5);
                  const isFullStar = i < fullStars;
                  const isHalfStar = !isFullStar && i < product.rating;
                  return (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        isFullStar
                          ? 'text-[#dd8433] fill-[#dd8433]'
                          : isHalfStar
                            ? 'text-[#dd8433] fill-current'
                            : 'text-gray-200 fill-gray-200'
                      }`}
                      style={{
                        clipPath: isHalfStar ? 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' : 'none',
                      }}
                    />
                  );
                })}
              </div>
              <span className="ml-1 text-[12px] text-[#007185] hover:text-[#C7511F] hover:underline">
                {product.reviews_count?.toLocaleString()}
              </span>
            </div>
            <div className="flex items-baseline gap-[2px] text-[#0F1111]">
              <span className="text-xs align-top mt-[1px]">US$</span>
              <span className="text-[21px] font-medium">{Math.floor(product.price)}</span>
              <span className="text-[13px]">{(product.price % 1).toFixed(2).substring(1)}</span>
            </div>
            <div className="mt-1 flex items-center gap-1">
              <img src="/assets/images/amazon-prime-icon.png" alt="Prime" className="h-12" />
              <div>
                <span className="text-[12px] text-[#007185]">FREE delivery</span>
                <span className="text-[12px] text-[#0F1111] ml-1">Tomorrow</span>
              </div>
            </div>
          </div>
          <button className="w-full mt-auto flex items-center justify-center gap-2 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-lg py-1 text-sm">
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}
