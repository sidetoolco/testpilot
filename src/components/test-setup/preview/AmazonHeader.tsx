import { Search, MapPin, ShoppingCart, Trash, X } from 'lucide-react';
import { useSessionStore } from '../../../store/useSessionStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RedirectModal from '../RedirectQuestionModal';

interface AmazonHeaderProps {
  searchTerm: string;
}

export default function AmazonHeader({ searchTerm }: AmazonHeaderProps) {
  const { itemSelectedAtCheckout, clearItemSelectedAtCheckout } = useSessionStore((state) => state);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();
  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);

  const handleCartClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleNotAllowedClick = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };
  
  const handleRedirect = () => {
    setIsRedirectModalOpen(true);
  };
  const handleRedirectClose = () => {
    setIsRedirectModalOpen(false);
    navigate('/questions');
  };


  return (
    <div className="bg-[#131921] text-white">
      <div className="max-w-screen-2xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <div className="flex items-center cursor-not-allowed" onClick={handleNotAllowedClick}>
              <img
                src="https://wildfiresocial.com/wp-content/uploads/2019/01/amazon-logo-white._cb1509666198_.png"
                alt="Amazon"
                className="h-8"
              />
            </div>

            {/* Deliver To */}
            <div className="flex items-center space-x-1 cursor-not-allowed" onClick={handleNotAllowedClick}>
              <MapPin className="h-4 w-4" />
              <div className="hidden md:block">
                <div className="text-[11px] text-gray-300">Deliver to</div>
                <div className="text-sm font-bold">United States</div>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-2xl cursor-not-allowed" onClick={handleNotAllowedClick}>
              <div className="flex h-10">
                <div className="relative">
                  <select className="h-full px-3 bg-[#f3f3f3] border-r border-gray-300 rounded-l-md text-gray-800 text-sm appearance-none pr-8 hover:bg-[#dadada] cursor-not-allowed">
                    <option>All</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="border-4 border-transparent border-t-gray-400" style={{ marginTop: "2px" }}></div>
                  </div>
                </div>
                <input
                  type="text"
                  className="w-full px-4 py-2 border-0 bg-white text-gray-800 focus:outline-none cursor-not-allowed"
                  value={searchTerm}
                  readOnly
                />
                <button className="px-6 bg-[#febd69] hover:bg-[#f3a847] rounded-r-md cursor-not-allowed">
                  <Search className="h-5 w-5 text-gray-800" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-6 ">
            <div className="hidden md:block cursor-not-allowed" onClick={handleNotAllowedClick}>
              <div className="text-[11px]">Hello, sign in</div>
              <div className="text-sm font-bold">Account & Lists</div>
            </div>
            <div className="hidden md:block cursor-not-allowed" onClick={handleNotAllowedClick}>
              <div className="text-[11px]">Returns</div>
              <div className="text-sm font-bold">& Orders</div>
            </div>
            <div className="flex items-center cursor-pointer" onClick={handleCartClick}>
              <ShoppingCart className="h-7 w-7" />
              <span className="text-sm font-bold ml-1">Cart</span>
              <span className="text-sm font-bold ml-1">
                ({itemSelectedAtCheckout ? 1 : 0})
              </span>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end items-start text-black z-50">
          <div className="bg-white w-full sm:w-2/3 md:w-1/3 h-full p-6 rounded-l-lg shadow-lg overflow-y-auto relative">
            <button onClick={handleCloseModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none">
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
            <div className="flex justify-center flex-col items-center mb-4">
              <h2 className="text-xl font-bold">Subtotal</h2>
              <span className="text-xl font-bold text-red-600">${itemSelectedAtCheckout?.price || '0.00'}</span>
            </div>
            <p className="mb-4 text-sm text-gray-700 text-center">
              Your order qualifies for <span className="font-bold">FREE Shipping</span>. Choose this option at checkout. <a href="#" className="text-blue-500 hover:underline">See details</a>
            </p>
            <button onClick={handleRedirect} disabled={!itemSelectedAtCheckout} className="w-full mb-4 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
              Go to Checkout
            </button>

            <button onClick={handleCloseModal} className="w-full mb-4 px-4 py-2 bg-white text-blue-700 border border-blue-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
              Keep Shopping
            </button>

            {itemSelectedAtCheckout ? (
              <>
                <div className="border-t border-gray-200 py-4">
                  <div className="flex items-center mb-4 hover:bg-gray-100 p-2 rounded justify-center flex-col">
                    <img
                      src={itemSelectedAtCheckout.image_url}
                      alt={itemSelectedAtCheckout.title}
                      className="w-20 h-20 rounded-md"
                    />
                    <p className="text-sm font-bold">${itemSelectedAtCheckout.price}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <select className="border border-gray-300 px-2 py-1 w-2/3 rounded-lg" disabled>
                      <option>1</option>
                    </select>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={clearItemSelectedAtCheckout}
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-700">No product selected</p>
            )}
          </div>
        </div>
      )}
      {isModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg relative max-w-sm w-full">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl"
            >
              &times;
            </button>
            <div className="p-6">
              <p className="text-center text-black">
                Navigation is disabled on these pages, please focus on our products.
              </p>
            </div>
          </div>
        </div>
      )}
      <RedirectModal isOpen={isRedirectModalOpen} onClose={handleRedirectClose} />
    </div>
  );
}