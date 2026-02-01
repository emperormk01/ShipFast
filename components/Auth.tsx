
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthProps {
  onBack: () => void;
  onSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      // The redirect logic is handled by Supabase. App.tsx will pick up the session.
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("[Auth] Google Sign In Error:", err);
      setError(err.message || 'Failed to connect to Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background blobs for aesthetic depth */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none -z-10">
        <div className="absolute top-10 right-0 w-72 h-72 bg-slate-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-20 left-0 w-80 h-80 bg-slate-100 rounded-full blur-3xl opacity-40"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500 text-center px-4">
        <div 
          onClick={onBack}
          className="inline-flex justify-center mb-10 cursor-pointer group transition-transform hover:scale-105"
        >
          <div className="w-16 h-16 bg-black rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-slate-200">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-4xl font-extrabold text-black tracking-tight mb-4">
          The future of building <br /> starts here.
        </h2>
        <p className="max-w-xs mx-auto text-slate-500 text-lg leading-relaxed">
          Join 2,000+ builders shipping products daily with ShipFast.
        </p>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white py-12 px-10 border border-slate-100 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-full -mr-24 -mt-24 blur-3xl"></div>
          
          <div className="relative z-10 space-y-8 text-center">
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-4 py-5 px-4 rounded-2xl shadow-xl text-lg font-bold text-black bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all transform active:scale-[0.98] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="currentColor">
                {loading ? (
                   <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                ) : (
                  <>
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </>
                )}
              </svg>
              {loading ? 'Opening Google...' : 'Continue with Google'}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-bold text-center animate-in fade-in duration-300">
                {error}
              </div>
            )}

            <p className="text-center text-[10px] text-slate-400 font-medium px-4">
              By continuing, you agree to ShipFast's <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
           <button 
             onClick={onBack}
             className="inline-flex items-center gap-2 text-xs font-black text-slate-300 uppercase tracking-[0.2em] hover:text-slate-600 transition-colors group"
           >
             <span className="transition-transform group-hover:-translate-x-1">←</span> Back to Home
           </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
