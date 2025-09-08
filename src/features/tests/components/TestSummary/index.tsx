import { Test } from '../../../../types';
import TestMetrics from './TestMetrics';
import TestConfiguration from './TestConfiguration';
import TestStatus from './TestStatus';
import { DollarSign, Lightbulb, Package, Target } from 'lucide-react';
import { TestObjective } from '../../../../lib/enum';
import { useAdmin } from '../../../../hooks/useAdmin';

interface TestSummaryProps {
  test: Test;
}

const objectiveMap = {
  [TestObjective.PRICE_SENSITIVITY]: {
    icon: <DollarSign className="h-5 w-5" />,
    text: 'Price Sensitivity',
    color: 'text-blue-600',
  },
  [TestObjective.PACKAGE_DESIGN]: {
    icon: <Package className="h-5 w-5" />,
    text: 'Package Design',
    color: 'text-green-600',
  },
  [TestObjective.POSITIONING]: {
    icon: <Target className="h-5 w-5" />,
    text: 'Positioning',
    color: 'text-purple-600',
  },
  [TestObjective.IDEA_SCREENING]: {
    icon: <Lightbulb className="h-5 w-5" />,
    text: 'Idea Screening',
    color: 'text-yellow-600',
  },
};

const getObjectiveConfig = (objective: string | undefined) => {
  return objectiveMap[objective as TestObjective] || null;
};

export default function TestSummary({ test }: TestSummaryProps) {
  const { isAdmin } = useAdmin();

  if (!test) {
    return <div>Loading...</div>; // Optional loading state if test data is missing
  }

  const { name, createdAt, objective, status, companyName } = test;
  const objectiveConfig = getObjectiveConfig(objective);

  return (
    <div className="max-w-[1400px] mx-auto px-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-[2.5rem] text-[#1B1B1B] font-normal mb-2">
            {name} 
            {isAdmin && companyName && <span className="text-gray-500 mr-2 text-lg pl-2">- {companyName} </span>}
          </h1>
          <p className="text-gray-600">Created on {new Date(createdAt).toLocaleDateString()}</p>

          {objectiveConfig && (
            <div className="flex items-center gap-2 text-gray-600">
              <span>Objective:</span>
              <div className={`flex items-center gap-1 ${objectiveConfig.color}`}>
                {objectiveConfig.icon}
                <span>{objectiveConfig.text}</span>
              </div>
            </div>
          )}
        </div>
        <TestStatus status={status} />
      </div>

      <TestMetrics test={test} />
      <TestConfiguration test={test} />
    </div>
  );
}
