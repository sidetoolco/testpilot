import { Test } from '../../../../types';
import { Users } from 'lucide-react';

interface TestMetricsProps {
  test: Test;
}

export default function TestMetrics({ test }: TestMetricsProps) {
  const variationCount = Object.values(test.variations).filter(
    variation => variation !== null
  ).length;
  
  const totalTesters = test.demographics.testerCount * variationCount;
  const completedSessions = test.completed_sessions || 0;
  const progressPercentage = Math.min((completedSessions / totalTesters) * 100, 100);
  
  const metrics = [
    {
      icon: <Users className="h-6 w-6 text-[#00A67E]" />,
      title: 'Completions',
      value: `${Math.round(progressPercentage)}%`,
      subtitle: `${totalTesters} testers`,
    },
    // {
    //   icon: <Target className="h-6 w-6 text-[#00A67E]" />,
    //   title: "Competitors",
    //   value: test.competitors.length,
    //   subtitle: "Products analyzed"

    // },
    // {
    //   icon: <Clock className="h-6 w-6 text-[#00A67E]" />,
    //   title: "Average Time",
    //   value: `${averageTime.toFixed(2)} min`,
    //   subtitle: "Per session ended"
    // },
    // {
    //   icon: <TrendingUp className="h-6 w-6 text-[#00A67E]" />,
    //   title: "Completion Rate",
    //   value: "85%",
    //   subtitle: "Of all sessions"
    // },
    // {
    //   icon: <Users className="h-6 w-6 text-[#00A67E]" />,
    //   title: "Active sessions",
    //   value: sessionCount,
    //   subtitle: "Sessions with this test ID"
    // }
  ];

  return (
    <div className="grid grid-cols-2 gap-6 mb-4">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-gradient-to-br from-[#E3F9F3] to-[#F0FDFA] rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-[#00A67E] bg-opacity-10 rounded-full flex items-center justify-center">
              {metric.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">
                {metric.title}
                <span className="text-sm font-normal text-gray-500 ml-2">({totalTesters} testers)</span>
              </h3>
              <p className="text-3xl font-semibold text-[#00A67E] mb-2">{metric.value} </p>
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-[#00A67E] h-2.5 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      ))}
      {test.status !== 'complete' && (
        <div className="bg-white rounded-xl p-6">
          <div className="flex flex-col items-center space-x-3 mb-2">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-4 w-full">
              Analysis per variant
            </h3>
            {Object.entries(test.variations).map(([variationName, value]) => {
              if (!value) return null;

              return (
                <div
                  className="flex items-center gap-2 w-full"
                  key={`variant-analysis-${variationName}`}
                >
                  <div className="w-2 h-2 rounded-full bg-[#00A67E]" />
                  <p>
                    <b>Variant {variationName.toUpperCase()}</b>: {value.prolificStatus || '-'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
