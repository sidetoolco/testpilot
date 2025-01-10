import React from 'react';
import AmazonHeader from './AmazonHeader';
import AmazonNavigation from './AmazonNavigation';
import PreviewGrid from './PreviewGrid';
import { AmazonProduct } from '../../../features/amazon/types';

interface AmazonPreviewProps {
  searchTerm: string;
  products: AmazonProduct[];
}

export default function AmazonPreview({ searchTerm, products }: AmazonPreviewProps) {
  return (
    <div className="bg-[#EAEDED] min-h-[600px]">
      <AmazonHeader searchTerm={searchTerm} />
      <AmazonNavigation />
      
      <div className="max-w-screen-2xl mx-auto px-4 py-4">
        {/* Results Count */}
        <div className="bg-white p-4 mb-4 rounded-sm">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-[#565959]">
              {products.length} results for
            </span>
            <span className="text-sm font-bold text-[#0F1111]">
              "{searchTerm}"
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex gap-4">
          {/* Left Sidebar - Filters */}
          <div className="hidden lg:block w-56 shrink-0">
            <div className="bg-white p-4 rounded-sm">
              <h3 className="font-bold text-[#0F1111] text-sm mb-3">Department</h3>
              <ul className="text-sm space-y-2">
                <li className="text-[#007185] hover:text-[#C7511F] cursor-pointer">All Departments</li>
                <li className="text-[#007185] hover:text-[#C7511F] cursor-pointer">Home & Kitchen</li>
                <li className="text-[#007185] hover:text-[#C7511F] cursor-pointer">Health & Household</li>
              </ul>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <PreviewGrid products={products} />
          </div>
        </div>
      </div>
    </div>
  );
}