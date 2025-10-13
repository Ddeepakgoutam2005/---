export default function Footer() {
  return (
    <footer className="mt-16 bg-slate-900/60 backdrop-blur border-t border-slate-800">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between">
        <div className="text-slate-300">© {new Date().getFullYear()} Political Promise Tracker</div>
        <div className="flex gap-4 text-slate-300">
          <a href="#" className="hover:text-blue-600">About</a>
          <a href="/privacy" className="hover:text-blue-600">Privacy</a>
          <a href="#" className="hover:text-blue-600">Contact</a>
        </div>
      </div>
    </footer>
  );
}