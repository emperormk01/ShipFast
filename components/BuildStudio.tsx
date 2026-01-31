
import React, { useState, useEffect, useRef } from 'react';
import { ScaffolderResponse, Project, BuildLog } from '../types';
import { COMPONENTS } from './ComponentRegistry';

interface BuildStudioProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'architect' | 'library' | 'deployments';
}

const MOCK_PROJECTS: Project[] = [
  { id: '1', name: 'Keyboard Marketplace', stack: 'Next.js 15, Supabase, Tailwind', status: 'live', lastDeployed: '2 hours ago' },
  { id: '2', name: 'SaaS Dashboard Pro', stack: 'React 19, Prisma, PostgreSQL', status: 'idle', lastDeployed: 'Yesterday' }
];

const BuildStudio: React.FC<BuildStudioProps> = ({ isOpen, onClose, initialTab = 'architect' }) => {
  const [activeTab, setActiveTab] = useState<'architect' | 'library' | 'deployments'>(initialTab);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScaffolderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Deployment & Project State
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [buildLogs, setBuildLogs] = useState<BuildLog[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Component Registry State
  const [selectedCompId, setSelectedCompId] = useState(COMPONENTS[0].id);
  const [registryMode, setRegistryMode] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      console.log(`[Studio] Modal opened on tab: ${initialTab}`);
      setIsVisible(true);
      setActiveTab(initialTab);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [buildLogs]);

  if (!isVisible && !isOpen) return null;

  const generateSchema = async () => {
    if (!prompt.trim()) {
      console.warn("[Studio] Attempted to generate schema with empty prompt");
      return;
    }

    console.log(`[Studio] Initiating scaffolding request. Prompt: "${prompt.substring(0, 50)}..."`);
    setIsLoading(true);
    setError(null);
    
    try {
      const startTime = Date.now();
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("[Studio] Scaffolding request failed:", errorData);
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }
      
      const parsed: ScaffolderResponse = await response.json();
      const duration = Date.now() - startTime;
      console.log(`[Studio] Scaffolding successful! Duration: ${duration}ms`, parsed);
      
      setResult(parsed);
      
      // Auto-add to projects
      const newProject: Project = {
        id: Math.random().toString(36).substr(2, 9),
        name: parsed.projectName,
        stack: 'Next.js 15, Tailwind, PostgreSQL',
        status: 'idle',
        lastDeployed: null,
        scaffold: parsed
      };
      console.log("[Studio] Adding new project to workspace:", newProject.name);
      setProjects(prev => [newProject, ...prev]);
    } catch (err: any) {
      console.error("[Studio] Error in generateSchema sequence:", err);
      setError(err.message || "Failed to generate scaffold. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const simulateDeployment = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    console.log(`[Studio] Starting simulated deployment for project: ${project?.name} (${projectId})`);
    
    setIsDeploying(true);
    setBuildLogs([]);
    setActiveProjectId(projectId);
    
    const messages = [
      { msg: 'Initializing build environment...', type: 'info' },
      { msg: 'Cloning repository into temporary container...', type: 'info' },
      { msg: 'Installing dependencies via pnpm...', type: 'info' },
      { msg: 'Running type checking...', type: 'info' },
      { msg: 'Compiling production build...', type: 'info' },
      { msg: 'Optimizing assets and images...', type: 'warning' },
      { msg: 'Generating static pages...', type: 'info' },
      { msg: 'Exporting artifacts to edge network...', type: 'info' },
      { msg: 'Deployment successful! 🎉', type: 'success' },
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < messages.length) {
        const log: BuildLog = {
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          message: messages[i].msg,
          type: messages[i].type as any
        };
        console.log(`[BuildLog] ${log.message}`);
        setBuildLogs(prev => [...prev, log]);
        i++;
      } else {
        console.log("[Studio] Simulated deployment cycle complete.");
        clearInterval(interval);
        setIsDeploying(false);
        setProjects(prev => prev.map(p => 
          p.id === projectId ? { ...p, status: 'live', lastDeployed: 'Just now' } : p
        ));
      }
    }, 800);
  };

  const handleCopy = (text: string) => {
    console.log("[Studio] Copying code to clipboard...");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedComp = COMPONENTS.find(c => c.id === selectedCompId) || COMPONENTS[0];

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-white/60 backdrop-blur-xl" onClick={onClose} />
      
      <div className={`relative w-full max-w-6xl h-[90vh] bg-white border border-slate-200 rounded-[2.5rem] shadow-[0_32px_128px_-12px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col transition-all duration-500 transform ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'}`}>
        
        {/* Header & Tabs */}
        <div className="border-b border-slate-100 bg-white/50 sticky top-0 z-20">
          <div className="flex items-center justify-between px-8 pt-6 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-black tracking-tight">ShipFast Studio</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Command Center</p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-black transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex px-8 gap-8 mt-2">
            {[
              { id: 'architect', label: 'AI Architect' },
              { id: 'library', label: 'UI Library' },
              { id: 'deployments', label: 'Deployments' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => {
                  console.log(`[Studio] Switching to tab: ${tab.id}`);
                  setActiveTab(tab.id as any);
                }}
                className={`pb-4 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-black' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-t-full" />}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto bg-white">
          {activeTab === 'architect' ? (
            <div className="p-8 md:p-12">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {error}
                </div>
              )}

              {!result && !isLoading ? (
                <div className="max-w-2xl mx-auto py-12 text-center">
                  <h3 className="text-3xl font-bold text-black mb-4">Architect your SaaS</h3>
                  <p className="text-slate-500 mb-12">Describe your idea. Our AI engine will scaffold the entire foundation.</p>
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
                        <button onClick={generateSchema} disabled={!prompt.trim()} className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl ${!prompt.trim() ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-black text-white hover:bg-slate-800 active:scale-95 shadow-slate-200'}`}>
                          Generate & Projectize
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="relative w-20 h-20 mb-8">
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-black rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-2 animate-pulse">Generating your Blueprint...</h3>
                </div>
              ) : (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                      <h3 className="text-4xl font-extrabold text-black tracking-tight">{result?.projectName}</h3>
                      <p className="text-slate-500 mt-2">Saved to your projects list</p>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => {
                        console.log("[Studio] Resetting architect view");
                        setResult(null); 
                        setPrompt('');
                      }} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm">Start Over</button>
                      <button onClick={() => setActiveTab('deployments')} className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-slate-800 transition-all text-sm flex items-center gap-2 shadow-lg shadow-slate-200">
                        Deploy Infrastructure
                      </button>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-black uppercase tracking-widest">Database Model</span>
                      </div>
                      <div className="bg-slate-900 rounded-2xl p-8 font-mono text-xs text-slate-300 overflow-x-auto border border-slate-800 shadow-inner group relative">
                         <pre><code>{result?.databaseSchema}</code></pre>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-black uppercase tracking-widest">API Infrastructure</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-sm">
                        {result?.apiRoutes.map((route, idx) => (
                          <div key={idx} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                            <span className={`text-[10px] font-black px-2 py-1 rounded border ${route.method === 'GET' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>{route.method}</span>
                            <span className="text-sm font-mono font-semibold text-black">{route.path}</span>
                            <span className="text-xs text-slate-400">{route.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'library' ? (
            <div className="flex h-full min-h-[60vh] bg-slate-50">
              <aside className="w-64 bg-white border-r border-slate-200 overflow-y-auto p-6 space-y-1">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Categories</h4>
                {COMPONENTS.map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => {
                      console.log(`[Library] Selected component: ${comp.name}`);
                      setSelectedCompId(comp.id);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${selectedCompId === comp.id ? 'bg-black text-white shadow-lg shadow-slate-200' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {comp.name}
                  </button>
                ))}
              </aside>
              <main className="flex-1 p-12 overflow-y-auto bg-white">
                <div className="max-w-3xl">
                  <header className="mb-8">
                    <span className="px-2 py-1 bg-slate-100 text-[10px] font-black uppercase text-slate-500 rounded border border-slate-200 mb-4 inline-block">{selectedComp.category}</span>
                    <h1 className="text-3xl font-extrabold text-black mb-2">{selectedComp.name}</h1>
                    <p className="text-slate-500 text-sm">{selectedComp.description}</p>
                  </header>

                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl mb-8">
                    <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50/50">
                      <div className="flex p-1 bg-slate-200 rounded-lg">
                        <button onClick={() => setRegistryMode('preview')} className={`px-4 py-1 text-[10px] font-bold rounded-md transition-all ${registryMode === 'preview' ? 'bg-white text-black shadow-sm' : 'text-slate-500'}`}>Preview</button>
                        <button onClick={() => setRegistryMode('code')} className={`px-4 py-1 text-[10px] font-bold rounded-md transition-all ${registryMode === 'code' ? 'bg-white text-black shadow-sm' : 'text-slate-500'}`}>Code</button>
                      </div>
                      <button onClick={() => handleCopy(selectedComp.code)} className="flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:border-black hover:text-black">
                        {copied ? 'Copied!' : 'Copy Code'}
                      </button>
                    </div>
                    <div className="min-h-[300px] flex items-center justify-center p-12 bg-grid-slate-50">
                      {registryMode === 'preview' ? selectedComp.preview : (
                        <div className="w-full bg-slate-900 rounded-xl p-6 font-mono text-xs text-slate-300 overflow-x-auto">
                          <pre><code>{selectedComp.code}</code></pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </main>
            </div>
          ) : (
            /* Deployments & Workflow Tab */
            <div className="p-8 md:p-12 space-y-12">
              <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h3 className="text-3xl font-bold text-black tracking-tight">Deployment Workflow</h3>
                  <p className="text-slate-500 mt-1">Connect your providers and ship your boilerplates to the edge.</p>
                </div>
                <div className="flex gap-3">
                   <button onClick={() => console.log("[Studio] Connect Vercel clicked")} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-black hover:bg-slate-50 transition-all shadow-sm">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 22.525H0l12-21.05 12 21.05z"/></svg>
                      Connect Vercel
                   </button>
                   <button onClick={() => console.log("[Studio] Connect Netlify clicked")} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-black hover:bg-slate-50 transition-all shadow-sm">
                      <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L0 12l1.4 1.4L12 2.8l10.6 10.6L24 12zM0 12l12 12 12-12-1.4-1.4L12 21.2 1.4 9.8z"/></svg>
                      Connect Netlify
                   </button>
                </div>
              </header>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Project List */}
                <div className="lg:col-span-1 space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Your Projects</h4>
                  {projects.map(proj => (
                    <button 
                      key={proj.id}
                      onClick={() => {
                        console.log(`[Deployments] Focusing project: ${proj.name}`);
                        setActiveProjectId(proj.id); 
                        setBuildLogs([]);
                      }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${activeProjectId === proj.id ? 'border-black bg-slate-50 shadow-md' : 'border-slate-100 hover:border-slate-300 bg-white'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-black">{proj.name}</span>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${proj.status === 'live' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                          {proj.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{proj.stack}</div>
                      <div className="mt-4 text-[10px] text-slate-500 flex items-center justify-between">
                        <span>Last Deployed: {proj.lastDeployed || 'Never'}</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </button>
                  ))}
                  <button onClick={() => setActiveTab('architect')} className="w-full p-4 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm font-medium hover:text-black hover:border-slate-400 transition-all">
                    + Generate New Project
                  </button>
                </div>

                {/* Dashboard & Logs */}
                <div className="lg:col-span-2 space-y-6">
                  {activeProjectId ? (
                    <>
                      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                          <div>
                            <h5 className="text-xl font-bold text-black">
                              {projects.find(p => p.id === activeProjectId)?.name}
                            </h5>
                            <p className="text-sm text-slate-500">Live production environment</p>
                          </div>
                          <button 
                            onClick={() => simulateDeployment(activeProjectId)}
                            disabled={isDeploying}
                            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg ${isDeploying ? 'bg-slate-100 text-slate-400' : 'bg-black text-white hover:bg-slate-800 shadow-slate-200'}`}
                          >
                            {isDeploying ? (
                              <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                Deploying...
                              </>
                            ) : 'Trigger Deployment'}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { label: 'Domains', value: '1 assigned' },
                            { label: 'Environment', value: 'Production' },
                            { label: 'Regions', value: 'Global (Edge)' },
                            { label: 'Git Sync', value: 'Enabled' },
                          ].map((stat, i) => (
                            <div key={i} className="p-4 bg-slate-50 rounded-2xl">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
                              <div className="text-xs font-bold text-black">{stat.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/50">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Build Logs</span>
                          </div>
                          {isDeploying && <div className="text-[10px] text-blue-400 animate-pulse font-mono">STDOUT: STREAMING</div>}
                        </div>
                        <div className="h-64 p-6 font-mono text-xs overflow-y-auto space-y-1 scrollbar-hide">
                          {buildLogs.length === 0 && !isDeploying && (
                            <div className="text-slate-600 italic">No recent logs. Trigger a deployment to see real-time progress.</div>
                          )}
                          {buildLogs.map(log => (
                            <div key={log.id} className="flex gap-4 group">
                              <span className="text-slate-700 shrink-0">[{log.timestamp}]</span>
                              <span className={`
                                ${log.type === 'success' ? 'text-green-400' : ''}
                                ${log.type === 'error' ? 'text-red-400 font-bold' : ''}
                                ${log.type === 'warning' ? 'text-yellow-400' : ''}
                                ${log.type === 'info' ? 'text-slate-300' : ''}
                              `}>
                                {log.message}
                              </span>
                            </div>
                          ))}
                          <div ref={logEndRef} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl p-12 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      </div>
                      <h5 className="text-lg font-bold text-black mb-2">Select a project to manage</h5>
                      <p className="text-sm text-slate-400 max-w-xs">View logs, manage domains, and ship code directly from your ShipFast projects.</p>
                    </div>
                  )}
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
