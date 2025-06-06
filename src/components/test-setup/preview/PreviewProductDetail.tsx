import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Share2, Heart, ChevronDown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import HeaderTesterSessionLayout from '../../../components/testers-session/HeaderLayout';

const RatingStars = ({ rating }: { rating: number }) => (
  <>
    {rating &&
      rating > 0 &&
      [...Array(5)].map((_, i) => {
        const fullStars = Math.round(rating || 5);
        const isFullStar = i < fullStars;
        const isHalfStar = !isFullStar && i < rating;
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
  </>
);

export default function PreviewProductDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProduct = () => {
      try {
        const storedProduct = sessionStorage.getItem('previewProduct');
        if (storedProduct) {
          setProduct(JSON.parse(storedProduct));
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, []);

  if (isLoading) {
    return (
      <HeaderTesterSessionLayout>
        <div className="bg-[#EAEDED] min-h-[600px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00A67E]"></div>
        </div>
      </HeaderTesterSessionLayout>
    );
  }

  if (!product) {
    return (
      <HeaderTesterSessionLayout>
        <div className="bg-[#EAEDED] min-h-[600px] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Product not found</h2>
            <p className="text-gray-600 mb-4">
              Please go back to the previous page and select a product again.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-[#0F1111] text-[14px] hover:text-[#C7511F] transition-colors duration-200 mx-auto"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </HeaderTesterSessionLayout>
    );
  }

  return (
    <HeaderTesterSessionLayout>
      <div className="bg-[#EAEDED] min-h-[600px]">
        <div className="max-w-screen-xl mx-auto">
          <button
            className="flex items-center space-x-2 text-[#0F1111] text-[14px] hover:text-[#C7511F] my-4 transition-colors duration-200"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Go Back</span>
          </button>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <div className="block md:hidden p-2">
              <div className="items-center flex">
                <a
                  href="#"
                  className="text-[#007185] text-[14px] hover:text-[#C7511F] hover:underline transition-colors duration-200"
                >
                  Visit the {product?.brand} Store
                </a>
                <small className="text-[14px] text-[#0F1111] px-1">{product.rating}</small>
                <div className="flex items-center p-1">
                  <RatingStars rating={product.rating} />
                </div>
                <ChevronDown className="h-4 w-4" />
                <a
                  href="#"
                  className="text-[#007185] text-[14px] hover:text-[#C7511F] hover:underline transition-colors duration-200 ml-2"
                >
                  {product.reviews_count} reviews
                </a>
              </div>
              <h1 className="text-[14px] font-medium text-[#565959] py-1 leading-tight">
                {product.title}
              </h1>
            </div>

            <div className="col-span-1 md:col-span-5 flex md:flex-row flex-col">
              <div className="flex-col gap-2 p-2 hidden custom-hide:hidden md:flex">
                {product.images?.map((image: string, index: number) => (
                  <div
                    key={index}
                    className="w-10 h-10 bg-black rounded-lg"
                    onClick={() => setCurrentIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="w-full aspect-square mb-4 rounded-lg max-w-[450px] max-h-[450px]">
                <img
                  src={currentIndex === 0 ? product.image_url : product.images?.[currentIndex]}
                  alt={`Product image ${currentIndex + 1}`}
                  className="w-full h-auto object-contain"
                />
              </div>
              <div className="relative md:hidden py-2">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2.5 h-2.5 bg-white rounded-full border border-black"></div>
                  <div className="w-2.5 h-2.5 bg-black rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-black rounded-full"></div>
                </div>
                <div className="absolute top-0 right-0 flex items-center justify-end">
                  <button className="flex items-center space-x-2 text-[#0F1111] text-[14px] hover:text-[#C7511F] transition-colors duration-200">
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button className="flex items-center space-x-2 text-[#0F1111] text-[14px] hover:text-[#C7511F] transition-colors duration-200">
                    <Heart className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 hidden md:grid">
              <div className="flex items-start flex-col gap-2">
                <h1 className="text-[24px] font-medium text-[#0F1111] mb-1 leading-tight pt-2">
                  {product.title}
                </h1>
                <a
                  href="#"
                  className="text-[#007185] text-[14px] hover:text-[#C7511F] hover:underline transition-colors duration-200"
                >
                  Visit the {product?.brand} Store
                </a>
                <div className="items-center flex pb-2">
                  <small className="text-[14px] text-[#0F1111] pr-2">{product.rating}</small>
                  <div className="flex items-center p-1">
                    <RatingStars rating={product.rating} />
                  </div>
                  <ChevronDown className="h-4 w-4" />
                  <a
                    href="#"
                    className="text-[#007185] text-[14px] hover:text-[#C7511F] hover:underline transition-colors duration-200 ml-2"
                  >
                    {product.reviews_count} reviews
                  </a>
                </div>
                <div className="border-t border-[#DDD] py-4">
                  <p className="text-[14px] text-[#0F1111] font-bold">About this product:</p>
                  <ul className="list-disc pl-5 py-2">
                    {product.bullet_points &&
                      product.bullet_points.map((bullet: string) => (
                        <li key={bullet} className="text-[14px] text-[#0F1111]">
                          {bullet}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2 border border-[#DDD] rounded-lg p-4 m-1">
              <strong className="text-[14px] text-[#0F1111]">Buy for first time</strong>
              <div className="border-b border-[#DDD]">
                <div className="flex items-start gap-[2px]">
                  <span className="text-[13px] text-[#0F1111] mt-1">US$</span>
                  <span className="md:text-[28px] text-[#0F1111] text-6xl">
                    {Math.floor(product.price)}
                  </span>
                  <span className="text-[13px] text-[#0F1111] mt-1">
                    {(product.price % 1).toFixed(2).substring(1)}
                  </span>
                </div>
              </div>
              <div className="text-[14px] text-[#007185]">
                FREE delivery
                <span className="text-[#0F1111]"> Tomorrow</span>
              </div>
              <span className="text-[18px] text-[#007600]">In Stock</span>
            </div>
          </div>
        </div>
      </div>
    </HeaderTesterSessionLayout>
  );
} 