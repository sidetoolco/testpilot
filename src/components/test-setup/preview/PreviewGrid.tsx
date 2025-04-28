import { Star, ShoppingCart } from 'lucide-react';
import { AmazonProduct } from '../../../features/amazon/types';

interface PreviewGridProps {
  products: AmazonProduct[];
  variations?: {
    a: AmazonProduct | null;
    b: AmazonProduct | null;
    c: AmazonProduct | null;
  };
}

export default function PreviewGrid({ products, variations }: PreviewGridProps) {
  const getVariationLabel = (product: AmazonProduct) => {
    if (!variations) return null;
    if (variations.a?.id === product.id) return 'Variation A';
    if (variations.b?.id === product.id) return 'Variation B';
    if (variations.c?.id === product.id) return 'Variation C';
    return null;
  };

  return (
    <div className="bg-white p-4 rounded-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const variationLabel = getVariationLabel(product);

          return (
            <div
              key={product.id}
              className="relative flex flex-col justify-between p-4 hover:outline hover:outline-[#007185] hover:outline-[1px] rounded cursor-pointer"
            >
              {variationLabel && (
                <div className="absolute top-2 left-2 z-10 bg-[#00A67E] text-white text-xs px-2 py-1 rounded-sm">
                  {variationLabel}
                </div>
              )}

              <div className="relative pt-[100%] mb-3">
                <img
                  src={product.image_url ? product.image_url : product.image}
                  alt={product.title ? product.title : product.name}
                  className="absolute top-0 left-0 w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                />
              </div>

              <h3 className="text-[13px] leading-[19px] text-[#0F1111] font-medium mb-1 hover:text-[#C7511F] line-clamp-2">
                {product.title ? product.title : product.name}
              </h3>

              <div className="flex items-center mb-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => {
                    const isFullStar = i < Math.floor(product.rating || 5);
                    const isHalfStar = !isFullStar && i < product.rating;
                    return (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${isFullStar
                          ? 'text-[#dd8433] fill-[#dd8433]'
                          : isHalfStar
                            ? 'text-[#dd8433] fill-current'
                            : 'text-gray-200 fill-gray-200'
                          }`}
                        style={{
                          clipPath: isHalfStar ? 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' : 'none'
                        }}
                      />
                    );
                  })}
                </div>
                <span className="ml-1 text-[12px] text-[#007185] hover:text-[#C7511F] hover:underline">
                  {product.reviews_count ? product.reviews_count?.toLocaleString() : product.reviewCount?.toLocaleString()}
                </span>
              </div>

              <div className="flex items-baseline gap-[2px] text-[#0F1111]">
                <span className="text-xs align-top mt-[1px]">US$</span>
                <span className="text-[21px] font-medium">{Math.floor(product.price)}</span>
                <span className="text-[13px]">
                  {(product.price % 1).toFixed(2).substring(1)}
                </span>
              </div>

              <div className="mt-1 flex items-center gap-1">
                <img
                  src="/assets/images/amazon-prime-icon.png"
                  alt="Prime"
                  className="h-12"
                />
                <div>
                  <span className="text-[12px] text-[#007185]">FREE delivery</span>
                  <span className="text-[12px] text-[#0F1111] ml-1">Tomorrow</span>
                </div>
              </div>

              <button className="mt-4 w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] py-2 rounded-full border border-[#FCD200] font-medium flex items-center justify-center space-x-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Add to Cart</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}