export default function Hero({ onExploreMinisters, onViewAnalytics }) {
  return (
    <section className="bg-gradient-to-r from-saffron via-white to-green py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-black mb-4">Track Political Promises</h2>
        <p className="text-xl text-black mb-8">Accountability for Indian Democracy</p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button onClick={onExploreMinisters} className="bg-white/10 dark:bg-slate-800/80 text-blue-300 px-8 py-3 rounded-lg font-semibold hover:bg-white/20 dark:hover:bg-slate-700 transition-colors">
            Explore Ministers
          </button>
          <button onClick={onViewAnalytics} className="bg-white/10 dark:bg-slate-800/80 text-blue-300 px-8 py-3 rounded-lg font-semibold hover:bg-white/20 dark:hover:bg-slate-700 transition-colors">
            View Analytics
          </button>
        </div>
      </div>
    </section>
  );
}