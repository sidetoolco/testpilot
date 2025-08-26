import { Star, ShoppingCart } from 'lucide-react';
import { useEffect } from 'react';
import { useSessionStore } from '../../store/useSessionStore';
import { recordTimeSpent } from '../../features/tests/services/testersSessionService';
import { Link } from 'react-router-dom';
import { trackEvent } from '../../lib/events';

interface AmazonProductCardProps {
  product: any;
  onAddToCart: (product: any) => void;
  variantType: string;
  testId: string;
}

export default function AmazonProductCard({
  product,
  onAddToCart: handleAddToCart,
  testId,
  variantType,
}: AmazonProductCardProps) {
  const { shopperId } = useSessionStore();

  const { id, image_url, image, title, name, rating, reviews_count, price, images } = product;

  useEffect(() => {
    const startTime = Date.now(); // Captura el tiempo de entrada

    return () => {
      const endTime = Date.now(); // Captura el tiempo de salida
      const timeSpent = endTime - startTime; // Calcula el tiempo transcurrido
      // Aquí puedes enviar el tiempo a un servidor o almacenarlo en algún lugar
      if (shopperId && product.id && timeSpent > 0) {
        console.log(`Tiempo gastado en el producto: ${timeSpent / 1000} segundos`);
        if (product.asin) {
          recordTimeSpent(shopperId, product.id, startTime, endTime, true);
        } else {
          recordTimeSpent(shopperId, product.id, startTime, endTime);
        }
      }
    };
  }, [product]);

  return (
    <Link
      to={`/product/${id}?test=${testId}&variant=${variantType}`}
      state={{ product: { ...product, images } }}
      onClick={() =>
        trackEvent(
          'click',
          {
            test_id: testId,
            variation_type: variantType,
            product_id: id,
          },
          location.pathname
        )
      }
      className="h-full flex"
    >
      <div className="relative flex flex-col w-full p-4 hover:outline hover:outline-[#007185] hover:outline-[1px] rounded cursor-pointer">
        <div className="relative pt-[100%] mb-3">
          <img
            src={image_url || image}
            alt={title || name}
            className="absolute top-0 left-0 w-full h-full object-contain hover:scale-105 transition-transform duration-200"
          />
        </div>

        <div className="flex-grow flex flex-col">
          <h3 className="text-[13px] leading-[19px] text-[#0F1111] font-medium mb-1 hover:text-[#C7511F] line-clamp-2">
            {title || name}
          </h3>

          <div className="flex items-center mb-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => {
                const validRating = typeof rating === 'number' && Number.isFinite(rating) ? Math.max(0, Math.min(5, rating)) : 0;
                const fullStars = Math.floor(validRating);
                const hasHalfStar = validRating % 1 >= 0.5;
                const isFullStar = i < fullStars;
                const isHalfStar = i === fullStars && hasHalfStar;
                return (
                  <Star
                    key={`${id}-star-${i}`}
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
              {typeof reviews_count === 'number' && Number.isFinite(reviews_count) ? reviews_count.toLocaleString() : '0'}
            </span>
          </div>

          <div className="flex items-baseline gap-[2px] text-[#0F1111]">
            <span className="text-xs align-top mt-[1px]">US$</span>
            {(() => {
              const normalizedPrice = typeof price === 'number' && Number.isFinite(price) ? price : 0;
              const major = Math.floor(normalizedPrice);
              const minor = (normalizedPrice % 1).toFixed(2).substring(1);
              return (
                <>
                  <span className="text-[21px] font-medium">{major}</span>
                  <span className="text-[13px]">{minor}</span>
                </>
              );
            })()}
          </div>

          <div className="mt-1 flex items-center gap-1">
            <img src="/assets/images/amazon-prime-icon.png" alt="Prime" className="h-12" />
            <div>
              <span className="text-[12px] text-[#007185]">FREE delivery</span>
              <span className="text-[12px] text-[#0F1111] ml-1">Tomorrow</span>
            </div>
          </div>
        </div>

        <button
          className="mt-4 w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] py-2 rounded-full border border-[#FCD200] font-medium flex items-center justify-center space-x-2"
          onClick={() => handleAddToCart(product)}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Add to Cart</span>
        </button>
      </div>
    </Link>
  );
}
