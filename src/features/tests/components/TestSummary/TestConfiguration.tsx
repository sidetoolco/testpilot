import { Test } from '../../../../types';

interface TestConfigurationProps {
  test: Test;
}

export default function TestConfiguration({ test }: TestConfigurationProps) {
  return (
    <div className="overflow-y-auto pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-4">Test Configuration</h3>
          <div className="space-y-6">
            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">Search Term</div>
              <div className="text-gray-900 text-lg font-medium bg-gray-50 p-3 rounded-lg">{test.searchTerm}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">Competitors</div>
              <div className="flex flex-wrap gap-3">
                {test.competitors.map((competitor, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-200">
                    <img src={competitor.image_url} alt={competitor.title} className="w-10 h-10 object-contain rounded-md" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">Variations</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.values(test.variations).filter(v => v !== null).map((variation, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-200">
                    <img src={variation.image_url} alt={variation.title} className="w-10 h-10 object-contain rounded-md" />
                    <span className="text-sm font-medium text-gray-700" title={variation.title}>
                      {variation.title.length > 30 ? `${variation.title.substring(0, 30)}...` : variation.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-4">Demographics</h3>
          <div className="space-y-6">
            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">Age Ranges</div>
              <div className="flex flex-wrap gap-2">
                {test.demographics.ageRanges.map((age, index) => (
                  <span key={index} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors duration-200">
                    {age}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">Gender</div>
              <div className="flex flex-wrap gap-2">
                {test.demographics.gender.map((g, index) => (
                  <span key={index} className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-100 transition-colors duration-200">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">Locations</div>
              <div className="flex flex-wrap gap-2">
                {test.demographics.locations.map((location, index) => (
                  <span key={index} className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium hover:bg-green-100 transition-colors duration-200">
                    {location}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}