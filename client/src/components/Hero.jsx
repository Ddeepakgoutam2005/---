import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="bg-white/30 backdrop-blur-sm dark:bg-transparent py-24 md:py-32 relative z-10">
      <div className="container mx-auto px-6 text-center max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-bold text-civic-blue dark:text-white mb-6 leading-tight tracking-tight">
          Tracking Political Promises.<br />
          <span className="text-civic-teal dark:text-civic-teal-light">Measuring Accountability.</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-civic-gray-600 dark:text-gray-300 mb-10 leading-relaxed font-normal">
          An independent platform that tracks promises made by ministers and political parties using publicly available data.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => navigate('/promises')} 
            className="px-8 py-4 bg-civic-blue dark:bg-civic-red text-white rounded-xl font-semibold text-lg hover:bg-civic-blue-light dark:hover:bg-red-700 transition-colors shadow-sm w-full sm:w-auto"
          >
            Explore Promises
          </button>
          
          <button 
            onClick={() => document.getElementById('methodology')?.scrollIntoView({ behavior: 'smooth' })} 
            className="px-8 py-4 bg-white dark:bg-white/10 text-civic-gray-700 dark:text-white border border-civic-gray-300 dark:border-white/20 rounded-xl font-medium text-lg hover:bg-civic-gray-50 dark:hover:bg-white/20 hover:text-civic-blue dark:hover:text-white transition-colors w-full sm:w-auto"
          >
            How We Verify Data
          </button>
        </div>
      </div>
    </section>
  );
}
