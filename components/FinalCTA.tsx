
import React from 'react';

interface FinalCTAProps {
  onBookDemo: () => void;
}

const FinalCTA: React.FC<FinalCTAProps> = ({ onBookDemo }) => {
  return (
    <section className="py-24 relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-slate-50 -z-10"></div>
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="p-12 md:p-20 rounded-[3rem] bg-gradient-to-b from-white to-slate-100 border border-slate-200 relative shadow-2xl overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-slate-200/50 rounded-full blur-3xl"></div>
          
          <h2 className="text-4xl md:text-6xl font-extrabold text-black mb-6 leading-tight relative z-10">
            Ready to reclaim <br /> your weekends?
          </h2>
          <p className="text-lg text-slate-600 mb-10 relative z-10 max-w-xl mx-auto">
            Join 2,000+ indie hackers and teams shipping better products faster.
            No credit card required. No lock-in. Just plans.
          </p>

          <div className="flex flex-col items-center gap-6 relative z-10">
            <button
              onClick={onBookDemo}
              className="px-10 py-5 bg-black hover:bg-slate-800 text-white rounded-2xl font-bold text-xl transition-all shadow-xl shadow-slate-200 transform hover:-translate-y-1"
            >
              Start planning
            </button>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Immediate access after the call
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
