import { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StatusDistributionChart({ promises = [] }) {
  const data = useMemo(() => {
    const completed = promises.filter(p => p.status === 'completed').length + promises.filter(p => p.status === 'in_progress').length;
    const pending = promises.filter(p => p.status === 'pending').length;
    const broken = promises.filter(p => p.status === 'broken').length;
    return {
      labels: ['Fulfilled / In Progress', 'Pending', 'Broken'],
      datasets: [{
        data: [completed, pending, broken],
        backgroundColor: ['#059669', '#D97706', '#DC2626'], // civic-green, civic-amber, civic-red
        borderWidth: 0,
        hoverOffset: 4
      }],
    };
  }, [promises]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'Inter', size: 12 },
          color: '#cbd5e1',
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: '#0F213A',
        padding: 12,
        titleFont: { family: 'Inter', size: 13 },
        bodyFont: { family: 'Inter', size: 13 },
        cornerRadius: 8,
        displayColors: true,
      }
    },
    cutout: '60%',
  }), []);

  if (!promises?.length) return <div className="h-64 flex items-center justify-center text-civic-gray-400 text-sm">No data available</div>;
  
  return (
    <div className="h-80 w-full flex justify-center">
      <Pie data={data} options={options} />
    </div>
  );
}
