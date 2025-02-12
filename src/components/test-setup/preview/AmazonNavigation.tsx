import { Menu } from 'lucide-react';

export default function AmazonNavigation() {
  return (
    <>
      {/* Main Navigation */}
      <div className="bg-[#232f3e] text-white">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex items-center h-[39px]">
            <button className="flex items-center space-x-1 px-2 py-1 cursor-not-allowed">
              <Menu className="h-5 w-5" />
              <span className="hidden md:block">All</span>
            </button>
            <div className="hidden md:flex items-center space-x-4 ml-4">
              <button className="px-2 py-1 cursor-not-allowed">Today's Deals</button>
              <button className="px-2 py-1 cursor-not-allowed">Customer Service</button>
              <button className="px-2 py-1 cursor-not-allowed">Registry</button>
              <button className="px-2 py-1 cursor-not-allowed">Gift Cards</button>
              <button className="px-2 py-1 cursor-not-allowed">Sell</button>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Navigation */}
      <div className="bg-[#232f3e] border-t border-[#3a4553] text-white">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="hidden md:flex items-center h-[35px] text-sm">
            <button className="px-2 py-1 cursor-not-allowed">Same-Day Store</button>
            <button className="px-2 py-1 cursor-not-allowed">Beauty & Personal Care</button>
            <button className="px-2 py-1 cursor-not-allowed">Health & Wellness</button>
            <button className="px-2 py-1 cursor-not-allowed">Cleaning & Household</button>
            <button className="px-2 py-1 cursor-not-allowed">Home</button>
            <button className="px-2 py-1 cursor-not-allowed">Electronics</button>
          </div>
        </div>
      </div>
    </>
  );
}