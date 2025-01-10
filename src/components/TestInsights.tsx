import React from 'react';
import { Lightbulb, Users } from 'lucide-react';

interface Suggestion {
  text: string;
  supporters: string[];
}

interface UserBehavior {
  text: string;
  supporters: string[];
}

interface TestInsightsProps {
  suggestions: Suggestion[];
  behaviors: UserBehavior[];
  onClose: () => void;
}

export default function TestInsights({ suggestions, behaviors, onClose }: TestInsightsProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-3xl h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Test Insights</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-auto">
          <div className="space-y-8">
            {/* Suggestions Section */}
            <section>
              <div className="flex items-center space-x-2 mb-4">
                <Lightbulb className="h-6 w-6 text-primary-400" />
                <h3 className="text-lg font-semibold">Suggestions</h3>
              </div>
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="bg-white rounded-lg border p-4">
                    <p className="text-gray-900 mb-2">{suggestion.text}</p>
                    <div className="flex flex-wrap gap-1">
                      {suggestion.supporters.map((supporter, idx) => (
                        <div
                          key={idx}
                          className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-medium"
                        >
                          {supporter}
                        </div>
                      ))}
                      {suggestion.supporters.length > 3 && (
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm font-medium">
                          +{suggestion.supporters.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* User Behavior Section */}
            <section>
              <div className="flex items-center space-x-2 mb-4">
                <Users className="h-6 w-6 text-primary-400" />
                <h3 className="text-lg font-semibold">User Behavior</h3>
              </div>
              <div className="space-y-4">
                {behaviors.map((behavior, index) => (
                  <div key={index} className="bg-white rounded-lg border p-4">
                    <p className="text-gray-900 mb-2">{behavior.text}</p>
                    <div className="flex flex-wrap gap-1">
                      {behavior.supporters.map((supporter, idx) => (
                        <div
                          key={idx}
                          className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-medium"
                        >
                          {supporter}
                        </div>
                      ))}
                      {behavior.supporters.length > 3 && (
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm font-medium">
                          +{behavior.supporters.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}