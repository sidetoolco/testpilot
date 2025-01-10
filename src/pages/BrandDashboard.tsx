import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Users2, CheckCircle, Clock, MoreHorizontal, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BrandDashboard() {
  const navigate = useNavigate();
  
  const [testSessions] = React.useState([
    {
      id: 1,
      name: 'New Lavender Fabric Softener Test',
      type: 'Fabric Softener',
      testers: '8 of 10 testers',
      newSessions: '3 new sessions',
      status: 'in-progress',
      date: 'Nov 21, 2024',
      insights: {
        views: 245,
        conversions: 32,
        avgTime: '12:16'
      }
    },
    {
      id: 2,
      name: 'Spring Fresh vs Competitors',
      type: 'Fabric Softener',
      testers: '10 of 10 testers',
      status: 'completed',
      date: 'Nov 18, 2024',
      insights: {
        views: 312,
        conversions: 45,
        avgTime: '10:45'
      }
    }
  ]);

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-[2.5rem] text-[#1B1B1B] font-normal">Dashboard</h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/create-test')}
          className="flex items-center space-x-2 px-6 py-3 bg-[#0A0A29] text-white rounded-xl hover:bg-[#1a1a3a] transition-colors shadow-sm hover:shadow-md"
        >
          <Plus className="h-5 w-5" />
          <span>Create New Test</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#E3F9F3] to-[#F0FDFA] rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-[#00A67E] bg-opacity-10 rounded-full flex items-center justify-center">
              <PlayCircle className="h-6 w-6 text-[#00A67E]" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Active Tests</h3>
              <p className="text-3xl font-semibold text-[#00A67E]">
                {testSessions.filter(t => t.status === 'in-progress').length}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {testSessions.filter(t => t.status === 'completed').length} completed tests
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#F0F7FF] to-[#F8FAFF] rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-[#2E90FA] bg-opacity-10 rounded-full flex items-center justify-center">
              <Users2 className="h-6 w-6 text-[#2E90FA]" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Total Testers</h3>
              <p className="text-3xl font-semibold text-[#2E90FA]">18</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            +5 new this week
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {testSessions.map((session) => (
          <div 
            key={session.id} 
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/test-insights/${session.id}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full ${
                  session.status === 'completed' ? 'bg-[#E3F9F3]' : 'bg-blue-50'
                } flex items-center justify-center`}>
                  {session.status === 'completed' ? (
                    <CheckCircle className="h-6 w-6 text-[#00A67E]" />
                  ) : (
                    <Clock className="h-6 w-6 text-blue-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-[#1B1B1B]">{session.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{session.type}</span>
                    <span>•</span>
                    <span>{session.testers}</span>
                    {session.newSessions && (
                      <>
                        <span>•</span>
                        <span className="text-[#00A67E]">{session.newSessions}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Views</div>
                    <div className="font-medium">{session.insights.views}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Conversions</div>
                    <div className="font-medium">{session.insights.conversions}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Avg. Time</div>
                    <div className="font-medium">{session.insights.avgTime}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-500">{session.date}</span>
                  <button 
                    className="p-2 hover:bg-gray-100 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add your menu logic here
                    }}
                  >
                    <MoreHorizontal className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}