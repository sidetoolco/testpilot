import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SessionList } from './SessionList';
import { TestSession } from '../../types';

interface TestGroupProps {
  testName: string;
  sessions: TestSession[];
  isExpanded: boolean;
  onToggle: () => void;
}

export function TestGroup({ testName, sessions, isExpanded, onToggle }: TestGroupProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-4">
          <h3 className="text-xl font-medium text-gray-900">{testName}</h3>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-500">
              {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
            </span>
            <span className="text-[#00A67E]">
              {sessions.filter(s => s.outcome === 'selected_our_product').length} selected our product
            </span>
            <span className="text-[#F04438]">
              {sessions.filter(s => s.outcome === 'selected_competitor').length} selected competitor
            </span>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {isExpanded && <SessionList sessions={sessions} />}
    </div>
  );
}