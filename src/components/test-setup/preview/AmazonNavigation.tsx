import React from 'react';
import { Menu } from 'lucide-react';

export default function AmazonNavigation() {
  return (
    <>
      {/* Main Navigation */}
      <div className="bg-[#232f3e] text-white">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex items-center h-[39px]">
            <button className="flex items-center space-x-1 px-2 py-1 hover:border border-white">
              <Menu className="h-5 w-5" />
              <span>All</span>
            </button>
            <div className="flex items-center space-x-4 ml-4">
              <button className="px-2 py-1 hover:border border-white">Today's Deals</button>
              <button className="px-2 py-1 hover:border border-white">Customer Service</button>
              <button className="px-2 py-1 hover:border border-white">Registry</button>
              <button className="px-2 py-1 hover:border border-white">Gift Cards</button>
              <button className="px-2 py-1 hover:border border-white">Sell</button>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Navigation */}
      <div className="bg-[#232f3e] border-t border-[#3a4553] text-white">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex items-center h-[35px] text-sm">
            <button className="px-2 py-1 hover:border border-white">Same-Day Store</button>
            <button className="px-2 py-1 hover:border border-white">Beauty & Personal Care</button>
            <button className="px-2 py-1 hover:border border-white">Health & Wellness</button>
            <button className="px-2 py-1 hover:border border-white">Cleaning & Household</button>
            <button className="px-2 py-1 hover:border border-white">Home</button>
            <button className="px-2 py-1 hover:border border-white">Electronics</button>
          </div>
        </div>
      </div>
    </>
  );
}