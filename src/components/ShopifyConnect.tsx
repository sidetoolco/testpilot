import React, { useState } from 'react';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';

interface ShopifyConnectProps {
  onClose: () => void;
  onConnect: (store: string) => void;
}

export function ShopifyConnect({ onClose, onConnect }: ShopifyConnectProps) {
  const [store, setStore] = useState('');
  const [step, setStep] = useState<'url' | 'auth'>('url');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'url') {
      setStep('auth');
    } else {
      onConnect(store);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#96BF47] bg-opacity-10 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-[#96BF47]" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Connect Shopify Store</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {step === 'url' ? (
            <>
              <p className="text-gray-600 mb-6">
                Enter your Shopify store URL to import your products automatically.
              </p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store URL
                  </label>
                  <div className="flex items-center">
                    <span className="bg-gray-50 px-4 py-3 rounded-l-xl text-gray-500 border border-r-0 border-gray-200">
                      https://
                    </span>
                    <input
                      type="text"
                      value={store}
                      onChange={(e) => setStore(e.target.value)}
                      placeholder="your-store.myshopify.com"
                      className="flex-1 px-4 py-3 rounded-r-xl border border-gray-200 focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-[#96BF47] text-white rounded-xl hover:bg-[#85ab3f] transition-colors"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-[#96BF47] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-[#96BF47]" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Authorize TestPilot
              </h3>
              <p className="text-gray-600 mb-6">
                You'll be redirected to Shopify to authorize TestPilot to access your store data.
              </p>
              <button
                onClick={handleSubmit}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-[#96BF47] text-white rounded-xl hover:bg-[#85ab3f] transition-colors"
              >
                <span>Authorize with Shopify</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 text-center text-sm text-gray-500">
          By connecting your store, you agree to TestPilot's Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
}