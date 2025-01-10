import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { useStore } from '../store/useStore';
import { mockRecordings } from '../data/mockRecordings';

// Import components
import InsightHeader from '../components/insights/InsightHeader';
import VariantComparison from '../components/insights/VariantComparison';
import PurchaseDrivers from '../components/insights/PurchaseDrivers';
import CommentsSection from '../components/insights/CommentsSection';
import AdditionalObservations from '../components/insights/AdditionalObservations';
import Recommendations from '../components/insights/Recommendations';
import TestRecordings from '../components/insights/TestRecordings';

export default function TestInsights() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { sessions } = useStore();
  const session = sessions.find(s => s.id === Number(id));

  if (!session) {
    return (
      <div className="min-h-screen bg-[#FFF8F8] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-2">Test not found</h2>
          <button
            onClick={() => navigate('/my-tests')}
            className="text-[#00A67E] hover:text-[#008F6B] hover:underline"
          >
            Return to tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F8]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/my-tests')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to tests</span>
              </button>
              <h1 className="text-xl font-semibold">{session.test}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50">
                <FileText className="h-4 w-4" />
                <span>Report PDF</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <InsightHeader session={session} />
          <TestRecordings recordings={mockRecordings} />
          <VariantComparison />
          <PurchaseDrivers />
          <CommentsSection />
          <AdditionalObservations />
          <Recommendations />
        </motion.div>
      </div>
    </div>
  );
}