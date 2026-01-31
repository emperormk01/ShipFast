
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-12 border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-black tracking-tight">ShipFast</span>
          </div>
          
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-black transition-colors">Twitter</a>
            <a href="#" className="hover:text-black transition-colors">GitHub</a>
            <a href="#" className="hover:text-black transition-colors">Discord</a>
            <a href="#" className="hover:text-black transition-colors">Changelog</a>
          </div>

          <div className="text-sm text-slate-400">
            © 2026 ShipFast Inc. Built for builders.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
