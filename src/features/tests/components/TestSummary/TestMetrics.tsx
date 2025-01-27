import React, { useEffect, useState } from 'react';
import { Users, Target, Clock, TrendingUp } from 'lucide-react';
import { Test } from '../../../../types';
import { supabase } from '../../../../lib/supabase';

interface TestMetricsProps {
  test: Test;
}

export default function TestMetrics({ test }: TestMetricsProps) {
  const [sessionCount, setSessionCount] = useState<number>(0);

  useEffect(() => {
    const fetchSessionCount = async () => {
      const { data, error } = await supabase
        .from('testers_session') // Asegúrate de que este sea el nombre correcto de tu tabla
        .select('id', { count: 'exact' })
        .eq('test_id', test.id);

      if (error) {
        console.error('Error fetching session count:', error);
      } else {
        setSessionCount(data.length);
      }
    };

    fetchSessionCount();
  }, [test.id]);

  const metrics = [
    {
      icon: <Users className="h-6 w-6 text-[#00A67E]" />,
      title: "Total Testers",
      value: test.demographics.testerCount,
      subtitle: "Active participants"
    },
    {
      icon: <Target className="h-6 w-6 text-[#00A67E]" />,
      title: "Competitors",
      value: test.competitors.length,
      subtitle: "Products analyzed"
    },
    {
      icon: <Clock className="h-6 w-6 text-[#00A67E]" />,
      title: "Average Time",
      value: "12:30",
      subtitle: "Per session"
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-[#00A67E]" />,
      title: "Completion Rate",
      value: "85%",
      subtitle: "Of all sessions"
    },
    {
      icon: <Users className="h-6 w-6 text-[#00A67E]" />,
      title: "Active sessions",
      value: sessionCount,
      subtitle: "Sessions with this test ID"
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-gradient-to-br from-[#E3F9F3] to-[#F0FDFA] rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-[#00A67E] bg-opacity-10 rounded-full flex items-center justify-center">
              {metric.icon}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{metric.title}</h3>
              <p className="text-3xl font-semibold text-[#00A67E]">{metric.value}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">{metric.subtitle}</div>
        </div>
      ))}
    </div>
  );
}