import React, { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend, FiMinimize2 } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';
import { apiPost } from '../lib/api';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your political assistant. Ask me anything about Indian politicians, promises, or government policies.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare context: last 10 messages including system prompt is handled by backend
      const response = await apiPost('/api/chatbot/chat', { 
        messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })) 
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[70vh] bg-white dark:bg-[#111] border border-civic-gray-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-4 bg-civic-blue dark:bg-civic-blue/20 border-b border-civic-gray-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <h3 className="font-bold text-white dark:text-blue-100">Political Assistant</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <FiMinimize2 />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50 dark:bg-transparent">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-civic-blue text-white rounded-tr-sm'
                        : 'bg-white dark:bg-white/10 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/5 rounded-tl-sm shadow-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-white/10 p-3 rounded-2xl rounded-tl-sm border border-gray-200 dark:border-white/5 shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-civic-blue/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-civic-blue/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-civic-blue/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-black/20 border-t border-civic-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about politicians..."
                  className="flex-1 bg-gray-100 dark:bg-white/5 border border-transparent focus:border-civic-blue dark:focus:border-blue-500 rounded-full px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-civic-blue text-white rounded-full hover:bg-civic-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiSend className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 text-xs text-center text-gray-400 dark:text-gray-500">
                AI can make mistakes. Check important info.
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg z-50 transition-colors border border-transparent dark:border-white/20 ${
          isOpen 
            ? 'bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-white' 
            : 'bg-civic-blue text-white hover:bg-civic-blue/90 shadow-civic-blue/25 dark:shadow-white/5'
        }`}
      >
        {isOpen ? <FiX className="w-6 h-6" /> : <RiRobot2Line className="w-6 h-6" />}
      </motion.button>
    </>
  );
}
