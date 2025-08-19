import React, { useState } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateSession } from '../../features/tests/services/testersSessionService';
import { useSessionStore } from '../../store/useSessionStore';
import RedirectModal from '../test-setup/RedirectQuestionModal';
import WalmartProductCard from './WalmartProductCard';
import WalmartProductDetail from './WalmartProductDetail';

interface WalmartGridProps {
  products: any[];
  addToCart: (item: any) => void;
  variantType: string;
  testId: string;
}

export default function WalmartGrid({
  products,
  addToCart,
  variantType,
  testId,
}: WalmartGridProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const { shopperId } = useSessionStore();
  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = (product: any) => {
    addToCart(product);
    setCurrentProduct(product);
    console.log(`Product added to cart: ${product.title}`);
    updateSession(product, shopperId);
    setIsModalOpen(true);
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const handleBackToGrid = () => {
    setShowProductDetail(false);
    setSelectedProduct(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
    setIsRedirectModalOpen(true);
  };

  const handleRedirectClose = () => {
    setIsRedirectModalOpen(false);
    navigate('/questions');
  };

  // Show product detail if a product is selected
  if (showProductDetail && selectedProduct) {
    return (
      <WalmartProductDetail
        product={selectedProduct}
        onBack={handleBackToGrid}
        onAddToCart={handleAddToCart}
      />
    );
  }

  // Show product grid
  return (
    <>
      <div className="bg-white p-4 rounded-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((item, index) => {
            const product = item.product || item; // Handle both wrapped and unwrapped products
            return (
              <WalmartProductCard
                key={`walmart-product-card-${product.id || index}`}
                product={product}
                onAddToCart={handleAddToCart}
                onProductClick={handleProductClick}
                variantType={variantType}
                testId={testId}
              />
            );
          })}
        </div>
      </div>

      {/* Add to Cart Modal */}
      {isModalOpen && currentProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg max-w-lg w-full mx-4 md:mx-auto flex flex-col justify-around relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeModal}
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex items-center flex-row justify-around">
              <img
                src={currentProduct.image_url || currentProduct.image}
                alt={currentProduct.title || currentProduct.name}
                className="w-[200px] h-[200px] rounded"
              />
              <div className="flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
                <h2 className="text-xl font-bold">Added to Cart</h2>
              </div>
            </div>
            <p className="mt-2 text-center text-gray-700">
              You have added <strong>{currentProduct.title || currentProduct.name}</strong> to your
              cart.
            </p>
            <div className="mt-4 flex justify-around">
              <button
                className="border border-[#0071dc] text-[#0071dc] hover:bg-[#0071dc] hover:text-white font-bold py-2 px-4 rounded"
                onClick={closeModal}
              >
                Go to Checkout
              </button>
              <button
                className="border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white font-bold py-2 px-4 rounded"
                onClick={() => setIsModalOpen(false)}
              >
                Keep Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redirect Modal */}
      <RedirectModal
        isOpen={isRedirectModalOpen}
        onClose={handleRedirectClose}
      />
    </>
  );
}
