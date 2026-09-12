
import React from 'react';
import { Step } from '../types';

const steps: Step[] = [
  {
    number: "01",
    title: "Describe Your Product",
    description: "Tell us what you're building and pick your stack. No templates, no setup — just your idea in plain words."
  },
  {
    number: "02",
    title: "Get the Phased Plan",
    description: "Receive ordered phases with copy-paste prompts, a file map, data model, API contract, and UI elements to use."
  },
  {
    number: "03",
    title: "Hand It to Your Agent",
    description: "Paste each prompt into your coding agent in order, follow the launch checklist, and ship with confidence."
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-6 tracking-tight">
            How to ship in record time
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            A streamlined workflow designed by builders for builders.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connecting Line (hidden on mobile) */}
          <div className="hidden md:block absolute top-1/4 left-0 w-full h-px bg-slate-100 -z-10"></div>
          
          {steps.map((step, idx) => (
            <div key={idx} className="relative group">
              <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center text-black font-bold text-xl mb-8 mx-auto md:mx-0 shadow-sm group-hover:border-black transition-all">
                {step.number}
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-black mb-4">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
