import React from 'react';
import { Search, MapPin, ShoppingCart } from 'lucide-react';

interface AmazonHeaderProps {
  searchTerm: string;
}

export default function AmazonHeader({ searchTerm }: AmazonHeaderProps) {
  return (
    <div className="bg-[#131921] text-white">
      <div className="max-w-screen-2xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src="https://wildfiresocial.com/wp-content/uploads/2019/01/amazon-logo-white._cb1509666198_.png"
                alt="Amazon"
                className="h-8"
              />
            </div>
            
            {/* Deliver To */}
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <div>
                <div className="text-[11px] text-gray-300">Deliver to</div>
                <div className="text-sm font-bold">United States</div>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-2xl">
              <div className="flex h-10">
                <div className="relative">
                  <select className="h-full px-3 bg-[#f3f3f3] border-r border-gray-300 rounded-l-md text-gray-800 text-sm appearance-none pr-8 hover:bg-[#dadada] cursor-pointer">
                    <option>All</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="border-4 border-transparent border-t-gray-400" style={{ marginTop: "2px" }}></div>
                  </div>
                </div>
                <input
                  type="text"
                  className="w-full px-4 py-2 border-0 bg-white text-gray-800 focus:outline-none"
                  value={searchTerm}
                  readOnly
                />
                <button className="px-6 bg-[#febd69] hover:bg-[#f3a847] rounded-r-md">
                  <Search className="h-5 w-5 text-gray-800" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-6">
            <div>
              <div className="text-[11px]">Hello, sign in</div>
              <div className="text-sm font-bold">Account & Lists</div>
            </div>
            <div>
              <div className="text-[11px]">Returns</div>
              <div className="text-sm font-bold">& Orders</div>
            </div>
            <div className="flex items-center">
              <ShoppingCart className="h-7 w-7" />
              <span className="text-sm font-bold ml-1">Cart</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}