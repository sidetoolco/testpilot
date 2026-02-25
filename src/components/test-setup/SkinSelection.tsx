import React from 'react';
import { TestData } from '../../features/tests/types';

interface SkinSelectionProps {
  testData: TestData;
  setTestData: (data: TestData) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function SkinSelection({ testData, setTestData, onNext, onBack }: SkinSelectionProps) {
  const handleSkinChange = (skin: 'amazon' | 'walmart' | 'tiktokshop') => {
    setTestData({
      ...testData,
      skin
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Test Skin</h2>
        <p className="text-lg text-gray-600">
          Select the e-commerce interface that your testers will see during the test
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Amazon Skin Option */}
        <div 
          className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
            testData.skin === 'amazon' 
              ? 'border-orange-500 bg-orange-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleSkinChange('amazon')}
        >
          {testData.skin === 'amazon' && (
            <div className="absolute top-4 right-4">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">Amazon Skin</h3>
            <p className="text-gray-600 mb-4">
              Testers will see an Amazon-like shopping interface with dark header and orange accents
            </p>
            
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Dark header design</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Amazon-style product cards</span>
              </div>
            </div>
          </div>
        </div>

        {/* Walmart Skin Option */}
        <div 
          className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
            testData.skin === 'walmart' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleSkinChange('walmart')}
        >
          {testData.skin === 'walmart' && (
            <div className="absolute top-4 right-4">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"/>
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">Walmart Skin</h3>
            <p className="text-gray-600 mb-4">
              Testers will see a Walmart-like shopping interface with blue header and rounded design
            </p>
            
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Blue header design</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Walmart-style product cards</span>
              </div>
            </div>
          </div>
        </div>

        {/* TikTok Shop Skin Option */}
        <div
          className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
            testData.skin === 'tiktokshop'
              ? 'border-black bg-gray-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleSkinChange('tiktokshop')}
        >
          {testData.skin === 'tiktokshop' && (
            <div className="absolute top-4 right-4">
              <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}

          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-black p-3">
              <img src="/assets/images/tiktok-logo.png" alt="TikTok" className="h-full w-full object-contain" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">TikTok Shop Skin</h3>
            <p className="text-gray-600 mb-4">
              Testers will shop from real TikTok Shop products in a TikTok Shop-style interface
            </p>

            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-black rounded-full" />
                <span>Sidebar + carousels</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-black rounded-full" />
                <span>TikTok Shop products</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
