import { Test } from '../../../../types';
import TestMetrics from './TestMetrics';
import TestConfiguration from './TestConfiguration';
import TestStatus from './TestStatus';

interface TestSummaryProps {
  test: Test;
}

export default function TestSummary({ test }: TestSummaryProps) {
  return (
    <div className="max-w-[1400px] mx-auto px-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-[2.5rem] text-[#1B1B1B] font-normal mb-2">{test.name}</h1>
          <p className="text-gray-600">Created on {new Date(test.createdAt).toLocaleDateString()}</p>
        </div>
        <TestStatus status={test.status as 'draft' | 'active' | 'complete'} />
      </div>

      <TestMetrics test={test} />
      <TestConfiguration test={test} />
    </div>
  );
}