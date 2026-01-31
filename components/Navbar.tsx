
import React, { useState, useEffect } from 'react';

interface NavbarProps {
  onOpenStudio: (tab?: 'architect' | 'library') => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenStudio }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-black">ShipFast</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm font-medium text-slate-600 hover:text-black transition-colors">Home</button>
          <button onClick={() => onOpenStudio('library')} className="text-sm font-medium text-slate-600 hover:text-black transition-colors">Components</button>
          <a href="#problem" className="text-sm font-medium text-slate-600 hover:text-black transition-colors">The Problem</a>
          <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-black transition-colors">Process</a>
        </div>

        <button 
          onClick={() => onOpenStudio('architect')}
          className="bg-black hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
        >
          Launch Studio
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
