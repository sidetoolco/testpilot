import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useStore } from '../store/useStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics() {
  const { products, testSessions } = useStore();

  const chartData = {
    labels: products.map(p => p.name),
    datasets: [
      {
        label: 'Views',
        data: products.map(() => Math.floor(Math.random() * 100)),
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
      },
      {
        label: 'Conversions',
        data: products.map(() => Math.floor(Math.random() * 20)),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Product Performance</h2>
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: false,
                },
              },
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Test Sessions</h2>
          <div className="space-y-4">
            {testSessions.map(session => (
              <div key={session.id} className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900">{session.name}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(session.startDate).toLocaleDateString()} - 
                  {new Date(session.endDate).toLocaleDateString()}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>Views: {session.metrics.views}</div>
                  <div>Clicks: {session.metrics.clicks}</div>
                  <div>Conversions: {session.metrics.conversions}</div>
                  <div>Avg Time: {session.metrics.averageTimeSpent}s</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}