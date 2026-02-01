
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
  const [activeTab, setActiveTab] = useState<'architect' | 'library' | 'deployments'>(initialTab);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScaffolderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // VFS / Explorer State
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  
  // Deployment & Logs
  const [buildLogs, setBuildLogs] = useState<BuildLog[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Component Registry State
  const [selectedCompId, setSelectedCompId] = useState(COMPONENTS[0].id);
  const [registryMode, setRegistryMode] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [buildLogs]);

  useEffect(() => {
    // Auto-select first file when result appears
    if (result && result.fileSystem) {
      const firstFile = Object.keys(result.fileSystem)[0];
      setSelectedFilePath(firstFile);
    }
  }, [result]);

  const generateSchema = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const parsed: ScaffolderResponse = await response.json();
      setResult(parsed);
      const newProject: Project = {
        id: Math.random().toString(36).substr(2, 9),
        name: parsed.projectName,
        stack: 'Next.js 15, Tailwind, Prisma',
        status: 'idle',
        lastDeployed: null,
        scaffold: parsed
      };
      setProjects(prev => [newProject, ...prev]);
      setPrompt('');
    } catch (err: any) {
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
      { msg: 'Connecting to GitHub...', type: 'info' },
      { msg: 'Creating repository shipfast-project-v1...', type: 'info' },
      { msg: 'Pushing initial commit with VFS artifacts...', type: 'info' },
      { msg: 'Triggering Vercel deployment via webhook...', type: 'warning' },
      { msg: 'Building... (Next.js 15 SSR Optimized)', type: 'info' },
      { msg: 'Deployment successful! 🎉 Live at shipfast-app.vercel.app', type: 'success' },
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < messages.length) {
        setBuildLogs(prev => [...prev, { id: Math.random().toString(), timestamp: new Date().toLocaleTimeString(), message: messages[i].msg, type: messages[i].type as any }]);
        i++;
      } else {
        clearInterval(interval);
        setIsDeploying(false);
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: 'live', lastDeployed: 'Just now' } : p));
      }
    }, 800);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedComp = COMPONENTS.find(c => c.id === selectedCompId) || COMPONENTS[0];
  const fileContent = result?.fileSystem && selectedFilePath ? result.fileSystem[selectedFilePath] : null;

  return (
    <div className="flex h-screen w-full bg-[#FCFCFD] overflow-hidden animate-in fade-in duration-500">
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col z-[70] transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onExit}>
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-lg"><svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
            <span className="font-bold text-black tracking-tight">Studio</span>
          </div>
          <button onClick={onExit} className="text-slate-400 hover:text-black transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg></button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <h4 className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 mt-2">Workspace</h4>
          {[
            { id: 'architect', label: 'AI Scaffolder', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
            { id: 'library', label: 'Context UI', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
            { id: 'deployments', label: 'Infrastructure', icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' }
          ].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-black text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 hover:text-black'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} /></svg>
              {tab.label}
            </button>
          ))}

          <h4 className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 mt-8">Active Projects</h4>
          {projects.map(p => (
            <button key={p.id} onClick={() => { setActiveTab('deployments'); setActiveProjectId(p.id); setIsSidebarOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-medium text-slate-500 hover:text-black truncate transition-colors">{p.name}</button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-500 lg:hidden"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
            <h2 className="text-xs lg:text-sm font-bold text-black uppercase tracking-wider">{activeTab === 'architect' ? 'Project Explorer' : activeTab === 'library' ? 'Component Forge' : 'Cloud Dashboard'}</h2>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-white">
          <div className={`max-w-7xl mx-auto h-full ${activeTab === 'architect' ? 'pb-32 lg:pb-40' : ''}`}>
            
            {activeTab === 'architect' ? (
              result ? (
                <div className="flex h-full animate-in slide-in-from-bottom-4 duration-500">
                  {/* File Tree Sidebar */}
                  <div className="w-64 border-r border-slate-100 flex-shrink-0 bg-slate-50/50 flex flex-col">
                    <div className="p-4 border-b border-slate-100 bg-white/50"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Files</span></div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                      {Object.keys(result.fileSystem).map(path => (
                        <button key={path} onClick={() => setSelectedFilePath(path)} className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all truncate ${selectedFilePath === path ? 'bg-white border border-slate-200 text-black shadow-sm font-bold' : 'text-slate-500 hover:bg-slate-100'}`}>
                          {path.split('/').pop()}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Code Editor View */}
                  <div className="flex-1 flex flex-col bg-white">
                    <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                      <span className="text-xs font-mono text-slate-400">{selectedFilePath}</span>
                      <button onClick={() => fileContent && handleCopy(fileContent)} className="text-[10px] font-black text-slate-500 hover:text-black uppercase tracking-widest">
                        {copied ? 'Copied!' : 'Copy File'}
                      </button>
                    </div>
                    <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
                       <div className="bg-slate-900 rounded-3xl p-8 font-mono text-[11px] leading-relaxed text-slate-300 shadow-2xl border border-slate-800">
                         <pre><code>{fileContent || '// Select a file to view source'}</code></pre>
                       </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                  {isLoading ? (
                    <div className="space-y-6">
                      <div className="w-16 h-16 border-4 border-slate-100 border-t-black rounded-full animate-spin mx-auto"></div>
                      <p className="text-sm font-bold text-black animate-pulse uppercase tracking-widest">Generating Full-Stack VFS...</p>
                    </div>
                  ) : (
                    <div className="max-w-xl space-y-6">
                       <h3 className="text-3xl lg:text-4xl font-extrabold text-black">Generate your SaaS core.</h3>
                       <p className="text-slate-500">Describe your product. We'll generate the database models, Zod validation, API services, and Stripe integration logic instantly.</p>
                    </div>
                  )}
                </div>
              )
            ) : activeTab === 'library' ? (
              <div className="p-8 lg:p-12 h-full flex flex-col lg:flex-row gap-12">
                 <aside className="lg:w-64 space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">AI Recommendations</h4>
                    {result?.recommendedComponents.map((name, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-xs font-bold text-black mb-2">{name}</p>
                        <button className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">Inject Schema</button>
                      </div>
                    ))}
                    <div className="h-px bg-slate-100 my-8"></div>
                    {COMPONENTS.map(c => (
                      <button key={c.id} onClick={() => setSelectedCompId(c.id)} className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedCompId === c.id ? 'bg-black text-white' : 'text-slate-500 hover:bg-slate-100'}`}>{c.name}</button>
                    ))}
                 </aside>
                 <div className="flex-1 space-y-8">
                    <header>
                      <h2 className="text-3xl font-extrabold text-black mb-2">{selectedComp.name}</h2>
                      <p className="text-slate-500 text-sm">{selectedComp.description}</p>
                    </header>
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl">
                       <div className="p-12 bg-grid-slate-50 flex items-center justify-center min-h-[300px]">
                          {selectedComp.preview}
                       </div>
                       <div className="bg-slate-900 p-8 font-mono text-[10px] text-slate-400">
                          <pre><code>{selectedComp.code}</code></pre>
                       </div>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="p-8 lg:p-12 space-y-12">
                 <header className="flex justify-between items-center">
                    <h3 className="text-3xl font-extrabold text-black">Infrastructure</h3>
                    <div className="flex gap-4">
                       <button className="px-5 py-2.5 bg-black text-white text-sm font-bold rounded-xl shadow-lg">GitHub Sync</button>
                    </div>
                 </header>
                 <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-4">
                       {projects.map(p => (
                         <div key={p.id} onClick={() => {setActiveProjectId(p.id); setBuildLogs([]);}} className={`p-5 rounded-3xl border cursor-pointer transition-all ${activeProjectId === p.id ? 'border-black bg-white shadow-xl translate-x-1' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                            <div className="flex justify-between items-center mb-4">
                               <span className="font-bold text-black">{p.name}</span>
                               <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${p.status === 'live' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{p.status}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mb-2">{p.stack}</div>
                            <div className="text-[9px] text-slate-500 pt-3 border-t border-slate-50">{p.lastDeployed || 'Awaiting Sync'}</div>
                         </div>
                       ))}
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                       {activeProjectId ? (
                         <>
                           <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8">
                              <div className="flex justify-between items-center mb-8">
                                 <div><h5 className="text-xl font-extrabold text-black">Vercel Build Environment</h5><p className="text-sm text-slate-500">Production Node.js 20.x</p></div>
                                 <button onClick={() => simulateDeployment(activeProjectId)} disabled={isDeploying} className="px-8 py-3 bg-black text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all">
                                    {isDeploying ? 'Deploying...' : 'Promote to Production'}
                                 </button>
                              </div>
                              <div className="grid grid-cols-4 gap-4">
                                 {['Runtime: Edge', 'Region: Global', 'SSL: Auto', 'Logs: Live'].map((s, i) => (
                                   <div key={i} className="p-3 bg-slate-50 rounded-xl text-[10px] font-bold text-slate-600 text-center">{s}</div>
                                 ))}
                              </div>
                           </div>
                           <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
                              <div className="px-6 py-3 border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">Build Stdout</div>
                              <div className="h-64 p-8 font-mono text-[10px] overflow-y-auto space-y-1 scrollbar-hide">
                                 {buildLogs.map(l => (
                                   <div key={l.id} className="flex gap-4">
                                      <span className="text-slate-700 shrink-0">[{l.timestamp}]</span>
                                      <span className={l.type === 'success' ? 'text-green-400' : l.type === 'error' ? 'text-red-400' : 'text-slate-400'}>{l.message}</span>
                                   </div>
                                 ))}
                                 <div ref={logEndRef} />
                              </div>
                           </div>
                         </>
                       ) : <div className="h-full min-h-[300px] border-2 border-dashed border-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-400 font-medium">Select a project to manage infrastructure</div>}
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* PERSISTENT AI CHAT INPUT (Only in Architect Mode) */}
        {activeTab === 'architect' && !result && !isLoading && (
          <div className="absolute bottom-0 left-0 right-0 p-8 pointer-events-none z-50">
            <div className="max-w-4xl mx-auto pointer-events-auto">
              <div className="relative group">
                 <div className="absolute -inset-1 bg-gradient-to-r from-slate-200 to-slate-300 rounded-[2.5rem] blur opacity-20 group-focus-within:opacity-100 transition duration-700"></div>
                 <div className="relative bg-white border border-slate-200 rounded-[2.5rem] p-3 pl-8 flex items-center shadow-2xl">
                    <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && generateSchema()} placeholder="Describe your SaaS concept (e.g. AI-powered legal document analyzer)..." className="flex-1 bg-transparent border-none outline-none text-lg text-black placeholder:text-slate-300 py-4" />
                    <button onClick={generateSchema} disabled={isLoading || !prompt.trim()} className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
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
