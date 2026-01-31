
import React, { useState, useEffect } from 'react';

const CodeTerminal: React.FC = () => {
  const codeLines = [
    { text: "import { DeployButton } from '@shipfast/ui';", indent: 0, color: "text-slate-500", highlight: [9, 23] },
    { text: "// Initialize lightning fast workflow", indent: 0, color: "text-slate-400" },
    { text: "const Project = () => {", indent: 0, color: "text-slate-500", highlight: [6, 13] },
    { text: "return (", indent: 1, color: "text-black" },
    { text: "<Dashboard>", indent: 2, color: "text-slate-500" },
    { text: "<DeployButton status=\"live\" />", indent: 3, color: "text-black" },
    { text: "</Dashboard>", indent: 2, color: "text-slate-500" },
    { text: ");", indent: 1, color: "text-black" },
    { text: "};", indent: 0, color: "text-slate-500" }
  ];

  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [currentCharIndex, setCurrentCharIndex] = useState<number>(0);

  useEffect(() => {
    if (visibleLines >= codeLines.length) {
      const timeout = setTimeout(() => {
        setVisibleLines(0);
        setCurrentCharIndex(0);
      }, 5000);
      return () => clearTimeout(timeout);
    }

    const currentText = codeLines[visibleLines].text;
    if (currentCharIndex < currentText.length) {
      const timeout = setTimeout(() => {
        setCurrentCharIndex(prev => prev + 1);
      }, 30 + Math.random() * 40);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setVisibleLines(prev => prev + 1);
        setCurrentCharIndex(0);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [visibleLines, currentCharIndex]);

  return (
    <div className="flex-1 text-left font-mono text-sm space-y-1 min-h-[220px]">
      {codeLines.slice(0, visibleLines + 1).map((line, lineIdx) => {
        const isCurrentLine = lineIdx === visibleLines;
        const displayChars = isCurrentLine ? currentCharIndex : line.text.length;
        const textToDisplay = line.text.substring(0, displayChars);

        return (
          <div 
            key={lineIdx} 
            className={`${line.color} transition-opacity duration-300`}
            style={{ paddingLeft: `${line.indent * 1.5}rem` }}
          >
            {textToDisplay}
            {isCurrentLine && (
              <span className="inline-block w-1.5 h-4 bg-black ml-0.5 animate-pulse align-middle"></span>
            )}
          </div>
        );
      })}
    </div>
  );
};

interface HeroProps {
  onBookDemo: () => void;
}

const Hero: React.FC<HeroProps> = ({ onBookDemo }) => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-slate-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-200 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600 mb-8">
          <span className="flex h-2 w-2 rounded-full bg-black animate-pulse"></span>
          Now supporting Next.js 15
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-black tracking-tight mb-6 leading-[1.1]">
          Stop building boilerplate. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-slate-400">
            Start shipping products.
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
          ShipFast provides deployment-ready components and automated workflows to launch your next SaaS in hours, not weeks.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onBookDemo}
            className="w-full sm:w-auto px-8 py-4 bg-black hover:bg-slate-800 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-slate-200"
          >
            Book Your Demo
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-black rounded-xl font-bold text-lg border border-slate-200 transition-all">
            See the Stack
          </button>
        </div>

        <div className="mt-20 relative max-w-5xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50">
              <div className="w-3 h-3 rounded-full bg-slate-300"></div>
              <div className="w-3 h-3 rounded-full bg-slate-300"></div>
              <div className="w-3 h-3 rounded-full bg-slate-300"></div>
              <div className="ml-4 text-xs text-slate-400 font-mono">shipfast-v1 / project / dashboard.tsx</div>
            </div>
            <div className="p-4 md:p-8 flex flex-col md:flex-row gap-8 items-stretch">
              <CodeTerminal />
              <div className="flex-1 bg-slate-50 rounded-lg p-6 border border-slate-100 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div className="h-4 w-24 bg-slate-200 rounded"></div>
                  <div className="h-8 w-8 bg-black rounded-full"></div>
                </div>
                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="h-32 w-full bg-slate-200 rounded-lg animate-pulse"></div>
                  <div className="flex gap-4 flex-1">
                    <div className="h-20 flex-1 bg-slate-200 rounded-lg animate-pulse"></div>
                    <div className="h-20 flex-1 bg-slate-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
