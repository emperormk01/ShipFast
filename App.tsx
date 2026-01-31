
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Problem from './components/Problem';
import BuildStudio from './components/BuildStudio';
import Solution from './components/Solution';
import SocialProof from './components/SocialProof';
import HowItWorks from './components/HowItWorks';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'studio'>('landing');
  const [studioInitialTab, setStudioInitialTab] = useState<'architect' | 'library' | 'deployments'>('architect');

  const openStudio = (tab: 'architect' | 'library' | 'deployments' = 'architect') => {
    console.log(`[ShipFast] Navigating to Build Studio - Tab: ${tab}`);
    setStudioInitialTab(tab);
    setView('studio');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const closeStudio = () => {
    console.log("[ShipFast] Returning to Landing Page");
    setView('landing');
  };

  if (view === 'studio') {
    return (
      <div className="min-h-screen bg-white selection:bg-black selection:text-white">
        <BuildStudio 
          initialTab={studioInitialTab} 
          onExit={closeStudio} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen selection:bg-black selection:text-white bg-white">
      <Navbar onOpenStudio={openStudio} />
      
      <main className="animate-in fade-in duration-700">
        <Hero onBookDemo={() => openStudio('architect')} />
        <Problem />
        <Solution />
        <SocialProof />
        <HowItWorks />
        <FinalCTA onBookDemo={() => openStudio('architect')} />
      </main>
      
      <Footer />
    </div>
  );
};

export default App;
