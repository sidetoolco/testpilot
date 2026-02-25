import React from 'react';

interface ExperienceSelectionProps {
  selectedExperience: 'amazon' | 'walmart' | 'tiktokshop';
  onExperienceChange: (experience: 'amazon' | 'walmart' | 'tiktokshop') => void;
}

export default function ExperienceSelection({ selectedExperience, onExperienceChange }: ExperienceSelectionProps) {
  const handleKeySelect = (
    event: React.KeyboardEvent<HTMLDivElement>,
    experience: 'amazon' | 'walmart' | 'tiktokshop'
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onExperienceChange(experience);
    }
  };

  return (
    <div className="mt-8">
      <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 text-center">
        Choose your shopping experience
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Amazon Experience Option */}
        <div 
          className={`relative border-2 rounded-xl p-5 sm:p-6 cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 ${
            selectedExperience === 'amazon' 
              ? 'border-orange-500 bg-orange-50 shadow-sm' 
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
          onClick={() => onExperienceChange('amazon')}
          onKeyDown={event => handleKeySelect(event, 'amazon')}
          role="button"
          tabIndex={0}
          aria-pressed={selectedExperience === 'amazon'}
        >
          {selectedExperience === 'amazon' && (
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
              <img 
                src="/assets/images/amazon-icon.svg" 
                alt="Amazon" 
                className="w-8 h-8"
              />
            </div>
            
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Amazon Store Experience</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Testers will shop from actual Amazon products in a complete Amazon-like shopping interface
            </p>
            
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0 mt-1"></div>
                <span>Real Amazon products</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0 mt-1"></div>
                <span className="leading-tight">Complete Amazon experience</span>
              </div>
            </div>
          </div>
        </div>

        {/* Walmart Experience Option */}
        <div 
          className={`relative border-2 rounded-xl p-5 sm:p-6 cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 ${
            selectedExperience === 'walmart' 
              ? 'border-blue-500 bg-blue-50 shadow-sm' 
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
          onClick={() => onExperienceChange('walmart')}
          onKeyDown={event => handleKeySelect(event, 'walmart')}
          role="button"
          tabIndex={0}
          aria-pressed={selectedExperience === 'walmart'}
        >
          {selectedExperience === 'walmart' && (
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
              <img 
                src="/assets/images/walmart-icon.svg" 
                alt="Walmart" 
                className="w-8 h-8"
              />
            </div>
            
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Walmart Store Experience</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Testers will shop from actual Walmart products in a complete Walmart-like shopping interface
            </p>
            
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                <span>Real Walmart products</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                <span className="leading-tight">Complete Walmart experience</span>
              </div>
            </div>
          </div>
        </div>

        {/* TikTok Shop Experience Option */}
        <div
          className={`relative border-2 rounded-xl p-5 sm:p-6 cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 ${
            selectedExperience === 'tiktokshop'
              ? 'border-black bg-gray-50 shadow-sm'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
          onClick={() => onExperienceChange('tiktokshop')}
          onKeyDown={event => handleKeySelect(event, 'tiktokshop')}
          role="button"
          tabIndex={0}
          aria-pressed={selectedExperience === 'tiktokshop'}
        >
          {selectedExperience === 'tiktokshop' && (
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

            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">TikTok Shop Experience</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Testers will shop from real TikTok Shop products in a TikTok Shop-style interface
            </p>

            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 bg-black rounded-full flex-shrink-0 mt-1" />
                <span>TikTok Shop layout</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 bg-black rounded-full flex-shrink-0 mt-1" />
                <span className="leading-tight">Real TikTok Shop products</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
