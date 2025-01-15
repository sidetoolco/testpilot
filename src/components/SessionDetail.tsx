import React, { useState } from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { sessions } from '../data/sessions';
import ShoppingExperience from './ShoppingExperience';
import ProductQuestionnaire from './ProductQuestionnaire';

export default function SessionDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const session = sessions.find(s => s.id === Number(1));
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [shoppingStarted, setShoppingStarted] = useState(false);

  if (!session) {
    return (
      <div className="min-h-screen bg-[#E3E6E6] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-2">Session not found</h2>
          <button
            onClick={() => navigate('/all-sessions')}
            className="text-[#007185] hover:text-[#C7511F] hover:underline"
          >
            Return to sessions
          </button>
        </div>
      </div>
    );
  }

  const startShopping = () => {
    setShoppingStarted(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* TestPilot Navigation */}
      <div className="bg-[#1B1B31] text-white">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/all-sessions')}
              className="flex items-center space-x-2 text-white/80 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Go back</span>
            </button>
            <h1 className="text-lg font-medium">{session.test}</h1>
          </div>
        </div>
      </div>

      {/* Amazon Header */}
      {shoppingStarted && (
        <div className="bg-[#232F3E] text-white border-b border-[#3B4F68]">
          <div className="max-w-screen-2xl mx-auto px-4 py-2">
            <div className="flex items-center space-x-4">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
                alt="Amazon"
                className="h-8 brightness-0 invert"
              />
              <div className="text-sm font-medium">Shopping Experience Preview</div>
            </div>
          </div>
        </div>
      )}

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
                onClick={startShopping}
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
        <div className="w-80 bg-[#1B1B31] text-white p-6 flex flex-col">
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-12 h-12 ${session.tester.color} rounded-full flex items-center justify-center text-gray-700 font-medium`}>
                {session.tester.initials}
              </div>
              <div>
                <h3 className="font-medium">{session.tester.name}</h3>
                <p className="text-sm text-gray-400">
                  Age: {session.tester.age}, {session.tester.country}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>💻 {session.device}</span>
              <span>•</span>
              <span>{session.date}</span>
            </div>
          </div>

          <div className="space-y-2">
            <button className="w-full flex items-center space-x-2 px-3 py-2 bg-white/10 rounded hover:bg-white/20">
              <FileText className="h-4 w-4" />
              <span className="text-sm">Download report (PDF)</span>
            </button>
          </div>
        </div>
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