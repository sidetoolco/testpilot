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
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const { shopperId } = useSessionStore();
  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // Check if an item is already in the cart
  const itemSelectedAtCheckout = useSessionStore(state => state.itemSelectedAtCheckout);

  const handleAddToCart = (product: any) => {
    if (itemSelectedAtCheckout) {
      setCurrentProduct(product);
      setIsWarningModalOpen(true);
    } else {
      addToCart(product);
      setCurrentProduct(product);
      console.log(`Product added to cart: ${product.title}`);
      updateSession(product, shopperId);
      setIsModalOpen(true);
    }
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
  };

  const handleReplaceProduct = () => {
    addToCart(currentProduct);
    updateSession(currentProduct, shopperId);
    setIsWarningModalOpen(false);
    setIsModalOpen(true);
  };

  const handleRedirectClose = () => {
    setIsRedirectModalOpen(false);
    navigate('/questions');
  };

  // Show product detail if a product is selected
  if (showProductDetail && selectedProduct) {
    // Debug logging for product detail data
    console.log('🔍 WalmartGrid - Showing product detail for:', {
      selectedProduct,
      hasDescription: !!(selectedProduct.description || selectedProduct.product_description || (selectedProduct.bullet_points && selectedProduct.bullet_points.length > 0)),
      description: selectedProduct.description,
      product_description: selectedProduct.product_description,
      bullet_points: selectedProduct.bullet_points
    });

    return (
      <>
        <WalmartProductDetail
          product={selectedProduct}
          onBack={handleBackToGrid}
          onAddToCart={handleAddToCart}
        />
        
        {/* Add to Cart Modal - Available in both states */}
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
                  onClick={() => navigate('/questions')}
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

        {/* Warning Modal */}
        {isWarningModalOpen && currentProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-3 md:p-6 rounded-lg shadow-lg max-w-lg w-full mx-4 md:mx-auto flex flex-col justify-around relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setIsWarningModalOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
              <div className="flex items-center justify-center">
                <h2 className="text-xl font-bold">You can only have 1 item in the cart</h2>
              </div>
              <p className="mt-2 text-center text-gray-700">Would you like to replace this item?</p>
              {itemSelectedAtCheckout && (
                <div className="flex justify-center mt-4">
                  <img
                    src={itemSelectedAtCheckout.image_url}
                    alt={itemSelectedAtCheckout.title}
                    className="max-w-full max-h-32 object-contain"
                  />
                </div>
              )}
              <div className="mt-4 flex justify-around">
                <button
                  className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-bold py-2 px-4 rounded"
                  onClick={handleReplaceProduct}
                >
                  Replace
                </button>
                <button
                  className="border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white font-bold py-2 px-4 rounded"
                  onClick={() => setIsWarningModalOpen(false)}
                >
                  Cancel
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
                onClick={() => navigate('/questions')}
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

      {/* Warning Modal */}
      {isWarningModalOpen && currentProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-3 md:p-6 rounded-lg shadow-lg max-w-lg w-full mx-4 md:mx-auto flex flex-col justify-around relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setIsWarningModalOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex items-center justify-center">
              <h2 className="text-xl font-bold">You can only have 1 item in the cart</h2>
            </div>
            <p className="mt-2 text-center text-gray-700">Would you like to replace this item?</p>
            {itemSelectedAtCheckout && (
              <div className="flex justify-center mt-4">
                <img
                  src={itemSelectedAtCheckout.image_url}
                  alt={itemSelectedAtCheckout.title}
                  className="max-w-full max-h-32 object-contain"
                />
              </div>
            )}
            <div className="mt-4 flex justify-around">
              <button
                className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-bold py-2 px-4 rounded"
                onClick={handleReplaceProduct}
              >
                Replace
              </button>
              <button
                className="border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white font-bold py-2 px-4 rounded"
                onClick={() => setIsWarningModalOpen(false)}
              >
                Cancel
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
