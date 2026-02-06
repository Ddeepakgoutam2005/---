export default function Leaderboard({ summary = [] }) {
  if (!summary.length) return <div className="text-center text-civic-gray-500 dark:text-gray-400 py-8">No data available</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-white/5 border border-civic-gray-200 dark:border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-civic-gray-50 dark:bg-white/10 border-b border-civic-gray-200 dark:border-white/10">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-civic-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-4 text-xs font-semibold text-civic-gray-500 dark:text-gray-400 uppercase tracking-wider">Minister</th>
              <th className="px-6 py-4 text-xs font-semibold text-civic-gray-500 dark:text-gray-400 uppercase tracking-wider">Ministry</th>
              <th className="px-6 py-4 text-xs font-semibold text-civic-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Completion Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-civic-gray-100 dark:divide-white/10">
            {summary.slice(0, 10).map((s, idx) => (
              <tr key={`${s.minister}-${idx}`} className="hover:bg-civic-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-sm text-civic-gray-500 dark:text-gray-400 font-mono">#{idx + 1}</td>
                <td className="px-6 py-4 text-sm font-medium text-civic-gray-900 dark:text-white">{s.minister}</td>
                <td className="px-6 py-4 text-sm text-civic-gray-600 dark:text-gray-300">{s.ministry || 'General Administration'}</td>
                <td className="px-6 py-4 text-sm font-bold text-civic-teal dark:text-teal-400 text-right">{s.completionRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
