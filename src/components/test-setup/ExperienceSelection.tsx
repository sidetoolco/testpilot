import React from 'react';

interface ExperienceSelectionProps {
  selectedExperience: 'amazon' | 'walmart';
  onExperienceChange: (experience: 'amazon' | 'walmart') => void;
}

export default function ExperienceSelection({ selectedExperience, onExperienceChange }: ExperienceSelectionProps) {
  return (
    <div className="mt-8">
      <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
        Choose your shopping experience
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Amazon Experience Option */}
        <div 
          className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
            selectedExperience === 'amazon' 
              ? 'border-orange-500 bg-orange-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onExperienceChange('amazon')}
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
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">Amazon Experience</h3>
            <p className="text-gray-600 mb-4">
              Testers will see an Amazon-like shopping interface with orange header and familiar design
            </p>
            
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Orange header design</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Amazon-style product cards</span>
              </div>
            </div>
          </div>
        </div>

        {/* Walmart Experience Option */}
        <div 
          className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
            selectedExperience === 'walmart' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onExperienceChange('walmart')}
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
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"/>
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">Walmart Experience</h3>
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
      </div>
    </div>
  );
}
