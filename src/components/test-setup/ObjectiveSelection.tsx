import { DollarSign, Lightbulb, Package, Target } from 'lucide-react';
import { TestObjective } from '../../lib/enum';

const objectives = [
  {
    icon: <DollarSign />,
    title: 'Price Sensitivity',
    value: TestObjective.PRICE_SENSITIVITY,
    description:
      'Test how pricing affects interest and purchase. Identifies the best price point based on perceived value and conversion.',
  },
  {
    icon: <Package />,
    title: 'Package Design',
    value: TestObjective.PACKAGE_DESIGN,
    description:
      'Measure how packaging design influences appeal, trust, and purchase intent. Useful for validating or optimizing visual presentation.',
  },
  {
    icon: <Target />,
    title: 'Positioning',
    value: TestObjective.POSITIONING,
    description:
      'Evaluate which product claims build trust and drive clicks or buys. Helps to refine messaging clarity and impact.',
  },
  {
    icon: <Lightbulb />,
    title: 'Idea Screening',
    value: TestObjective.IDEA_SCREENING,
    description:
      'Test completely new product ideas, flavors and benefits. Identify which concepts excite consumers and which face confusion.',
  },
];

interface ObjectiveSelectionProps {
  onSelect: (objective: TestObjective) => void;
}

export default function ObjectiveSelection({ onSelect }: ObjectiveSelectionProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">Select Your Test Objective</h2>
        <p className="text-lg text-gray-500">
          Choose the primary goal for your test to help us optimize your results
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {objectives.map(objective => (
          <div
            key={objective.title}
            className="flex flex-col items-start p-6 rounded-xl border-2 transition-all text-left h-full border-gray-200 hover:border-[#00A67E]/30"
          >
            <div className="flex items-center space-x-3 mb-4 text-primary">
              {objective.icon}
              <h3 className="text-xl font-medium text-gray-900">{objective.title}</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">{objective.description}</p>
            <div className="mt-auto w-full flex justify-end pt-4">
              <button
                onClick={() => onSelect(objective.value)}
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90"
              >
                Select
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
