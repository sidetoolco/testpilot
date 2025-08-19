import React from 'react';
import { Search, Heart, User, ShoppingCart, Menu, MapPin } from 'lucide-react';

interface WalmartHeaderLayoutProps {
  children: React.ReactNode;
}

export default function WalmartHeaderLayout({ children }: WalmartHeaderLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Header */}
      <header className="bg-[#0071dc] text-white p-2 md:p-3 sticky top-0 z-50">
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
                placeholder="Search everything at Walmart online and in store" 
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
      <nav className="bg-white shadow-sm p-2 hidden md:block">
        <div className="container mx-auto flex items-center justify-start gap-4 overflow-x-auto scrollbar-hide">
          <a href="#" className="flex items-center gap-1 text-sm font-bold text-gray-800 hover:text-[#0071dc] whitespace-nowrap">
            <Menu size={20}/><span>Departments</span>
          </a>
          <a href="#" className="flex items-center gap-1 text-sm font-bold text-gray-800 hover:text-[#0071dc] whitespace-nowrap">
            <span>Services</span>
          </a>
          <a href="#" className="flex items-center gap-1 text-sm font-bold text-gray-800 hover:text-[#0071dc] whitespace-nowrap">
            <span>New Arrivals</span>
          </a>
          <a href="#" className="flex items-center gap-1 text-sm font-bold text-gray-800 hover:text-[#0071dc] whitespace-nowrap">
            <span>Back to School</span>
          </a>
          <a href="#" className="flex items-center gap-1 text-sm font-bold text-gray-800 hover:text-[#0071dc] whitespace-nowrap">
            <span>Office & Home</span>
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

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
