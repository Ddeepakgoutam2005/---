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
    const completed = promises.filter(p => p.status === 'completed').length;
    const inProgress = promises.filter(p => p.status === 'in_progress').length;
    const pending = promises.filter(p => p.status === 'pending').length;
    const broken = promises.filter(p => p.status === 'broken').length;
    return {
      labels: ['Completed', 'In Progress', 'Pending', 'Broken'],
      datasets: [{
        data: [completed, inProgress, pending, broken],
        backgroundColor: ['#16a34a', '#2563eb', '#f59e0b', '#dc2626'],
      }],
    };
  }, [promises]);

  if (!promises?.length) return null;
  return (
    <div className="rounded border p-3">
      <Pie data={data} />
    </div>
  );
}