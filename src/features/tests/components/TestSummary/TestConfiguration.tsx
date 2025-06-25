import { Test } from '../../../../types';

interface TestConfigurationProps {
  test: Test;
}

export default function TestConfiguration({ test }: TestConfigurationProps) {
  return (
    <div className="overflow-y-auto pb-10">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-4">
            Test Configuration
          </h3>
          <div className="space-y-6">
            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">Search Term</div>
              <div className="text-gray-900 text-lg font-medium bg-gray-50 p-3 rounded-lg">
                {test.searchTerm}
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
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors duration-200"
                  >
                    {age}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">Gender</div>
              <div className="flex flex-wrap gap-2">
                {test.demographics.gender.map((g, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-100 transition-colors duration-200"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">Locations</div>
              <div className="flex flex-wrap gap-2">
                {test.demographics.locations.map((location, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium hover:bg-green-100 transition-colors duration-200"
                  >
                    {location}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-4">Custom Screening</h3>
          <div className="space-y-6">
            {test.demographics.customScreening?.question ? (
              <>
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-2">Question</div>
                  <div className="text-gray-900 text-lg font-medium bg-gray-50 p-3 rounded-lg">
                    {test.demographics.customScreening.question}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-2">Expected Answer</div>
                  <div className="text-gray-900 text-lg font-medium bg-gray-50 p-3 rounded-lg">
                    {test.demographics.customScreening.validAnswer}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-gray-500 italic">No questions.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-4">Variants</h3>
          <div className="overflow-x-auto">
            {Object.values(test.variations).filter(Boolean).length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Image
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.values(test.variations)
                    .filter((v): v is NonNullable<typeof v> => v !== null)
                    .map((variation, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={variation.image_url || '/placeholder-image.jpg'}
                            alt={variation.title || 'Product image'}
                            className="w-16 h-16 object-contain rounded-md"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-image.jpg';
                            }}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {variation.title || 'Untitled Product'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ${variation.price || '0.00'}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <div className="text-gray-500 italic text-center py-8">
                No variations available.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-4">Competitors</h3>
          <div className="overflow-x-auto">
            {test.competitors && test.competitors.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Image
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {test.competitors.map((competitor, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={competitor.image_url || '/placeholder-image.jpg'}
                          alt={competitor.title || 'Product image'}
                          className="w-16 h-16 object-contain rounded-md"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-image.jpg';
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {competitor.title || 'Untitled Product'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${competitor.price || '0.00'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-gray-500 italic text-center py-8">
                No competitors available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
