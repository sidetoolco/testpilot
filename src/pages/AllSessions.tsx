import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function AllSessions() {
  const navigate = useNavigate();
  const { sessions } = useStore();
  const [expandedTests, setExpandedTests] = useState<Record<string, boolean>>({});

  // Group sessions by test name
  const sessionsByTest = sessions.reduce((acc, session) => {
    if (!acc[session.test]) {
      acc[session.test] = [];
    }
    acc[session.test].push(session);
    return acc;
  }, {} as Record<string, typeof sessions>);

  const toggleTest = (testName: string) => {
    setExpandedTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const totalSessions = sessions.length;
  const selectedOurProduct = sessions.filter(s => s.outcome === 'selected_our_product').length;
  const selectedCompetitor = sessions.filter(s => s.outcome === 'selected_competitor').length;

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-6">
      <h1 className="text-[2.5rem] text-[#1B1B1B] font-normal mb-6">Sessions</h1>

      <div className="flex items-center space-x-4 mb-8">
        <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium">
          All Sessions <span className="ml-1 bg-gray-700 text-white px-2 py-0.5 rounded-full text-sm">{totalSessions}</span>
        </div>
        <div className="px-4 py-2 bg-[#E3F9F3] text-[#00A67E] rounded-full font-medium">
          Selected our product <span className="ml-1 bg-[#00A67E] text-white px-2 py-0.5 rounded-full text-sm">{selectedOurProduct}</span>
        </div>
        <div className="px-4 py-2 bg-[#FEE4E2] text-[#F04438] rounded-full font-medium">
          Selected competitor <span className="ml-1 bg-[#F04438] text-white px-2 py-0.5 rounded-full text-sm">{selectedCompetitor}</span>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(sessionsByTest).map(([testName, testSessions]) => (
          <div key={testName} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggleTest(testName)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <h3 className="text-xl font-medium text-gray-900">{testName}</h3>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-500">
                    {testSessions.length} {testSessions.length === 1 ? 'session' : 'sessions'}
                  </span>
                  <span className="text-[#00A67E]">
                    {testSessions.filter(s => s.outcome === 'selected_our_product').length} selected our product
                  </span>
                </div>
              </div>
              {expandedTests[testName] ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {expandedTests[testName] && (
              <div className="divide-y divide-gray-100">
                {testSessions.map((session) => (
                  <div 
                    key={session.id} 
                    className="p-4 flex items-center space-x-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => navigate(`/sessions/${session.id}`)}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="relative">
                        <span className={`absolute -left-2 -top-2 w-3 h-3 ${
                          session.outcome === 'selected_our_product' ? 'bg-[#00A67E]' : 'bg-[#F04438]'
                        } border-2 border-white rounded-full`}></span>
                        <div className={`w-12 h-12 ${session.tester.color} rounded-full flex items-center justify-center text-gray-700 font-medium`}>
                          {session.tester.initials}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium">{session.tester.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{session.tester.country}</span>
                          <span>•</span>
                          <span>{session.tester.gender}</span>
                          <span>•</span>
                          <span>{session.tester.age}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-8">
                      <div className={`px-3 py-1 rounded-full ${
                        session.outcome === 'selected_our_product' 
                          ? 'bg-[#E3F9F3] text-[#00A67E]' 
                          : 'bg-[#FEE4E2] text-[#F04438]'
                      }`}>
                        {session.outcome === 'selected_our_product' ? 'Selected our product' : 'Selected competitor'}
                      </div>
                      <span className="text-gray-500">💻 {session.device}</span>
                      <span className="text-gray-500">{session.date}</span>
                      <span className="text-gray-500">💬 {session.comments}</span>
                      <span className="bg-[#00A67E] text-white px-3 py-1 rounded-full">
                        {session.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}