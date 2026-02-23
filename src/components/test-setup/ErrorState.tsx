import React from 'react';
import { AlertCircle, RefreshCw, Search } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  onNewSearch?: () => void;
}

export function ErrorState({ error, onRetry, onNewSearch }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <p className="text-gray-600 mb-4 text-center max-w-md">{error}</p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary-400 text-white rounded-lg hover:bg-primary-500 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
        {onNewSearch && (
          <button
            onClick={onNewSearch}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            <span>New Search</span>
          </button>
        )}
      </div>
    </div>
  );
}
