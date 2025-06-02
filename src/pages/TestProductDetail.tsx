import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Share2, Heart, ChevronDown, CheckCircle, X } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useSessionStore } from '../store/useSessionStore'; // Asegúrate de importar el hook
import HeaderTesterSessionLayout from '../components/testers-session/HeaderLayout';
import { recordTimeSpent, updateSession } from '../features/tests/services/testersSessionService';
import RedirectModal from '../components/test-setup/RedirectQuestionModal';
import { trackEvent } from '../lib/events';

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

export default function ProductDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;
  const addToCart = useSessionStore(state => state.selectItemAtCheckout); // Usa el hook
  const { shopperId } = useSessionStore(); // Obtén la sesión actual
  const [searchParams] = useSearchParams();

  const testId = searchParams.get('test');
  const variationType = searchParams.get('variant');

  const itemSelectedAtCheckout = useSessionStore(state => state.itemSelectedAtCheckout);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);

  const handleAddToCart = () => {
    if (!product) {
      console.error('No product available to add to cart');
      return;
    }

    trackEvent(
      'click',
      {
        test_id: testId || '',
        product_id: product.id,
        variation_type: variationType || '',
      },
      location.pathname
    );

    if (itemSelectedAtCheckout) {
      setIsWarningModalOpen(true);
    } else {
      addToCart(product);
      updateSession(product, shopperId);
      setIsModalOpen(true);
    }
  };

  const handleReplaceProduct = () => {
    addToCart(product);
    updateSession(product, shopperId);
    setIsWarningModalOpen(false);
    setIsModalOpen(true);
  };

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
  }, [product]); // Dependencia en el producto para recalcular si cambia

  const closeModal = (navigateTo: string = '') => {
    setIsModalOpen(false);
    if (navigateTo) {
      navigate(navigateTo);
      setIsRedirectModalOpen(true);
    }
  };

  const handleRedirectClose = () => {
    setIsRedirectModalOpen(false);
    navigate('/questions');
  };

  if (!product) {
    console.error('No product found');
    return <div>Product not found</div>;
  }

  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <HeaderTesterSessionLayout>
      <div className="max-w-screen-xl mx-auto">
        <button
          className="flex items-center space-x-2 text-[#0F1111] text-[14px] hover:text-[#C7511F] my-4 transition-colors duration-200"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Go Back</span>
        </button>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 ">
          <div className="block md:hidden p-2">
            <div className="items-center flex">
              <a
                href="#"
                className=" text-[#007185] text-[14px] hover:text-[#C7511F] hover:underline transition-colors duration-200"
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
            <span className="text-[14px] text-[#0F1111]">
              <strong>500 + Sold &nbsp;</strong>
              last month
            </span>
          </div>

          <div className="col-span-1 md:col-span-5 flex md:flex-row flex-col">
            <div className="flex-col gap-2 p-2 hidden custom-hide:hidden md:flex">
              {product.images.map((image: string, index: number) => (
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
                src={currentIndex === 0 ? product.image_url : product.images[currentIndex]}
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
              <h1 className="text-[24px] font-medium text-[#0F1111] mb-1 leading-tight pt-2 ">
                {product.title}
              </h1>
              <a
                href="#"
                className=" text-[#007185] text-[14px] hover:text-[#C7511F] hover:underline transition-colors duration-200"
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
            <div className="flex items-start justify-between border-t border-[#DDD] w-full pt-4 mt-4">
              <button className="flex items-center space-x-2 text-[#0F1111] text-[14px] hover:text-[#C7511F] transition-colors duration-200">
                <Share2 className="h-5 w-5" />
                <span>Share</span>
              </button>
              <button className="flex items-center space-x-2 text-[#0F1111] text-[14px] hover:text-[#C7511F] transition-colors duration-200">
                <Heart className="h-5 w-5" />
                <span>Add to List</span>
              </button>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 space-y-2 border border-[#DDD] rounded-lg p-4 m-1">
            <strong className="text-[14px] text-[#0F1111]">Buy for first time</strong>
            <div className="border-b border-[#DDD] ">
              <div className="flex items-start gap-[2px]">
                <span className="text-[13px] text-[#0F1111] mt-1">US$</span>
                <span className="md:text-[28px] text-[#0F1111] text-6xl">
                  {Math.floor(product.price)}
                </span>
                <span className="text-[13px] text-[#0F1111] mt-1">
                  {(product.price % 1).toFixed(2).substring(1)}
                </span>
              </div>
              {product.loads && (
                <div className="text-[14px] text-[#565959]">
                  ${(product.price / product.loads).toFixed(2)}/Fl Oz
                </div>
              )}
            </div>
            <div className="text-[14px] text-[#007185]">
              FREE delivery
              <span className="text-[#0F1111]"> Tomorrow</span>
            </div>
            <div className="text-[12px] text-[#007185]">Order within 12 hrs 34 mins</div>
            <span className="text-[18px] text-[#007600]">In Stock</span>

            <p className="text-[14px] text-[#0F1111]">Quantity:</p>
            <div className="flex space-x-2 text-[#0F1111] text-[14px] flex-col">
              <select className="border border-[#DDD] rounded-lg px-2 py-1 bg-[#F0F2F2]">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[13px] text-[#0F1111] py-3 rounded-full border border-[#FCD200] font-medium flex items-center justify-center space-x-2 transition-colors duration-200"
              aria-label="Add to Cart"
              onClick={handleAddToCart}
            >
              <span>Add to Cart</span>
            </button>
            <button
              className="w-full bg-[#ff8c04] hover:bg-[#ff8c04] text-[13px] text-[#0F1111] py-3 rounded-full border border-[#FCD200] font-medium flex items-center justify-center space-x-2 transition-colors duration-200"
              aria-label="Add to Cart"
              onClick={handleAddToCart}
            >
              <span>Buy Now</span>
            </button>
          </div>
        </div>
        <div className="text-[14px] text-[#0F1111] space-y-4 p-4 mt-2 ">
          <strong className="block text-lg font-semibold">Description about the product</strong>
          <p className="mb-4  pb-4">
            {product?.description ? product.description : 'No description available'}
          </p>
          <div className="border-t border-[#DDD] py-2 block md:hidden">
            <strong className="block text-lg font-semibold">Details about the product</strong>

            <ul className="list-disc pl-5">
              {product.bullet_points &&
                product.bullet_points.map((bullet: string) => (
                  <li key={bullet} className="text-[14px] text-[#0F1111]">
                    {bullet}
                  </li>
                ))}
            </ul>
          </div>
          <table className="w-full text-left border-collapse">
            <tbody>
              <tr className="border-b border-[#DDD] border-t">
                <td className="py-2 font-semibold">Brand</td>
                <td className="py-2">{product.brand || 'No brand available'}</td>
              </tr>
            </tbody>
          </table>
          <div className="border-t border-[#DDD] py-6">
            <h2 className="text-[20px] font-medium text-[#0F1111] mb-4">Customer reviews</h2>
            <div className="bg-[#F3F3F3] p-6 rounded-lg">
              <div className="flex items-center justify-center flex-col text-center">
                <p className="text-[#565959] text-[14px] mb-2">
                  Reviews are not included in this test
                </p>
                <p className="text-[#565959] text-[12px]">
                  This is a test environment where reviews are not available. In a real shopping
                  experience, you would see customer reviews here.
                </p>
              </div>
            </div>
          </div>
        </div>

        {isModalOpen && (
          <ProductModal
            testId={testId || ''}
            product={product}
            closeModal={closeModal}
            variationType={variationType || ''}
          />
        )}
        {isWarningModalOpen && (
          <WarningModal
            closeModal={() => setIsWarningModalOpen(false)}
            replaceProduct={handleReplaceProduct}
            selectedProduct={itemSelectedAtCheckout}
          />
        )}
        <RedirectModal isOpen={isRedirectModalOpen} onClose={handleRedirectClose} />
      </div>
    </HeaderTesterSessionLayout>
  );
}

// Componente para mostrar el modal
const ProductModal = ({
  product,
  closeModal,
  testId,
  variationType,
}: {
  product: any;
  closeModal: (navigateTo?: string) => void;
  testId: string;
  variationType: string;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg max-w-lg w-full mx-4 md:mx-auto flex flex-col justify-around relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        onClick={() => closeModal()}
      >
        <X className="h-6 w-6" />
      </button>
      <div className="flex items-center flex-row  justify-around">
        <div className="flex justify-center items-center w-full h-full">
          <img
            src={product.image_url || product.image}
            alt={product.title || product.name}
            className="max-w-full max-h-full rounded object-contain"
          />
        </div>
        <div className="flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
          <h2 className="text-xl font-bold">Added to Cart</h2>
        </div>
      </div>
      <p className="mt-2 text-center text-gray-700">
        You have added <strong>{product.title || product.name}</strong> to your cart.
      </p>
      <div className="mt-4 flex justify-around">
        <button
          className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            trackEvent(
              'click',
              {
                product_id: product.id,
                test_id: testId,
                variation_type: variationType,
              },
              location.pathname
            );
            closeModal('/questions');
          }}
        >
          Go to Checkout
        </button>
        <button
          className="border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white font-bold py-2 px-4 rounded"
          onClick={() => closeModal()}
        >
          Keep Shopping
        </button>
      </div>
    </div>
  </div>
);

// Componente para mostrar el modal de advertencia
const WarningModal = ({
  closeModal,
  replaceProduct,
  selectedProduct,
}: {
  closeModal: () => void;
  replaceProduct: () => void;
  selectedProduct: any;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-3 md:p-6 rounded-lg shadow-lg max-w-lg w-full mx-4 md:mx-auto flex flex-col justify-around relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        onClick={closeModal}
      >
        <X className="h-6 w-6" />
      </button>
      <div className="flex items-center justify-center">
        <h2 className="text-xl font-bold">You can only have 1 item in the cart</h2>
      </div>
      <p className="mt-2 text-center text-gray-700">Would you like to replace this item?</p>
      {selectedProduct && (
        <div className="flex justify-center mt-4">
          <img
            src={selectedProduct.image_url || selectedProduct.image}
            alt={selectedProduct.title || selectedProduct.name}
            className="max-w-full max-h-32 object-contain"
          />
        </div>
      )}
      <div className="mt-4 flex justify-around">
        <button
          className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-bold py-2 px-4 rounded"
          onClick={replaceProduct}
        >
          Replace
        </button>
        <button
          className="border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white font-bold py-2 px-4 rounded"
          onClick={closeModal}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);
