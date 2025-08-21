import React, { useState, useEffect } from 'react';
import { Search, Heart, User, ShoppingCart, Menu, MapPin } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';

interface WalmartHeaderLayoutProps {
  children: React.ReactNode;
  searchTerm?: string;
}

export default function WalmartHeaderLayout({ children, searchTerm }: WalmartHeaderLayoutProps) {
  const { shopperId, status, sessionBeginTime } = useSessionStore();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (!sessionBeginTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - sessionBeginTime.getTime();
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionBeginTime]);

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleClick = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <div>
      {/* TestPilot Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 bg-[#00A67E] shadow-md flex pb-2flex-wrap justify-between items-center z-50">
        <div className="flex items-center flex-grow sm:flex-grow-0 p-4">
          <div className="bg-white p-1 rounded-lg">
            <img src="/assets/images/testPilot-black.png" alt="TestPilot" className="h-8" />
          </div>
          <span className="text-lg font-bold ml-2">Shopping Simulator</span>
        </div>
        <div className="text-sm flex-grow sm:flex-grow-0 text-center sm:text-right p-4">
          {error ? (
            <span className="text-red-800">{error}</span>
          ) : (
            `${capitalizeFirstLetter(status)} - ${Math.floor(elapsedTime / 60)}:${String(elapsedTime % 60).padStart(2, '0')}`
          )}
        </div>
      </div>

      {/* Walmart Header */}
      <header className="bg-[#0071dc] text-white md:p-3 sticky top-[70px] z-40">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button className="md:hidden">
              <Menu size={28} />
            </button>
            <img 
              src="/assets/images/walmart-icon.svg" 
              alt="Walmart Logo" 
              className="h-8 md:h-9" 
            />
          </div>
          
          <div className="hidden md:flex items-center gap-2 bg-[#005cb4] p-2 rounded-full cursor-pointer">
            <MapPin size={20} />
            <div>
              <p className="text-xs font-bold">Pickup or delivery?</p>
              <p className="text-xs">Sacramento, 95829 • Sacramento Supe...</p>
            </div>
          </div>
          
          <div className="flex-grow mx-2 md:mx-4">
            <div className="relative">
              <input 
                type="text" 
                value={searchTerm || ''}
                className="w-full p-2 pl-4 pr-12 rounded-full text-black text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" 
              />
              <button className="absolute right-0 top-0 h-full px-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <Search size={20} className="text-black" />
              </button>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center text-xs cursor-pointer">
              <Heart size={24} className="mx-auto" />
              <p>My Items</p>
            </div>
            <div className="text-center text-xs cursor-pointer">
              <User size={24} className="mx-auto" />
              <p>Sign In</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center cursor-pointer">
            <ShoppingCart size={28} />
            <span className="text-xs font-bold">$0.00</span>
          </div>
        </div>
      </header>

      {/* Secondary Navigation */}
      <nav className="bg-[#C9DCFD] shadow-sm mt-1 border-b pt-1 border-gray-200 block relative z-30 min-h-[48px]">
        <div className="max-w-full px-4 flex mt-16 items-center p-1 justify-center gap-6 overflow-x-auto scrollbar-hide">
          <a href="#" className="flex items-center gap-1 text-sm font-bold text-gray-800 hover:text-[#0071dc] whitespace-nowrap bg-white px-3 py-1 rounded-full shadow-sm" onClick={handleClick}>
            <Menu size={16}/><span>Departments</span>
          </a>
          <a href="#" className="text-sm font-bold text-gray-800 hover:text-[#0071dc] whitespace-nowrap bg-white px-3 py-1 rounded-full shadow-sm" onClick={handleClick}>
            Services
          </a>
          <a href="#" className="text-sm text-yellow-600 hover:text-yellow-700 whitespace-nowrap font-medium flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm" onClick={handleClick}>
            ⚡ Get it Fast
          </a>
          <a href="#" className="text-sm text-gray-800 hover:text-[#0071dc] whitespace-nowrap bg-white px-3 py-1 rounded-full shadow-sm" onClick={handleClick}>
            🆕 New Arrivals
          </a>
          <a href="#" className="text-sm text-gray-800 hover:text-[#0071dc] whitespace-nowrap bg-white px-3 py-1 rounded-full shadow-sm" onClick={handleClick}>
            🎒 Back to School
          </a>
          <a href="#" className="text-sm text-gray-800 hover:text-[#0071dc] whitespace-nowrap bg-white px-3 py-1 rounded-full shadow-sm" onClick={handleClick}>
            🍽️ Dinner Made Easy
          </a>
          <a href="#" className="text-sm text-gray-800 hover:text-[#0071dc] whitespace-nowrap bg-white px-3 py-1 rounded-full shadow-sm" onClick={handleClick}>
            💊 Pharmacy Delivery
          </a>
          <a href="#" className="text-sm text-gray-800 hover:text-[#0071dc] whitespace-nowrap bg-white px-3 py-1 rounded-full shadow-sm" onClick={handleClick}>
            🎓 College Shop
          </a>
          <a href="#" className="text-sm text-gray-800 hover:text-[#0071dc] whitespace-nowrap bg-white px-3 py-1 rounded-full shadow-sm" onClick={handleClick}>
            ❤️ My Items
          </a>
          <a href="#" className="text-sm text-gray-800 hover:text-[#0071dc] whitespace-nowrap bg-white px-3 py-1 rounded-full shadow-sm" onClick={handleClick}>
            🔧 Auto Service
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow sm:flex-grow-0 w-full">
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Navigation Disabled Modal */}
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
              <p className="text-center">
                Navigation is disabled on these pages, please focus on our products.
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
