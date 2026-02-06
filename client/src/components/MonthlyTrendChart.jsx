import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function MonthlyTrendChart({ trend = [] }) {
  const data = useMemo(() => {
    const labels = trend.map(t => t.month);
    return {
      labels,
      datasets: [
        {
          label: 'Completion Rate %',
          data: trend.map(t => t.completionRate),
          borderColor: '#1e3a8a', // civic-blue
          backgroundColor: 'rgba(30, 58, 138, 0.1)',
          tension: 0.3,
        },
        {
          label: 'Total Promises',
          data: trend.map(t => t.total),
          borderColor: '#0f766e', // civic-teal
          backgroundColor: 'rgba(15, 118, 110, 0.1)',
          tension: 0.3,
        },
      ],
    };
  }, [trend]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: {
          font: { family: 'Inter, sans-serif' },
          usePointStyle: true,
        }
      },
      title: { 
        display: false, 
      },
      tooltip: { 
        mode: 'index', 
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e3a8a',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    interaction: { mode: 'index', intersect: false },
    scales: {
      y: { 
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { 
          color: '#cbd5e1',
          font: { family: 'Inter, sans-serif' } 
        }
      },
      x: {
        grid: { display: false },
        ticks: { 
          color: '#cbd5e1',
          font: { family: 'Inter, sans-serif' } 
        }
      }
    },
  }), []);

  if (!trend?.length) return null;
  return (
    <div className="bg-white dark:bg-white/5 border border-civic-gray-200 dark:border-white/10 rounded-xl p-6 shadow-sm h-80 backdrop-blur-sm">
      <h3 className="text-sm font-semibold text-civic-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Performance Trends</h3>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}