import { ChevronRight, Smartphone } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RedirectModal from '../test-setup/RedirectQuestionModal';

interface TikTokShopHeaderProps {
  searchTerm: string;
}

export default function TikTokShopHeader({ searchTerm }: TikTokShopHeaderProps) {
  const { itemSelectedAtCheckout, clearItemSelectedAtCheckout } = useSessionStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNavModalOpen, setIsNavModalOpen] = useState(false);
  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleRedirect = () => {
    setIsRedirectModalOpen(true);
  };

  const handleRedirectClose = () => {
    setIsRedirectModalOpen(false);
    navigate('/questions');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-2 cursor-not-allowed"
            onClick={() => setIsNavModalOpen(true)}
          >
            <img src="/assets/images/tiktok-logo.png" alt="TikTok" className="h-8 object-contain" />
            <span className="text-lg font-bold text-black">TikTok Shop</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-full cursor-not-allowed"
            onClick={() => setIsNavModalOpen(true)}
          >
            <Smartphone className="h-4 w-4" />
            Get the app
          </button>
          <button
            type="button"
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => setIsCartOpen(true)}
          >
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-700">A</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
          <div className="bg-white w-full sm:max-w-sm h-full shadow-xl overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">Cart</h2>
              <button
                type="button"
                className="p-2 hover:bg-gray-100 rounded-full"
                onClick={() => setIsCartOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="p-4">
              {itemSelectedAtCheckout ? (
                <>
                  <div className="flex gap-3 border-b pb-4">
                    <img
                      src={itemSelectedAtCheckout.image_url}
                      alt={itemSelectedAtCheckout.title}
                      className="w-20 h-20 object-contain rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">{itemSelectedAtCheckout.title}</p>
                      <p className="text-red-600 font-bold mt-1">
                        ${Number(itemSelectedAtCheckout.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRedirect}
                    className="w-full mt-4 py-3 bg-black text-white font-medium rounded-lg"
                  >
                    Go to checkout
                  </button>
                  <button
                    type="button"
                    onClick={clearItemSelectedAtCheckout}
                    className="w-full mt-2 py-2 text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">Cart is empty</p>
              )}
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="w-full mt-4 py-2 border border-gray-300 rounded-lg text-sm"
              >
                Keep shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {isNavModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full mx-4 p-6 relative">
            <button
              type="button"
              onClick={() => setIsNavModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
            <p className="text-center text-gray-800">
              Navigation is disabled on this page. Please focus on our products.
            </p>
          </div>
        </div>
      )}

      <RedirectModal isOpen={isRedirectModalOpen} onClose={handleRedirectClose} />
    </header>
  );
}
