import React from 'react';
import { FileText } from 'lucide-react';
import { TestSession } from '../../../../types';

interface TesterInfoProps {
  session: TestSession;
}

export default function TesterInfo({ session }: TesterInfoProps) {
  return (
    <div className="w-80 bg-[#1B1B31] text-white p-6 flex flex-col">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-12 h-12 ${session.tester.color} rounded-full flex items-center justify-center text-gray-700 font-medium`}>
            {session.tester.initials}
          </div>
          <div>
            <h3 className="font-medium">{session.tester.name}</h3>
            <p className="text-sm text-gray-400">
              Age: {session.tester.age}, {session.tester.country}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span>💻 {session.device}</span>
          <span>•</span>
          <span>{session.date}</span>
        </div>
      </div>

      <div className="space-y-2">
        <button className="w-full flex items-center space-x-2 px-3 py-2 bg-white/10 rounded hover:bg-white/20">
          <FileText className="h-4 w-4" />
          <span className="text-sm">Download report (PDF)</span>
        </button>
      </div>
    </div>
  );
}