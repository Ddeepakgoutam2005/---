export default function Privacy() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-black dark:text-slate-100">Privacy & Disclaimer</h2>
      <div className="bg-white dark:bg-slate-800/70 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-2 text-black dark:text-slate-100">Educational Project</h3>
        <p className="text-slate-800 dark:text-slate-300 mb-4">
          This platform is an educational and research-oriented project to demonstrate tracking of political promises, public data aggregation, and visualization techniques. It is not an official government service and should not be used as a sole source for legal, financial, or policy decisions.
        </p>
        <h3 className="text-xl font-semibold mb-2 text-black dark:text-slate-100">Data Sources</h3>
        <p className="text-slate-800 dark:text-slate-300 mb-2">
          Data is compiled from publicly accessible sources:
        </p>
        <ul className="list-disc ml-6 text-slate-800 dark:text-slate-300">
          <li>Official ministerial bios and government portals (where available)</li>
          <li>News articles via RSS feeds using <code>rss-parser</code></li>
          <li>Curated seed datasets for ministers and sample promises</li>
          <li>Optionally, AI-assisted summaries via Gemini when a key is provided</li>
        </ul>
        <p className="text-slate-800 dark:text-slate-300 mt-4">
          Links to external sources are provided for transparency. We do not guarantee the accuracy or timeliness of third-party data.
        </p>
        <h3 className="text-xl font-semibold mt-6 mb-2 text-black dark:text-slate-100">Privacy</h3>
        <p className="text-slate-800 dark:text-slate-300">
          We do not collect personal data from visitors. Authentication is only required for admin actions such as importing data. Admin credentials are stored securely on your own environment and never shared.
        </p>
      </div>
    </div>
  );
}