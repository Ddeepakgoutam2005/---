import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-civic-gray-200 dark:border-white/20 bg-white dark:bg-white/5 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="text-civic-blue dark:text-white font-bold text-lg">Promise Tracker</div>
            <div className="text-civic-gray-500 dark:text-gray-400 text-sm">
              © 2025 Political Promise Tracker. An independent civic accountability initiative.
            </div>
          </div>
          
          <div className="flex gap-8 text-sm text-civic-gray-500 dark:text-gray-400 font-medium">
            <Link to="/privacy" className="hover:text-civic-blue dark:hover:text-white hover:underline hover:underline-offset-4 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
