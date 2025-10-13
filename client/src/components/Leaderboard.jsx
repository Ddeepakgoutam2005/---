import { motion } from 'framer-motion';

export default function Leaderboard({ summary = [] }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-4">
        {summary.slice(0, 10).map((s, idx) => (
          <motion.div
            key={`${s.minister}-${idx}`}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-slate-800/70 p-4 rounded-lg shadow flex items-center justify-between"
          >
            <div>
              <div className="font-semibold">{s.minister}</div>
              <div className="text-sm text-slate-800 dark:text-slate-300">{s.ministry}</div>
            </div>
            <div className="text-green-600 font-semibold">{s.completionRate}%</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}