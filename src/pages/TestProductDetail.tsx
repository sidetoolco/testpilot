import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Share2, Heart, ChevronDown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSessionStore } from '../store/useSessionStore'; // Asegúrate de importar el hook
import HeaderTesterSessionLayout from '../components/testers-session/HeaderLayout';
import { recordTimeSpent, updateSession } from '../features/tests/services/testersSessionService';

// Componente para mostrar las estrellas de calificación
const RatingStars = ({ rating }: { rating: number }) => (
  <>
    {rating && rating > 0 && [...Array(5)].map((_, i) => {
      const isFullStar = i < Math.floor(rating || 5);
      const isHalfStar = !isFullStar && i < rating;
      return (
        <Star
          key={i}
          className={`h-4 w-4 ${isFullStar
            ? 'text-yellow-400 fill-yellow-400'
            : isHalfStar
              ? 'text-yellow-400 fill-current'
              : 'text-gray-200 fill-gray-200'
            }`}
          style={{
            clipPath: isHalfStar ? 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' : 'none'
          }}
        />
      );
    })}
  </>
);

// Componente para mostrar el modal
const ProductModal = ({ product, closeModal }: { product: any, closeModal: () => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-lg">
      <h2 className="text-lg font-bold mb-4">Product Selected</h2>
      <p className="mb-2">You have selected the following product:</p>
      <div className="mb-4">
        <h3 className="text-md font-semibold">{product.title}</h3>
        <p className="text-sm text-gray-700">Price: ${product.price.toFixed(2)}</p>
        <p className="text-sm text-gray-700">Brand: {product.brand}</p>
        <img
          src={product.image_url}
          alt={product.title}
          className="w-24 h-24 object-contain mt-2"
        />
      </div>
      <p>Redirecting to questions...</p>
      <button
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={closeModal}
      >
        Close
      </button>
    </div>
  </div>
);

export default function ProductDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;
  const addToCart = useSessionStore((state) => state.selectItemAtCheckout); // Usa el hook
  const { shopperId } = useSessionStore(); // Obtén la sesión actual

  const itemSelectedAtCheckout = useSessionStore((state) => state.itemSelectedAtCheckout);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = () => {
    if (!product) {
      console.error('No product available to add to cart');
      return;
    }
    addToCart(product);
    console.log(`Product added to cart: ${product.title}`);
    setIsModalOpen(true);
    updateSession(product, shopperId);
  };

  useEffect(() => {
    if (itemSelectedAtCheckout) {
      setIsModalOpen(true);
    }
  }, [itemSelectedAtCheckout]);

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

  const closeModal = () => {
    setIsModalOpen(false);

    navigate('/questions');
  };

  if (!product) {
    return <div>Producto no encontrado</div>;
  }

  return (
    <HeaderTesterSessionLayout>
      <button
        className="flex items-center space-x-2 text-[#0F1111] text-[14px] hover:text-[#C7511F] my-4 transition-colors duration-200"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Go Back</span>
      </button>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 ">
        <div className='block md:hidden p-2'>
          <div className="items-center flex">
            <a href="#" className=" text-[#007185] text-[14px] hover:text-[#C7511F] hover:underline transition-colors duration-200">
              Visit the {product.brand} Store
            </a>
            <small>
              {product.rating}
            </small>
            <RatingStars rating={product.rating} />
            <ChevronDown className="h-4 w-4" />
            <a href="#" className="text-[#007185] text-[14px] hover:text-[#C7511F] hover:underline transition-colors duration-200 ml-2">
              {product.reviews_count} reviews
            </a>
          </div>
          <h1 className="text-[14px] font-medium text-[#565959] py-1 leading-tight">
            {product.title}
          </h1>
          <span className='text-[14px] text-[#0F1111]'>
            <strong>
              500 + Sold &nbsp;
            </strong>
            last month
          </span>


        </div>

        <div className="col-span-1 md:col-span-5 flex md:flex-row flex-col">
          <div className="flex-col gap-2 p-2 hidden md:flex">
            <div className="w-10 h-10 bg-black rounded-lg"></div>
            <div className="w-10 h-10 bg-black rounded-lg"></div>
            <div className="w-10 h-10 bg-black rounded-lg"></div>
          </div>
          <div className="relative aspect-square bg-[#F8F8F8] mb-4 rounded-lg shadow-md">
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-contain p-2"
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
          <h1 className="text-[24px] font-medium text-[#0F1111] mb-1 leading-tight ">
            {product.title}
          </h1>
          <a href="#" className=" text-[#007185] text-[14px] hover:text-[#C7511F] hover:underline transition-colors duration-200">
            Visit the {product.brand} Store
          </a>
          <div className="items-center flex">
            <small>
              {product.rating}
            </small>
            <RatingStars rating={product.rating} />
            <ChevronDown className="h-4 w-4" />
            <a href="#" className="text-[#007185] text-[14px] hover:text-[#C7511F] hover:underline transition-colors duration-200 ml-2">
              {product.reviews_count} reviews
            </a>

          </div>
          <div className="border-t border-[#DDD]">
            <p className="text-[14px] text-[#0F1111] font-bold">
              About this product:
            </p>
            <ul className="list-disc pl-5">
              {product.bullet_points && product.bullet_points.map((bullet: string) => (
                <li key={bullet} className="text-[14px] text-[#0F1111]">
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-[#DDD]">
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
          <strong className="text-[14px] text-[#0F1111]">
            Buy for first time
          </strong>
          <div className="border-b border-[#DDD] ">
            <div className="flex items-start gap-[2px]">
              <span className="text-[13px] text-[#0F1111] mt-1">US$</span>
              <span className="md:text-[28px] text-[#0F1111] text-6xl">{Math.floor(product.price)}</span>
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
          <div className="text-[12px] text-[#007185]">
            Order within 12 hrs 34 mins
          </div>
          <span className="text-[18px] text-[#007600]">In Stock</span>

          <p className="text-[14px] text-[#0F1111]">Quantity:</p>
          <div className="flex space-x-2 text-[#0F1111] text-[14px] flex-col">

            <select className="border border-[#DDD] rounded-lg px-2 py-1 bg-[#F0F2F2]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>{num}</option>
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
      <div className="text-[14px] text-[#0F1111] space-y-4 p-4 mt-5">
        <strong className="block text-lg font-semibold">
          Description about the product
        </strong>
        <p className="mb-4 border-b border-[#DDD] pb-4">
          {product.description}
        </p>
        <strong className="block text-lg font-semibold">
          Details about the product
        </strong>
        <table className="w-full text-left border-collapse">
          <tbody>
            <tr className="border-b">
              <td className="py-2 font-semibold">Brand</td>
              <td className="py-2">{product.brand}</td>
            </tr>
            {/* Puedes agregar más filas aquí si es necesario */}
          </tbody>
        </table>
      </div>

      {isModalOpen && <ProductModal product={product} closeModal={closeModal} />}
    </HeaderTesterSessionLayout>
  );
}