
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Problem from './components/Problem';
import BuildStudio from './components/BuildStudio';
import Solution from './components/Solution';
import SocialProof from './components/SocialProof';
import HowItWorks from './components/HowItWorks';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import Auth from './components/Auth';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'studio' | 'auth'>('landing');
  const [studioInitialTab, setStudioInitialTab] = useState<'architect' | 'library' | 'deployments'>('architect');
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session && view === 'auth') {
        setView('studio');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[ShipFast] Auth Event: ${event}`);
      setSession(session);
      
      if (session) {
        if (view === 'auth') setView('studio');
      } else {
        if (view === 'studio') setView('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, [view]);

  const openStudio = (tab: 'architect' | 'library' | 'deployments' = 'architect') => {
    setStudioInitialTab(tab);
    if (!session) {
      setView('auth');
    } else {
      setView('studio');
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const closeStudio = () => {
    setView('landing');
  };

  if (view === 'auth') {
    return <Auth onBack={() => setView('landing')} onSuccess={() => setView('studio')} />;
  }

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
      <Navbar onOpenStudio={openStudio} session={session} />
      
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
