import { useMemo } from 'react';

const StatusBadge = ({ status }) => {
  const styles = {
    completed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/20',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/20',
    broken: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/20',
    pending: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/20',
    unknown: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/20',
  };

  const label = status?.replace('_', ' ') || 'Unknown';
  const style = styles[status] || styles.unknown;

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} capitalize`}>
      {label}
    </span>
  );
};

export default function PromiseTracker({ promises = [] }) {
  const items = useMemo(() => {
    if (promises.length) {
      return [...promises].slice(0, 9); // Show top 9
    }
    return [];
  }, [promises]);

  if (!items.length) {
    return <div className="text-center text-civic-gray-500 dark:text-gray-400 py-12">No promises tracked yet.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((p, i) => (
        <div
          key={p._id || i}
          onClick={() => p.sourceUrl && window.open(p.sourceUrl, '_blank')}
          className={`group bg-white dark:bg-white/5 rounded-lg border border-civic-gray-200 dark:border-white/10 p-6 hover:shadow-md hover:border-civic-blue/30 transition-all duration-200 backdrop-blur-sm ${p.sourceUrl ? 'cursor-pointer' : ''}`}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold tracking-wider text-civic-gray-500 dark:text-gray-400 uppercase">
              {p.category || 'General'}
            </span>
            <StatusBadge status={p.status} />
          </div>

          <h4 className="text-lg font-semibold text-civic-gray-900 dark:text-white mb-3 leading-snug group-hover:text-civic-blue dark:group-hover:text-civic-blue-light transition-colors">
            {p.title}
          </h4>

          {p.description && (
            <p className="text-sm text-civic-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
              {p.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-civic-gray-100 dark:border-white/10 mt-auto">
            <div className="flex flex-col">
              <span className="text-xs text-civic-gray-400">Promised by</span>
              <span className="text-sm font-medium text-civic-gray-700 dark:text-gray-200">
                {p.minister?.name || 'Government of India'}
              </span>
            </div>
            
            {p.sourceUrl && (
              <a 
                href={p.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-medium text-civic-blue dark:text-blue-400 hover:underline z-10 ml-auto"
                onClick={(e) => e.stopPropagation()}
                title="View Source"
              >
                <span>Source</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
