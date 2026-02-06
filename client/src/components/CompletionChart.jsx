import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function CompletionChart({ summary }) {
  const data = useMemo(() => {
    const labels = summary.map((s) => s.minister);
    const completions = summary.map((s) => s.completionRate);
    return {
      labels,
      datasets: [
        {
          label: 'Completion Rate %',
          data: completions,
          backgroundColor: '#2C7A7B', // civic-teal
          borderRadius: 4,
          barThickness: 24,
        },
      ],
    };
  }, [summary]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: false 
      },
      tooltip: {
        backgroundColor: '#0F213A',
        padding: 12,
        titleFont: { family: 'Inter', size: 13 },
        bodyFont: { family: 'Inter', size: 13 },
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: { 
        beginAtZero: true, 
        max: 100, 
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          borderDash: [4, 4],
          drawBorder: false,
        },
        ticks: { 
          callback: (v) => `${v}%`,
          font: { family: 'Inter', size: 11 },
          color: '#cbd5e1'
        },
        border: { display: false }
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { family: 'Inter', size: 11 },
          color: '#cbd5e1',
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45
        },
        border: { display: false }
      }
    },
  }), []);

  if (!summary?.length) return <div className="h-64 flex items-center justify-center text-civic-gray-400 text-sm">No data available</div>;
  
  return (
    <div className="h-80 w-full">
      <Bar data={data} options={options} />
    </div>
  );
}
