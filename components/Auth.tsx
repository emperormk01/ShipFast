
import React, { useState } from 'react';
import { signup, login } from '../lib/api';
import ShipFastLogo from './ShipFastLogo';

interface AuthProps {
  onBack: () => void;
  onSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onBack, onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'signup') {
        await signup(email, password, name || undefined);
      } else {
        await login(email, password);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
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
          <ShipFastLogo className="w-16 h-16 rounded-[1.5rem] shadow-2xl shadow-slate-200" />
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

          <div className="relative z-10">
            <div className="flex gap-2 mb-8 p-1 bg-slate-50 rounded-2xl">
              {(['signup', 'signin'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(null); }}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${mode === m ? 'bg-white text-black shadow-md' : 'text-slate-400 hover:text-black'}`}
                >
                  {m === 'signup' ? 'Create account' : 'Sign in'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={120}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 text-black placeholder:text-slate-300 outline-none focus:border-black transition-colors"
                />
              )}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 text-black placeholder:text-slate-300 outline-none focus:border-black transition-colors"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Password (10+ characters)' : 'Password'}
                required
                minLength={mode === 'signup' ? 10 : 1}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 text-black placeholder:text-slate-300 outline-none focus:border-black transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-5 px-4 rounded-2xl shadow-xl text-lg font-bold text-white bg-black hover:bg-slate-800 transition-all transform active:scale-[0.98] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Sign in'}
              </button>
            </form>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-bold text-center animate-in fade-in duration-300">
                {error}
              </div>
            )}

            <p className="mt-6 text-center text-[10px] text-slate-400 font-medium px-4">
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
