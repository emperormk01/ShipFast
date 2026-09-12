
import React from 'react';
import ShipFastLogo from './ShipFastLogo';

const Footer: React.FC = () => {
  return (
    <footer className="py-12 border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <ShipFastLogo className="w-6 h-6 rounded-md" />
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
