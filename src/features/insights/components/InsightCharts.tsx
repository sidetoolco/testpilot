import React from 'react';
import { Download } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        usePointStyle: true,
      }
    }
  },
  scales: {
    x: {
      type: 'category' as const,
      grid: {
        display: false
      }
    },
    y: {
      type: 'linear' as const,
      beginAtZero: true,
      grid: {
        display: false
      }
    }
  }
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        usePointStyle: true,
      }
    }
  }
};

export default function InsightCharts() {
  const purchaseFactors = {
    labels: ['Price', 'Quality', 'Brand', 'Packaging', 'Size', 'Claims'],
    datasets: [
      {
        label: 'Importance to Customer',
        data: [9.2, 8.8, 7.5, 6.9, 6.7, 8.1],
        backgroundColor: 'rgba(64, 224, 208, 0.5)'
      },
      {
        label: 'Our Performance',
        data: [6.4, 8.5, 8.7, 9.2, 6.9, 8.3],
        backgroundColor: 'rgba(255, 99, 132, 0.5)'
      }
    ]
  };

  const sentiment = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [{
      data: [75, 20, 5],
      backgroundColor: ['#00A67E', '#FFB547', '#FF4757']
    }]
  };

  return (
    <div className="grid grid-cols-2 gap-12">
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Purchase Factors Analysis</h2>
          <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <Download className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <div className="h-[400px]">
          <Bar 
            data={purchaseFactors} 
            options={chartOptions}
            key="purchase-factors-chart"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Overall Sentiment</h2>
          <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <Download className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <div className="h-[400px] flex items-center justify-center">
          <div className="w-3/4">
            <Pie 
              data={sentiment} 
              options={pieOptions}
              key="sentiment-chart" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}