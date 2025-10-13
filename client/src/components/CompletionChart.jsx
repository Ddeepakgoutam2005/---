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
          backgroundColor: '#0a5',
        },
      ],
    };
  }, [summary]);

  const options = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Promise Completion Rate by Minister' },
    },
    scales: {
      y: { beginAtZero: true, max: 100, ticks: { callback: (v) => `${v}%` } },
    },
  }), []);

  if (!summary?.length) return null;
  return (
    <div className="rounded border p-3">
      <Bar data={data} options={options} />
    </div>
  );
}