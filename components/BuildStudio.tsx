
import React, { useState, useEffect } from 'react';
import { ScaffolderResponse } from '../types';

interface BuildStudioProps {
  isOpen: boolean;
  onClose: () => void;
}

const BuildStudio: React.FC<BuildStudioProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScaffolderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  const generateSchema = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const parsed: ScaffolderResponse = await response.json();
      setResult(parsed);
    } catch (err: any) {
      console.error("Scaffolding failed:", err);
      setError(err.message || "Failed to generate scaffold. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadProject = () => {
    if (!result) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${result.projectName.toLowerCase().replace(/\s+/g, '-')}-scaffold.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-white/60 backdrop-blur-xl transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-5xl max-h-[90vh] bg-white border border-slate-200 rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col transition-all duration-500 transform ${isOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-95 opacity-0'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white/50 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-black tracking-tight">AI Build Studio</h2>
              <p className="text-xs text-slate-400 font-medium">Drafting the future of your SaaS</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-black transition-all"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {!result && !isLoading ? (
            <div className="max-w-2xl mx-auto py-12 text-center animate-in fade-in zoom-in-95 duration-500">
              <h3 className="text-3xl font-bold text-black mb-4">What are we building?</h3>
              <p className="text-slate-500 mb-12">Describe your idea. Be as specific as you want about features, tech, and goals.</p>
              
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-slate-200 to-slate-300 rounded-3xl blur opacity-20 group-focus-within:opacity-100 transition duration-500"></div>
                <div className="relative bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. A marketplace for high-end mechanical keyboard switches with user profiles, reviews, and Stripe integration..."
                    className="w-full h-40 p-8 text-xl focus:outline-none resize-none placeholder:text-slate-200"
                  />
                  <div className="flex items-center justify-between px-8 py-6 bg-slate-50/50 border-t border-slate-100">
                    <div className="flex gap-2">
                       <span className="w-2 h-2 rounded-full bg-slate-200"></span>
                       <span className="w-2 h-2 rounded-full bg-slate-200"></span>
                       <span className="w-2 h-2 rounded-full bg-slate-200"></span>
                    </div>
                    <button
                      onClick={generateSchema}
                      disabled={!prompt.trim()}
                      className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl ${
                        !prompt.trim() 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                          : 'bg-black text-white hover:bg-slate-800 active:scale-95 shadow-slate-200'
                      }`}
                    >
                      Generate Scaffold
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 animate-in fade-in duration-500">
              <div className="relative w-20 h-20 mb-8">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-black rounded-full border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-2xl font-bold text-black mb-2 animate-pulse">Architecting your vision...</h3>
              <p className="text-slate-400">Securely consulting Gemini 3 Pro</p>
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h3 className="text-4xl font-extrabold text-black tracking-tight">{result?.projectName}</h3>
                  <p className="text-slate-500 mt-2">Generated Blueprint V1.0</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => {setResult(null); setPrompt(''); setError(null);}}
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm"
                  >
                    Start Over
                  </button>
                  <button 
                    onClick={downloadProject}
                    className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-slate-800 transition-all text-sm flex items-center gap-2 shadow-lg shadow-slate-200"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Config
                  </button>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                {/* SQL Schema */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-black">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-black uppercase tracking-widest">Database Schema</span>
                  </div>
                  <div className="bg-slate-900 rounded-2xl p-8 font-mono text-sm text-slate-300 overflow-x-auto border border-slate-800 shadow-inner group relative">
                    <button 
                      onClick={() => navigator.clipboard.writeText(result?.databaseSchema || '')}
                      className="absolute top-4 right-4 p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-3 8h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    </button>
                    <pre className="leading-relaxed"><code>{result?.databaseSchema}</code></pre>
                  </div>
                </div>

                {/* API Routes */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-black">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-black uppercase tracking-widest">API Infrastructure</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-sm">
                    {result?.apiRoutes.map((route, idx) => (
                      <div key={idx} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-4">
                          <span className={`text-[11px] font-black px-3 py-1 rounded-md tracking-tighter ${
                            route.method === 'GET' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                            route.method === 'POST' ? 'bg-green-50 text-green-600 border border-green-100' :
                            'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {route.method}
                          </span>
                          <span className="text-sm font-mono font-semibold text-black">{route.path}</span>
                        </div>
                        <span className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors">{route.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Components */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-black">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-black uppercase tracking-widest">UI Modules</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {result?.recommendedComponents.map((comp, idx) => (
                    <div 
                      key={idx} 
                      className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 hover:border-black hover:bg-black hover:text-white transition-all cursor-default shadow-sm animate-in zoom-in-50 duration-300 fill-mode-both"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      {comp}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuildStudio;
