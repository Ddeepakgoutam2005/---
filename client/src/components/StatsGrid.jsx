import { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function StatsGrid({ ministers = [], promises = [] }) {
  const stats = useMemo(() => {
    const total = promises.length;
    const completed = promises.filter(p => p.status === 'completed').length;
    const inProgress = promises.filter(p => p.status === 'in_progress').length;
    const broken = promises.filter(p => p.status === 'broken').length;
    const rate = total ? Math.round((completed / total) * 100) : 0;
    return [
      { label: 'Ministers', value: ministers.length, icon: 'fas fa-users', color: 'text-blue-600' },
      { label: 'Promises', value: total, icon: 'fas fa-handshake', color: 'text-green-600' },
      { label: 'Completed', value: completed, icon: 'fas fa-check-circle', color: 'text-orange-600' },
      { label: 'Success Rate', value: `${rate}%`, icon: 'fas fa-chart-line', color: 'text-purple-600' },
    ];
  }, [ministers, promises]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white dark:bg-slate-800/70 p-6 rounded-lg shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-800 dark:text-slate-300 text-sm">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
            <i className={`${s.icon} ${s.color} text-2xl`}></i>
          </div>
        </motion.div>
      ))}
    </div>
  );
}