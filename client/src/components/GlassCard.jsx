export default function GlassCard({ className = '', children }) {
  return (
    <div
      className={`rounded-xl border border-white/30 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur shadow-sm hover:shadow-md transition ${className}`}
    >
      {children}
    </div>
  );
}