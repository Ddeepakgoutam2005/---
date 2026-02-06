import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet } from '../lib/api';
import { FiExternalLink, FiAlertCircle, FiCheckCircle, FiClock, FiActivity } from 'react-icons/fi';

export default function PromiseCard({ promise, user, onReport }) {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = async () => {
    setIsHovered(true);
    // Fetch related news logic remains as fallback or supplement
    if (!news && !loading) {
      setLoading(true);
      try {
        const data = await apiGet(`/api/promises/${promise._id}/related-news`);
        setNews(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const getGoogleNewsUrl = (type) => {
    // Format: Promise Title critics/advantages (no quotes)
    const suffix = type === 'critic' ? 'critics' : 'advantages';
    const query = `${promise.title} ${suffix}`;
    return `https://news.google.com/search?q=${encodeURIComponent(query)}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-civic-teal/10 dark:bg-teal-500/20 text-civic-teal dark:text-teal-400 border border-civic-teal/20 dark:border-teal-500/20">Fulfilled</span>;
      case 'in_progress':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-civic-blue/10 dark:bg-blue-500/20 text-civic-blue dark:text-blue-400 border border-civic-blue/20 dark:border-blue-500/20">In Progress</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-civic-gray-100 dark:bg-gray-500/20 text-civic-gray-600 dark:text-gray-400 border border-civic-gray-200 dark:border-gray-500/20">Pending</span>;
    }
  };

  const getSentimentColor = (classification) => {
    // classification might be 'critic', 'support', 'neutral'
    // Map to colors
    if (classification?.includes('support') || classification?.includes('positive')) return 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10';
    if (classification?.includes('critic') || classification?.includes('negative')) return 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10';
    return 'text-civic-gray-600 dark:text-gray-400 border-civic-gray-200 dark:border-gray-500/20 bg-civic-gray-50 dark:bg-white/5';
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white dark:bg-white/5 border border-civic-gray-200 dark:border-white/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm relative overflow-hidden group"
    >
      <div className="flex justify-between items-start gap-4 mb-3 relative z-10">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded text-xs font-semibold bg-civic-gray-100 dark:bg-white/10 text-civic-gray-600 dark:text-gray-300 uppercase tracking-wide">
            {promise.category}
          </span>
          {getStatusBadge(promise.status)}
        </div>
        {promise.sourceUrl && (
          <a 
            href={promise.sourceUrl} 
            target="_blank" 
            rel="noreferrer"
            className="text-civic-gray-400 dark:text-gray-500 hover:text-civic-blue dark:hover:text-blue-400 transition-colors"
            title="View Source"
          >
            <FiExternalLink />
          </a>
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-civic-gray-900 dark:text-white mb-2 relative z-10">{promise.title}</h3>
      <p className="text-civic-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed relative z-10">{promise.description}</p>
      
      <div className="flex items-center justify-between pt-4 border-t border-civic-gray-100 dark:border-white/10 relative z-10">
        <div className="flex items-center gap-4 text-xs text-civic-gray-500 dark:text-gray-400">
          {promise.timelineDate && (
            <span className="flex items-center gap-1">
              <FiClock className="w-3 h-3" />
              Target: {new Date(promise.timelineDate).toLocaleDateString()}
            </span>
          )}
        </div>
        
        {user && (
          <button 
            onClick={() => onReport({ relatedType: 'promise', relatedId: promise._id, title: promise.title })}
            className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline"
          >
            Report Issue
          </button>
        )}
      </div>

      {/* Animated News Section */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-civic-gray-100 dark:border-white/10">
                <div className="flex gap-2 mb-4">
                    <a 
                        href={getGoogleNewsUrl('success')}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 px-3 text-center text-xs font-medium rounded-md bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
                    >
                        View Success Reports
                    </a>
                    <a 
                        href={getGoogleNewsUrl('critic')}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 px-3 text-center text-xs font-medium rounded-md bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                    >
                        View Criticisms
                    </a>
                </div>

                <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-civic-gray-700 dark:text-gray-300">
                    <FiActivity className="text-civic-blue" />
                    <span>Media Coverage & Analysis</span>
                </div>
                
                {loading ? (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-civic-blue"></div>
                    </div>
                ) : news && news.length > 0 ? (
                    <div className="space-y-2">
                        {news.map((item, idx) => (
                            <motion.a
                                key={item._id || idx}
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`block p-3 rounded-lg border text-sm transition-transform hover:scale-[1.02] ${getSentimentColor(item.classification)}`}
                            >
                                <div className="font-medium mb-1 line-clamp-1">{item.headline}</div>
                                <div className="flex justify-between text-xs opacity-80">
                                    <span>{item.source}</span>
                                    <span className="capitalize">{item.classification}</span>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                ) : (
                    null
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
