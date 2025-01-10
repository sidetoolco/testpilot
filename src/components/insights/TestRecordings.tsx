import React from 'react';
import { Clock, Download } from 'lucide-react';
import { Recording } from '../../types';

interface TestRecordingsProps {
  recordings: Recording[];
}

export default function TestRecordings({ recordings }: TestRecordingsProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Test Recordings</h3>
        <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50">
          <Download className="h-4 w-4" />
          <span>Download All</span>
        </button>
      </div>

      <div className="space-y-4">
        {recordings.map((recording) => (
          <div
            key={recording.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {/* Tester Info */}
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 ${recording.tester.color} rounded-full flex items-center justify-center text-gray-700 font-medium`}>
                {recording.tester.initials}
              </div>
              <div>
                <div className="font-medium text-gray-900">{recording.tester.name}</div>
                <div className="text-sm text-gray-500">Age: {recording.tester.age}</div>
              </div>
            </div>

            {/* Recording Info */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{recording.duration}</span>
              </div>
              <div className="text-sm text-gray-500">{recording.date}</div>
              <button className="px-4 py-2 text-[#00A67E] hover:text-[#008F6B] font-medium">
                View Recording
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}