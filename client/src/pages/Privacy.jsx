export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-8 max-w-4xl relative z-10">
      <h2 className="text-3xl font-bold text-civic-blue dark:text-civic-blue-light">Privacy & Disclaimer</h2>
      <div className="bg-white dark:bg-white/5 rounded-xl border border-civic-gray-200 dark:border-white/10 shadow-sm p-8 backdrop-blur-sm">
        <h3 className="text-xl font-bold mb-3 text-civic-gray-800 dark:text-white">Educational Project</h3>
        <p className="text-civic-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          This platform is an educational and research-oriented project to demonstrate tracking of political promises, public data aggregation, and visualization techniques. It is not an official government service and should not be used as a sole source for legal, financial, or policy decisions.
        </p>
        <h3 className="text-xl font-bold mb-3 text-civic-gray-800 dark:text-white">Data Sources</h3>
        <p className="text-civic-gray-600 dark:text-gray-300 mb-3">
          Data is compiled from publicly accessible sources:
        </p>
        <ul className="list-disc ml-6 text-civic-gray-600 dark:text-gray-300 space-y-2 mb-6">
          <li>Official ministerial bios and government portals (where available)</li>
          <li>News articles via RSS feeds using <code className="bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded text-sm">rss-parser</code></li>
          <li>Curated seed datasets for ministers and sample promises</li>
          <li>Optionally, AI-assisted summaries via Gemini when a key is provided</li>
        </ul>
        <p className="text-civic-gray-600 dark:text-gray-300 mb-6">
          Links to external sources are provided for transparency. We do not guarantee the accuracy or timeliness of third-party data.
        </p>
        <h3 className="text-xl font-bold mb-3 text-civic-gray-800 dark:text-white">Privacy</h3>
        <p className="text-civic-gray-600 dark:text-gray-300 leading-relaxed">
          We do not collect personal data from visitors. Authentication is only required for admin actions such as importing data. Admin credentials are stored securely on your own environment and never shared.
        </p>
      </div>
    </div>
  );
}