
import React from 'react';

export interface ComponentData {
  id: string;
  name: string;
  description: string;
  category: 'Actions' | 'Layout' | 'Feedback' | 'Data Display';
  preview: React.ReactNode;
  code: string;
}

export const COMPONENTS: ComponentData[] = [
  {
    id: 'primary-button',
    name: 'Primary Button',
    category: 'Actions',
    description: 'The standard action button used for main interactions.',
    preview: (
      <button className="px-6 py-3 bg-black hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-slate-100 active:scale-95">
        Action Button
      </button>
    ),
    code: `<button className="px-6 py-3 bg-black hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-slate-100 active:scale-95">
  Action Button
</button>`
  },
  {
    id: 'glass-card',
    name: 'Glass Card',
    category: 'Layout',
    description: 'A modern translucent card with backdrop blur.',
    preview: (
      <div className="p-8 rounded-3xl bg-white/40 backdrop-blur-md border border-white/60 shadow-xl max-w-sm">
        <h4 className="text-lg font-bold text-black mb-2">Modern Layout</h4>
        <p className="text-slate-600 text-sm">Experience the depth of glassmorphism in your next project.</p>
      </div>
    ),
    code: `<div className="p-8 rounded-3xl bg-white/40 backdrop-blur-md border border-white/60 shadow-xl">
  <h4 className="text-lg font-bold text-black mb-2">Modern Layout</h4>
  <p className="text-slate-600 text-sm">Experience the depth of glassmorphism.</p>
</div>`
  },
  {
    id: 'status-badge',
    name: 'Status Badge',
    category: 'Feedback',
    description: 'Subtle status indicator for states and tags.',
    preview: (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
        System Live
      </span>
    ),
    code: `<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
  System Live
</span>`
  },
  {
    id: 'input-field',
    name: 'Clean Input',
    category: 'Actions',
    description: 'A focused, minimalist input field with soft borders.',
    preview: (
      <div className="w-full max-w-xs">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
        <input 
          type="text" 
          placeholder="hello@shipfast.com" 
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-all text-sm"
        />
      </div>
    ),
    code: `<div className="w-full max-w-xs">
  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
  <input 
    type="text" 
    placeholder="hello@shipfast.com" 
    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-all text-sm"
  />
</div>`
  }
];

// This component is now deprecated as a full page and should be used via BuildStudio
const ComponentRegistry: React.FC = () => {
  return null;
};

export default ComponentRegistry;
