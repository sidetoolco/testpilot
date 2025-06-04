import { Star, ShoppingCart } from 'lucide-react';
import { AmazonProduct } from '../../../features/amazon/types';
import { useNavigate } from 'react-router-dom';

interface PreviewGridProps {
  products: AmazonProduct[];
  variations?: {
    a: AmazonProduct | null;
    b: AmazonProduct | null;
    c: AmazonProduct | null;
  };
}

export default function PreviewGrid({ products, variations }: PreviewGridProps) {
  const navigate = useNavigate();

  const handleClick = (product: AmazonProduct) => {
    console.log('Product clicked:', product);
    const identifier = product.id || product.asin;
    console.log('Product identifier:', identifier);
    
    // Primero guardamos el producto en sessionStorage
    sessionStorage.setItem('previewProduct', JSON.stringify(product));
    
    // Luego abrimos la nueva pestaña
    const newWindow = window.open('/preview-product', '_blank');
    
   
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <div
          key={product.id || product.asin}
          className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
          onClick={() => handleClick(product)}
        >
          <div className="relative">
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-48 object-contain mb-4"
            />
          </div>
          <h3 className="text-sm font-medium text-[#0F1111] mb-2 line-clamp-2">{product.title}</h3>
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
          <button className="w-full mt-2 flex items-center justify-center gap-2 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-lg py-1 text-sm">
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}
