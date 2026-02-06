export default function TrustSection() {
  return (
    <section id="methodology" className="py-12 border-b border-civic-gray-200 dark:border-white/10 mb-16">
      <div className="max-w-4xl mx-auto text-left">
        <h3 className="text-2xl font-bold text-civic-blue dark:text-civic-blue-light mb-8 border-l-4 border-civic-teal pl-4">
          Methodology & Verification
        </h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-civic-gray-800 dark:text-white mb-2">How Data is Collected</h4>
            <p className="text-civic-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              We aggregate data from official government press releases, parliamentary records, and verified news reports. Each promise is cross-referenced with at least two independent sources.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-civic-gray-800 dark:text-white mb-2">Verification Criteria</h4>
            <p className="text-civic-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              <strong className="text-civic-gray-900 dark:text-white">Fulfilled:</strong> Official government notification or physical completion verified.<br/>
              <strong className="text-civic-gray-900 dark:text-white">In Progress:</strong> Tender issued or budget allocated.<br/>
              <strong className="text-civic-gray-900 dark:text-white">Broken:</strong> Deadline passed with no action or official cancellation.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-civic-gray-800 dark:text-white mb-2">Neutrality Disclaimer</h4>
            <p className="text-civic-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              This platform is non-partisan and open-source. We do not accept funding from political parties. Data is automated where possible to reduce human bias.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-civic-gray-800 dark:text-white mb-2">Data Limitations</h4>
            <p className="text-civic-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Real-time updates may lag by 24-48 hours. Some "soft promises" (verbal assurances) are tracked but marked separately from manifesto commitments.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
