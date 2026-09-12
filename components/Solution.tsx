
import React from 'react';
import { Benefit } from '../types';

const benefits: Benefit[] = [
  {
    title: "Agent-Ready Architecture",
    description: "Get phased prompts, file maps, and acceptance criteria your coding agent can execute without guessing.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  {
    title: "Elements Picked for Your Plan",
    description: "Choose UI elements from the library and they get baked into the plan, so your agent uses the right pieces.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    )
  },
  {
    title: "One-Doc Handoff",
    description: "Export the full plan as a single markdown doc. Copy it or download it — your agent takes it from there.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    )
  },
  {
    title: "AI Planning, Not Code",
    description: "Describe your app, and ShipFast drafts the blueprint — phases, prompts, and checklists. Plans, never code.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  }
];

const Solution: React.FC = () => {
  return (
    <section id="solution" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1 text-left">
            <h2 className="text-3xl md:text-5xl font-bold text-black mb-8 leading-tight">
              Focus on the core. <br />
              We'll handle the rest.
            </h2>
            <div className="space-y-12">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex gap-6 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all text-black">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-black mb-2">{benefit.title}</h3>
                    <p className="text-slate-600 max-w-md">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-transparent blur-3xl rounded-full"></div>
            <img 
              src="https://picsum.photos/seed/tech1/800/600" 
              alt="Dashboard Preview" 
              className="rounded-2xl border border-slate-200 shadow-2xl relative z-10 w-full object-cover grayscale opacity-80 hover:opacity-100 transition-all duration-500"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl border border-slate-200 shadow-xl z-20 hidden md:block">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"></div>
                <span className="text-sm font-semibold text-slate-600">Plan Ready</span>
              </div>
              <div className="text-2xl font-bold text-black">4m 12s</div>
              <div className="text-xs text-slate-400">Average time to plan</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Solution;
