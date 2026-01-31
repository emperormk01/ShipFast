
import React from 'react';

const Problem: React.FC = () => {
  return (
    <section id="problem" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Building is fun. <br className="md:hidden" />
            Configuring is a nightmare.
          </h2>
          <p className="text-lg text-slate-600">
            You spend 70% of your time on setup, auth, database schemas, and CSS bugs. 
            By the time you're ready for core features, the momentum is gone.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black mb-3">Wasted Weeks</h3>
            <p className="text-slate-600">Spending hours tweaking Tailwind configs and fixing Next.js routing issues instead of talking to users.</p>
          </div>

          <div className="p-8 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black mb-3">Messy Handoffs</h3>
            <p className="text-slate-600">The gap between "Idea" and "Live URL" is filled with broken UI, inconsistent types, and deployment errors.</p>
          </div>

          <div className="p-8 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black mb-3">Zero Momentum</h3>
            <p className="text-slate-600">Projects stall because starting from scratch is exhausting. You need a platform that moves as fast as you think.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;
