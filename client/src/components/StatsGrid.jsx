import { useMemo } from 'react';

export default function StatsGrid({ ministers = [], promises = [] }) {
  const stats = useMemo(() => {
    const total = promises.length;
    const completed = promises.filter(p => p.status === 'completed' || p.status === 'in_progress').length;
    const rate = total ? Math.round((completed / total) * 100) : 0;
    
    return [
      { 
        label: 'Ministers Tracked', 
        value: ministers.length, 
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
        color: 'text-civic-blue dark:text-blue-400',
        bg: 'bg-civic-blue/10 dark:bg-blue-500/20'
      },
      { 
        label: 'Promises Logged', 
        value: total, 
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        color: 'text-civic-teal dark:text-teal-400',
        bg: 'bg-civic-teal/10 dark:bg-teal-500/20'
      },
      { 
        label: 'Promises Fulfilled', 
        value: completed, 
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'text-civic-green dark:text-green-400',
        bg: 'bg-civic-green/10 dark:bg-green-500/20'
      },
      { 
        label: 'Avg Success Rate', 
        value: `${rate}%`, 
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        ),
        color: 'text-civic-amber dark:text-amber-400',
        bg: 'bg-civic-amber/10 dark:bg-amber-500/20'
      },
    ];
  }, [ministers, promises]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white dark:bg-white/5 border border-civic-gray-200 dark:border-white/10 p-6 rounded-xl flex items-center justify-between hover:shadow-sm transition-shadow backdrop-blur-sm"
        >
          <div>
            <p className="text-civic-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
          <div className={`p-3 rounded-lg ${s.bg} ${s.color}`}>
            {s.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
