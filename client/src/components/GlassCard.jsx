export default function GlassCard({ className = '', children }) {
  return (
    <div
      className={`rounded-xl border border-white/30 dark:border-white/20 bg-white/60 dark:bg-white/10 backdrop-blur-md shadow-sm hover:shadow-md transition text-civic-gray-800 dark:text-gray-100 ${className}`}
    >
      {children}
    </div>
  );
}