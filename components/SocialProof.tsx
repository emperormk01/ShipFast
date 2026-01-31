
import React, { useState, useEffect, useRef } from 'react';
import { Testimonial } from '../types';

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  suffix?: string;
  decimals?: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ target, duration = 2000, suffix = '', decimals = 0 }) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function: easeOutExpo
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const currentCount = easedProgress * target;
      setCount(currentCount);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [hasStarted, target, duration]);

  return (
    <div ref={elementRef} className="tabular-nums">
      {count.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </div>
  );
};

const testimonials: Testimonial[] = [
  {
    name: "Alex Rivera",
    role: "Founder, PeakLabs",
    content: "ShipFast saved us at least 3 weeks of dev time. We went from Figma to a live Beta in exactly 48 hours.",
    avatar: "https://i.pravatar.cc/150?u=alex"
  },
  {
    name: "Sarah Chen",
    role: "Fullstack Dev",
    content: "The component library is elite. No more wrestling with CSS; everything just looks polished by default.",
    avatar: "https://i.pravatar.cc/150?u=sarah"
  }
];

const SocialProof: React.FC = () => {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">Trusted by builders at</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale hover:opacity-100 transition-all">
            <span className="text-2xl font-black text-black italic">STRIPE</span>
            <span className="text-2xl font-black text-black italic">VERCEL</span>
            <span className="text-2xl font-black text-black italic">SUPABASE</span>
            <span className="text-2xl font-black text-black italic">GITHUB</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((t, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-white border border-slate-200 relative overflow-hidden shadow-sm">
              <div className="absolute top-4 right-4 text-slate-100">
                <svg className="w-12 h-12 fill-current" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017V14H17.017C15.356 14 14.017 12.6569 14.017 11V8H20.017V14H22.017V21H14.017ZM3.017 21L3.017 18C3.017 16.8954 3.91243 16 5.017 16H8.017V14H6.017C4.356 14 3.017 12.6569 3.017 11V8H9.017V14H11.017V21H3.017Z" /></svg>
              </div>
              <p className="text-lg text-slate-600 mb-8 relative z-10 italic">"{t.content}"</p>
              <div className="flex items-center gap-4 relative z-10">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border-2 border-slate-100 grayscale" />
                <div>
                  <h4 className="font-bold text-black">{t.name}</h4>
                  <p className="text-sm text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 flex justify-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-24">
                <div className="text-center">
                    <div className="text-3xl font-bold text-black mb-1">
                      <AnimatedCounter target={5000} suffix="+" />
                    </div>
                    <div className="text-sm text-slate-500">Deploys today</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-black mb-1">
                      <AnimatedCounter target={99.9} suffix="%" decimals={1} />
                    </div>
                    <div className="text-sm text-slate-500">Uptime record</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-black mb-1">
                      <AnimatedCounter target={48} suffix="hrs" />
                    </div>
                    <div className="text-sm text-slate-500">Average time-to-market</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-black mb-1">
                      <AnimatedCounter target={10} suffix="k+" />
                    </div>
                    <div className="text-sm text-slate-500">Stars on GitHub</div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
