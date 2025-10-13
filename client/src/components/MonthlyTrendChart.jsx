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
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.2)',
          tension: 0.3,
        },
        {
          label: 'Total Promises',
          data: trend.map(t => t.total),
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22, 163, 74, 0.2)',
          tension: 0.3,
        },
      ],
    };
  }, [trend]);

  const options = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Monthly Promise Trends' },
      tooltip: { mode: 'index', intersect: false },
    },
    interaction: { mode: 'index', intersect: false },
    scales: {
      y: { beginAtZero: true },
    },
  }), []);

  if (!trend?.length) return null;
  return (
    <div className="rounded border p-3">
      <Line data={data} options={options} />
    </div>
  );
}