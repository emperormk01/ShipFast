
import React, { useState, useEffect, useRef } from 'react';
import { ScaffolderResponse, Project, BuildLog } from '../types';
import { COMPONENTS } from './ComponentRegistry';

interface BuildStudioProps {
  initialTab?: 'architect' | 'library' | 'deployments';
  onExit: () => void;
}

const MOCK_PROJECTS: Project[] = [
  { id: '1', name: 'Keyboard Marketplace', stack: 'Next.js 15, Supabase, Tailwind', status: 'live', lastDeployed: '2 hours ago' },
  { id: '2', name: 'SaaS Dashboard Pro', stack: 'React 19, Prisma, PostgreSQL', status: 'idle', lastDeployed: 'Yesterday' }
];

const BuildStudio: React.FC<BuildStudioProps> = ({ initialTab = 'architect', onExit }) => {
  // State hooks - always keep at top
  const [activeTab, setActiveTab] = useState<'architect' | 'library' | 'deployments'>(initialTab);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScaffolderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Deployment & Project State
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [buildLogs, setBuildLogs] = useState<BuildLog[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  
  // Component Registry State
  const [selectedCompId, setSelectedCompId] = useState(COMPONENTS[0].id);
  const [registryMode, setRegistryMode] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);

  // Refs
  const logEndRef = useRef<HTMLDivElement>(null);

  // Derived state
  const selectedComp = COMPONENTS.find(c => c.id === selectedCompId) || COMPONENTS[0];

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [buildLogs]);

  const generateSchema = async () => {
    if (!prompt.trim()) return;

    console.log(`[Studio] AI Architect processing prompt...`);
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const parsed: ScaffolderResponse = await response.json();
      setResult(parsed);
      
      const newProject: Project = {
        id: Math.random().toString(36).substr(2, 9),
        name: parsed.projectName,
        stack: 'Next.js 15, Tailwind, PostgreSQL',
        status: 'idle',
        lastDeployed: null,
        scaffold: parsed
      };
      setProjects(prev => [newProject, ...prev]);
      setPrompt('');
      console.log(`[Studio] Project "${parsed.projectName}" scaffolded successfully.`);
    } catch (err: any) {
      console.error("[Studio] Architect error:", err);
      setError(err.message || "Failed to generate scaffold.");
    } finally {
      setIsLoading(false);
    }
  };

  const simulateDeployment = (projectId: string) => {
    setIsDeploying(true);
    setBuildLogs([]);
    setActiveProjectId(projectId);
    
    const messages = [
      { msg: 'Initializing edge deployment sequence...', type: 'info' },
      { msg: 'Resolving dependency tree...', type: 'info' },
      { msg: 'Optimizing Next.js build artifacts...', type: 'info' },
      { msg: 'Injecting environment variables...', type: 'warning' },
      { msg: 'Uploading to global CDN...', type: 'info' },
      { msg: 'Provisioning PostgreSQL instance...', type: 'info' },
      { msg: 'Deployment successful! 🎉 Live at your-domain.shipfast.app', type: 'success' },
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
        setBuildLogs(prev => [...prev, log]);
        i++;
      } else {
        clearInterval(interval);
        setIsDeploying(false);
        setProjects(prev => prev.map(p => 
          p.id === projectId ? { ...p, status: 'live', lastDeployed: 'Just now' } : p
        ));
      }
    }, 800);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen w-full bg-[#FCFCFD] overflow-hidden animate-in fade-in duration-500">
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col z-[70] transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onExit}>
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-black tracking-tight">Studio</span>
          </div>
          <button onClick={onExit} className="text-slate-400 hover:text-black transition-colors">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <h4 className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 mt-2">Tools</h4>
          {[
            { id: 'architect', label: 'AI Architect', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
            { id: 'library', label: 'UI Library', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
            { id: 'deployments', label: 'Deployments', icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); closeSidebar(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id ? 'bg-black text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-black'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}

          <h4 className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 mt-8">Recent Projects</h4>
          {projects.map(p => (
            <button
              key={p.id}
              onClick={() => { setActiveTab('deployments'); setActiveProjectId(p.id); closeSidebar(); }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-500 hover:text-black truncate transition-colors"
            >
              {p.name}
            </button>
          ))}
        </nav>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200"></div>
              <div className="flex-1">
                 <p className="text-xs font-bold text-black">Builder Mode</p>
                 <p className="text-[10px] text-slate-400">Pro Plan Active</p>
              </div>
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        {/* HEADER BAR */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-500 hover:text-black lg:hidden"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h2 className="text-xs lg:text-sm font-bold text-black uppercase tracking-wider truncate max-w-[150px] lg:max-w-none">
              {activeTab === 'architect' ? 'Project Architect' : activeTab === 'library' ? 'UI Component Library' : 'Ship Workflow'}
            </h2>
            {isLoading && (
              <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 rounded text-[10px] text-slate-500 font-bold animate-pulse">
                <div className="w-2 h-2 rounded-full bg-black animate-spin shrink-0"></div>
                <span className="hidden sm:inline">AI PROCESSING</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <button className="p-2 text-slate-400 hover:text-black transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg></button>
            <button className="p-2 text-slate-400 hover:text-black transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-12 relative h-full">
          <div className={`max-w-5xl mx-auto h-full ${activeTab === 'architect' ? 'pb-32 lg:pb-40' : 'pb-10'}`}>
            {activeTab === 'architect' ? (
              <div className="space-y-8 lg:space-y-12">
                {!result && !isLoading ? (
                  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-2xl mx-auto space-y-6 px-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm">
                       <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-extrabold text-black mb-3">What are we shipping?</h3>
                      <p className="text-sm lg:text-base text-slate-500">Describe your application concept. ShipFast will generate the architectural blueprint including database models and API routes.</p>
                    </div>
                  </div>
                ) : result ? (
                  <div className="animate-in slide-in-from-bottom-8 duration-700 space-y-8 lg:space-y-12">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                         <h1 className="text-2xl lg:text-4xl font-extrabold text-black tracking-tight">{result.projectName}</h1>
                         <p className="text-sm text-slate-500 mt-1">Foundation Architecture Generated</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setResult(null)} className="flex-1 lg:flex-none px-4 py-2 lg:px-5 lg:py-2.5 bg-white border border-slate-200 text-xs lg:text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors">Reset</button>
                        <button onClick={() => setActiveTab('deployments')} className="flex-1 lg:flex-none px-4 py-2 lg:px-5 lg:py-2.5 bg-black text-white text-xs lg:text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg">Deploy</button>
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">PostgreSQL DDL</h4>
                          <div className="bg-slate-900 rounded-2xl lg:rounded-3xl p-6 lg:p-8 font-mono text-[10px] lg:text-[11px] text-slate-300 border border-slate-800 shadow-2xl overflow-x-auto min-h-[250px] lg:min-h-[300px]">
                             <pre className="leading-relaxed whitespace-pre-wrap"><code>{result.databaseSchema}</code></pre>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Infrastructure Map</h4>
                          <div className="bg-white border border-slate-200 rounded-2xl lg:rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-100">
                             {result.apiRoutes.map((route, idx) => (
                               <div key={idx} className="p-4 lg:p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                 <div className="flex items-center gap-2 lg:gap-3 overflow-hidden">
                                   <span className={`text-[8px] lg:text-[9px] font-black px-1.5 py-0.5 rounded border flex-shrink-0 ${route.method === 'GET' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>{route.method}</span>
                                   <span className="text-xs lg:text-sm font-mono font-bold text-black truncate">{route.path}</span>
                                 </div>
                                 <span className="text-[10px] lg:text-xs text-slate-400 hidden sm:block">{route.description}</span>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  </div>
                ) : isLoading && (
                   <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 border-4 border-slate-100 border-t-black rounded-full animate-spin"></div>
                      <p className="text-[10px] lg:text-sm font-bold text-black animate-pulse uppercase tracking-widest">Architecting your SaaS...</p>
                   </div>
                )}
              </div>
            ) : activeTab === 'library' ? (
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 h-full">
                <aside className="lg:w-64 space-y-2 shrink-0 flex lg:flex-col overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 gap-2 scrollbar-hide">
                  <h4 className="hidden lg:block px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Categories</h4>
                  {COMPONENTS.map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => setSelectedCompId(comp.id)}
                      className={`whitespace-nowrap px-4 py-2 lg:px-4 lg:py-2.5 rounded-xl text-xs font-bold transition-all ${
                        selectedCompId === comp.id ? 'bg-black text-white shadow-lg' : 'text-slate-500 bg-white border border-slate-100 lg:bg-transparent lg:border-none hover:bg-slate-100'
                      }`}
                    >
                      {comp.name}
                    </button>
                  ))}
                </aside>
                <div className="flex-1 space-y-6 lg:space-y-8">
                   <header>
                      <span className="px-2 py-1 bg-slate-100 text-[10px] font-black uppercase text-slate-500 rounded border border-slate-200 mb-4 inline-block">{selectedComp.category}</span>
                      <h2 className="text-2xl lg:text-3xl font-extrabold text-black mb-2">{selectedComp.name}</h2>
                      <p className="text-slate-500 text-xs lg:text-sm leading-relaxed max-w-xl">{selectedComp.description}</p>
                   </header>

                   <div className="bg-white border border-slate-200 rounded-3xl lg:rounded-[2.5rem] overflow-hidden shadow-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 lg:px-8 py-4 bg-slate-50/50 border-b border-slate-100 gap-4">
                        <div className="flex p-1 bg-slate-200 rounded-xl">
                          <button onClick={() => setRegistryMode('preview')} className={`flex-1 sm:flex-none px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all ${registryMode === 'preview' ? 'bg-white text-black shadow-sm' : 'text-slate-500'}`}>Preview</button>
                          <button onClick={() => setRegistryMode('code')} className={`flex-1 sm:flex-none px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all ${registryMode === 'code' ? 'bg-white text-black shadow-sm' : 'text-slate-500'}`}>Code</button>
                        </div>
                        <button onClick={() => handleCopy(selectedComp.code)} className="flex items-center justify-center gap-2 px-5 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:border-black hover:text-black">
                           {copied ? 'COPIED!' : 'COPY CODE'}
                        </button>
                      </div>
                      <div className="min-h-[300px] lg:min-h-[400px] flex items-center justify-center p-8 lg:p-12 bg-grid-slate-50 relative">
                        {registryMode === 'preview' ? (
                          <div className="animate-in zoom-in duration-300 w-full flex justify-center">{selectedComp.preview}</div>
                        ) : (
                          <div className="w-full h-full bg-slate-900 rounded-2xl p-6 lg:p-8 font-mono text-[10px] lg:text-xs text-slate-300 overflow-x-auto shadow-inner">
                            <pre><code>{selectedComp.code}</code></pre>
                          </div>
                        )}
                      </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 lg:space-y-12 pb-10">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-extrabold text-black tracking-tight">Deployments</h3>
                    <p className="text-sm text-slate-500 mt-1">Manage infrastructure and edge deployments.</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs lg:text-sm font-bold text-black hover:bg-slate-50">
                      Vercel
                    </button>
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs lg:text-sm font-bold text-black hover:bg-slate-50">
                      Netlify
                    </button>
                  </div>
                </header>

                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Projects</h4>
                    <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-4 pb-2 lg:pb-0">
                      {projects.map(proj => (
                        <button 
                          key={proj.id}
                          onClick={() => { setActiveProjectId(proj.id); setBuildLogs([]); }}
                          className={`min-w-[200px] lg:min-w-0 text-left p-4 lg:p-5 rounded-2xl border transition-all ${
                            activeProjectId === proj.id ? 'border-black bg-white shadow-xl' : 'border-slate-100 bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-xs lg:text-sm text-black truncate mr-2">{proj.name}</span>
                            <span className={`text-[7px] lg:text-[8px] font-black uppercase px-1.5 py-0.5 rounded border flex-shrink-0 ${
                              proj.status === 'live' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}>
                              {proj.status}
                            </span>
                          </div>
                          <div className="text-[9px] text-slate-400 font-mono mb-3 truncate">{proj.stack}</div>
                          <div className="text-[9px] text-slate-500 pt-3 border-t border-slate-50">
                            {proj.lastDeployed || 'N/A'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                    {activeProjectId ? (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                            <div>
                               <h5 className="text-lg lg:text-xl font-extrabold text-black">{projects.find(p => p.id === activeProjectId)?.name}</h5>
                               <p className="text-xs lg:text-sm text-slate-500">Live Control</p>
                            </div>
                            <button 
                              onClick={() => simulateDeployment(activeProjectId)}
                              disabled={isDeploying}
                              className={`w-full sm:w-auto px-6 py-2.5 lg:px-8 lg:py-3 rounded-xl font-bold text-xs lg:text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                                isDeploying ? 'bg-slate-100 text-slate-400' : 'bg-black text-white hover:bg-slate-800 shadow-slate-200'
                              }`}
                            >
                              {isDeploying ? 'Shipping...' : 'Deploy to Production'}
                            </button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                            {[
                              { l: 'Runtime', v: 'Edge' },
                              { l: 'Region', v: 'Global' },
                              { l: 'SSL', v: 'Active' },
                              { l: 'Git', v: 'Sync' },
                            ].map((s, i) => (
                              <div key={i}>
                                <div className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase mb-0.5">{s.l}</div>
                                <div className="text-[10px] lg:text-xs font-bold text-black">{s.v}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
                          <div className="px-5 py-2.5 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                            <span className="text-[8px] lg:text-[10px] font-black text-slate-400 tracking-widest uppercase">Live Terminal</span>
                            {isDeploying && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>}
                          </div>
                          <div className="h-48 lg:h-64 p-5 lg:p-8 font-mono text-[9px] lg:text-[11px] overflow-y-auto space-y-1.5 scrollbar-hide">
                            {buildLogs.map(log => (
                              <div key={log.id} className="flex gap-2 lg:gap-4">
                                <span className="text-slate-700 shrink-0">[{log.timestamp}]</span>
                                <span className={
                                  log.type === 'success' ? 'text-green-400' : 
                                  log.type === 'error' ? 'text-red-400' : 
                                  log.type === 'warning' ? 'text-yellow-400' : 'text-slate-400'
                                }>
                                  {log.message}
                                </span>
                              </div>
                            ))}
                            <div ref={logEndRef} />
                            {buildLogs.length === 0 && !isDeploying && <div className="text-slate-700 italic">No output. System ready.</div>}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-8 lg:p-12 text-center">
                        <h5 className="text-base lg:text-lg font-bold text-black mb-2">Select a project</h5>
                        <p className="text-xs lg:text-sm text-slate-400">View logs and manage the edge lifecycle.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PERSISTENT AI CHAT INPUT (Only in Architect Mode) */}
        {activeTab === 'architect' && (
          <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-8 pointer-events-none z-50">
            <div className="max-w-4xl mx-auto pointer-events-auto">
              <div className="relative group">
                 <div className="absolute -inset-1 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl lg:rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-100 transition duration-700"></div>
                 <div className="relative bg-white border border-slate-200 rounded-2xl lg:rounded-[2.5rem] p-2 pl-6 lg:p-3 lg:pl-8 flex items-center shadow-2xl">
                    <input 
                       type="text" 
                       value={prompt}
                       onChange={(e) => setPrompt(e.target.value)}
                       onKeyPress={(e) => e.key === 'Enter' && generateSchema()}
                       placeholder="Tell me what you want to build..." 
                       className="flex-1 bg-transparent border-none outline-none text-sm lg:text-lg text-black placeholder:text-slate-300 py-3 lg:py-4"
                    />
                    <button 
                      onClick={generateSchema}
                      disabled={isLoading || !prompt.trim()}
                      className={`w-10 h-10 lg:w-14 lg:h-14 rounded-full flex items-center justify-center transition-all shrink-0 ml-2 ${
                        isLoading || !prompt.trim() ? 'bg-slate-100 text-slate-400' : 'bg-black text-white hover:scale-105 active:scale-95'
                      }`}
                    >
                       <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                 </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BuildStudio;
