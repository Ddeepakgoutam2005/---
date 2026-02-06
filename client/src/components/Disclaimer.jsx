import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { FiInfo, FiX } from 'react-icons/fi';

const Disclaimer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Show disclaimer on route change
    setIsVisible(true);

    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] w-[90%] max-w-lg"
        >
          <div className="bg-white/10 dark:bg-black/80 backdrop-blur-md border border-civic-blue/30 dark:border-white/10 p-4 rounded-xl shadow-lg flex items-start gap-3">
            <div className="text-civic-blue dark:text-white mt-0.5">
              <FiInfo size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-civic-gray-800 dark:text-gray-200 leading-snug">
                Data is fetched from news channels. We are not involved in the content creation; our platform simply aggregates and displays politician data.
              </p>
            </div>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-civic-gray-500 dark:text-gray-400 hover:text-civic-blue dark:hover:text-white transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Disclaimer;
