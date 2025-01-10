import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, PlayCircle, Users2, Clock, CheckCircle } from 'lucide-react';
import { useTests } from '../features/tests/hooks/useTests';

export default function MyTests() {
  const navigate = useNavigate();
  const { tests, loading } = useTests();

  // Calculate statistics
  const activeTests = tests.filter(s => s.status === 'active').length;
  const completedTests = tests.filter(s => s.status === 'completed').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-[2.5rem] text-[#1B1B1B] font-normal">My Tests</h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/create-test')}
          className="flex items-center space-x-2 px-6 py-3 bg-[#0A0A29] text-white rounded-xl hover:bg-[#1a1a3a] transition-colors shadow-lg hover:shadow-xl"
        >
          <Plus className="h-5 w-5" />
          <span>Create New Test</span>
        </motion.button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-[#E3F9F3] to-[#F0FDFA] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-[#00A67E] bg-opacity-10 rounded-full flex items-center justify-center">
              <PlayCircle className="h-7 w-7 text-[#00A67E]" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-900">Active Tests</h3>
              <p className="text-4xl font-semibold text-[#00A67E] mt-1">{activeTests}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-[#F0F7FF] to-[#F8FAFF] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-[#2E90FA] bg-opacity-10 rounded-full flex items-center justify-center">
              <Users2 className="h-7 w-7 text-[#2E90FA]" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-900">Completed Tests</h3>
              <p className="text-4xl font-semibold text-[#2E90FA] mt-1">{completedTests}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Test List */}
      <div className="space-y-4">
        {tests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tests yet</h3>
            <p className="text-gray-500 mb-4">Create your first test to get started</p>
            <button
              onClick={() => navigate('/create-test')}
              className="px-6 py-3 bg-primary-400 text-white rounded-xl hover:bg-primary-500"
            >
              Create New Test
            </button>
          </div>
        ) : (
          tests.map((test) => (
            <motion.div 
              key={test.id} 
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/tests/${test.id}`)}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full ${
                    test.status === 'completed' ? 'bg-[#E3F9F3]' : 'bg-blue-50'
                  } flex items-center justify-center`}>
                    {test.status === 'completed' ? (
                      <CheckCircle className="h-6 w-6 text-[#00A67E]" />
                    ) : (
                      <Clock className="h-6 w-6 text-blue-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-[#1B1B1B]">{test.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>Search term: {test.searchTerm}</span>
                      <span>•</span>
                      <span className={`${
                        test.status === 'completed' ? 'text-[#00A67E]' : 'text-blue-500'
                      }`}>
                        {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-gray-500">
                    {new Date(test.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}