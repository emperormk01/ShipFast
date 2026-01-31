
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
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  const openStudio = () => {
    setIsStudioOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeStudio = () => {
    setIsStudioOpen(false);
    document.body.style.overflow = 'unset';
  };

  return (
    <div className="min-h-screen selection:bg-black selection:text-white bg-white">
      <Navbar onBookDemo={openStudio} />
      <main>
        <Hero onBookDemo={openStudio} />
        <Problem />
        <Solution />
        <SocialProof />
        <HowItWorks />
        <FinalCTA onBookDemo={openStudio} />
      </main>
      <Footer />
      
      {/* Build Studio Modal Overlay */}
      <BuildStudio isOpen={isStudioOpen} onClose={closeStudio} />
    </div>
  );
};

export default App;
