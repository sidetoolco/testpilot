import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { TestSession } from '../../types';

interface SessionListProps {
  sessions: TestSession[];
}

export function SessionList({ sessions }: SessionListProps) {
  const navigate = useNavigate();

  const getOutcomeLabel = (outcome: string) => {
    switch (outcome) {
      case 'selected_our_product':
        return (
          <span className="flex items-center space-x-1 text-[#00A67E]">
            <CheckCircle className="h-4 w-4" />
            <span>Selected our product</span>
          </span>
        );
      case 'selected_competitor':
        return (
          <span className="flex items-center space-x-1 text-[#F04438]">
            <XCircle className="h-4 w-4" />
            <span>Selected competitor</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="divide-y divide-gray-100">
      {sessions.map((session) => (
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
            {getOutcomeLabel(session.outcome)}
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
  );
}