
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
  const [initializing, setInitializing] = useState(true);
  const [studioInitialTab, setStudioInitialTab] = useState<'architect' | 'library' | 'deployments'>('architect');
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Check current session on mount
    const initAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      
      if (initialSession) {
        setView('studio');
      }
      setInitializing(false);
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log(`[ShipFast] Auth Event: ${event}`);
      setSession(newSession);
      
      if (newSession) {
        // Automatically switch to studio if a session is established
        setView('studio');
      } else {
        // Return to landing if signed out
        setView('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

  // Prevent UI flicker while checking session
  if (initializing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-100 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (view === 'auth') {
    return <Auth onBack={() => setView('landing')} onSuccess={() => setView('studio')} />;
  }

  if (view === 'studio' && session) {
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
