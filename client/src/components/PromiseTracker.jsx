import { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function PromiseTracker({ promises = [] }) {
  const items = useMemo(() => {
    const fallback = [
      { title: 'Develop smart cities', status: 'in_progress', category: 'Infrastructure' },
      { title: 'Boost MSME sector', status: 'completed', category: 'Economy' },
      { title: 'Strengthen internal security', status: 'pending', category: 'Security' },
    ];
    return promises.length ? promises.slice(0, 6) : fallback;
  }, [promises]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((p, i) => (
        <motion.div
          key={p.title + i}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
          className="rounded-xl border border-slate-700 bg-slate-800/70 backdrop-blur p-5 shadow-sm hover:shadow-md"
        >
          <div className="text-sm text-slate-500 dark:text-slate-400">{p.category || 'General'}</div>
          <div className="font-semibold text-slate-800 dark:text-slate-100 mt-1">{p.title}</div>
          <div className="mt-3 inline-block px-3 py-1 rounded text-white text-xs"
               style={{ backgroundColor: p.status === 'completed' ? '#16a34a' : p.status === 'in_progress' ? '#2563eb' : p.status === 'broken' ? '#dc2626' : '#f59e0b' }}>
            {p.status?.replace('_', ' ') || 'pending'}
          </div>
        </motion.div>
      ))}
    </div>
  );
}