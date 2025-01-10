import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../../../store/useStore';
import TestHeader from './TestHeader';
import TesterInfo from './TesterInfo';
import ShoppingExperience from '../../../shopping/components/ShoppingExperience';
import ProductQuestionnaire from '../../../shopping/components/ProductQuestionnaire';
import { Product } from '../../../../types';

export default function TestDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { sessions } = useStore();
  const session = sessions.find(s => s.id === Number(id));
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [shoppingStarted, setShoppingStarted] = useState(false);

  if (!session) {
    return (
      <div className="min-h-screen bg-[#FFF8F8] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-2">Test not found</h2>
          <button
            onClick={() => navigate('/my-tests')}
            className="text-primary-400 hover:text-primary-500 hover:underline"
          >
            Return to tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TestHeader 
        session={session}
        onBack={() => navigate('/my-tests')}
        shoppingStarted={shoppingStarted}
      />

      <div className="flex flex-1">
        {/* Main Content */}
        <div className="flex-1 bg-[#E3E6E6] overflow-y-auto">
          {!shoppingStarted ? (
            <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-lg shadow-sm">
              <h2 className="text-2xl font-medium text-gray-900 mb-4">Welcome to the Shopping Experience!</h2>
              <p className="text-gray-600 mb-6">
                We'd like you to shop for {session.category} as you normally would on Amazon. 
                Browse through the products, read descriptions, and select the one you'd purchase. 
                There are no right or wrong choices - we want to understand your natural shopping behavior.
              </p>
              <button
                onClick={() => setShoppingStarted(true)}
                className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] py-3 px-8 rounded-full border border-[#FCD200] font-medium text-center"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <ShoppingExperience 
              products={session.products}
              onProductSelected={setSelectedProduct}
              setShowQuestionnaire={setShowQuestionnaire}
            />
          )}
        </div>

        {/* Right Sidebar */}
        <TesterInfo session={session} />
      </div>

      {selectedProduct && showQuestionnaire && (
        <ProductQuestionnaire 
          product={selectedProduct}
          onClose={() => {
            setSelectedProduct(null);
            setShowQuestionnaire(false);
            navigate(`/test-insights/${id}`);
          }}
        />
      )}
    </div>
  );
}