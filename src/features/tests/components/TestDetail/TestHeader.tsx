import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { TestSession } from '../../../../types';

interface TestHeaderProps {
  session: TestSession;
  onBack: () => void;
  shoppingStarted: boolean;
}

export default function TestHeader({ session, onBack, shoppingStarted }: TestHeaderProps) {
  return (
    <>
      {/* TestPilot Navigation */}
      <div className="bg-[#1B1B31] text-white">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="flex items-center space-x-2 text-white/80 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Go back</span>
            </button>
            <h1 className="text-lg font-medium">{session.test}</h1>
          </div>
        </div>
      </div>

      {/* Amazon Header */}
      {shoppingStarted && (
        <div className="bg-[#232F3E] text-white border-b border-[#3B4F68]">
          <div className="max-w-screen-2xl mx-auto px-4 py-2">
            <div className="flex items-center space-x-4">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
                alt="Amazon"
                className="h-8 brightness-0 invert"
              />
              <div className="text-sm font-medium">Shopping Experience Preview</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}