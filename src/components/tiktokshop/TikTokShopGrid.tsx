import { useState } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateSession } from '../../features/tests/services/testersSessionService';
import { useSessionStore } from '../../store/useSessionStore';
import TikTokShopProductGrid from './TikTokShopProductGrid';

interface TikTokShopGridProps {
  products: any[];
  addToCart: (item: any) => void;
  variantType: string;
  testId: string;
  mainProduct?: any;
}

export default function TikTokShopGrid({
  products,
  addToCart,
  variantType,
  testId,
  mainProduct,
}: TikTokShopGridProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const navigate = useNavigate();
  const { shopperId } = useSessionStore();

  const handleAddToCart = (product: any) => {
    addToCart(product);
    setCurrentProduct(product);
    updateSession(product, shopperId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  const normalizedProducts = products.map((item) => item.product || item);
  const tester = { testId, variantType, mainProduct };

  return (
    <>
      <div className="bg-white p-4 rounded-lg">
        <TikTokShopProductGrid
          products={normalizedProducts}
          onAddToCart={handleAddToCart}
          tester={tester}
        />
      </div>

      {isModalOpen && currentProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg max-w-lg w-full mx-4 flex flex-col relative">
            <button
              type="button"
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeModal}
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex flex-row items-center justify-around">
              <img
                src={currentProduct.image_url || currentProduct.image}
                alt={currentProduct.title || currentProduct.name}
                className="w-[200px] h-[200px] rounded object-contain"
              />
              <div className="flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
                <h2 className="text-xl font-bold">Added to cart</h2>
              </div>
            </div>
            <p className="mt-2 text-center text-gray-700">
              You added <strong>{currentProduct.title || currentProduct.name}</strong> to your cart.
            </p>
            <div className="mt-4 flex justify-around">
              <button
                type="button"
                className="border border-black text-black hover:bg-black hover:text-white font-bold py-2 px-4 rounded-lg"
                onClick={() => navigate('/questions')}
              >
                Go to checkout
              </button>
              <button
                type="button"
                className="border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white font-bold py-2 px-4 rounded-lg"
                onClick={closeModal}
              >
                Keep shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
