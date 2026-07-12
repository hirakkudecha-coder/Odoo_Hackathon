import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    title: 'Fleet & Asset Management',
    description: 'Optimize route scheduling, monitor fuel consumption, and track vehicle health in real-time.',
    tag: 'FLEET'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80',
    title: 'Intelligent Dispatch & Trips',
    description: 'Assign jobs dynamically, monitor delivery milestones, and receive instant delay alerts.',
    tag: 'DISPATCH'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=1200&q=80',
    title: 'Safety & Compliance Logs',
    description: 'Track driver behaviors, check certifications, and schedule preventative maintenance.',
    tag: 'SAFETY'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80',
    title: 'Financial Expense Audits',
    description: 'Structure cost centers, audit fuel receipts, and maximize operational profitability.',
    tag: 'ANALYTICS'
  }
];

export default function ImageCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  return (
    <div className="relative w-full h-full min-h-[45vh] md:min-h-screen flex flex-col justify-between overflow-hidden">
      {/* Background Images Carousel */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${SLIDES[current].image})` }}
          />
        </AnimatePresence>
        {/* Dark Premium Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-[#080B10]/70 to-[#080B10]/40 md:bg-gradient-to-r md:from-[#080B10]/90 md:to-transparent" />
        <div className="absolute inset-0 bg-slate-950/40 mix-blend-multiply" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col justify-between h-full p-8 md:p-12 min-h-[45vh] md:min-h-screen text-white">
        {/* TOP: Branding */}
        <div className="flex items-start gap-4 backdrop-blur-md bg-slate-900/40 border border-white/10 p-4 rounded-2xl w-fit">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="8" fill="#EA580C" fillOpacity="0.15"/>
            <rect x="0.5" y="0.5" width="39" height="39" rx="7.5" stroke="#EA580C" strokeWidth="1.5"/>
            <path d="M10 10H30V30H10V10Z" stroke="#EA580C" strokeWidth="1.5" strokeDasharray="3 3"/>
            <path d="M15 10V30M20 10V30M25 10V30M10 15H30M10 20H30M10 25H30" stroke="#EA580C" strokeWidth="1" strokeOpacity="0.4"/>
          </svg>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">TransitOps</h1>
            <p className="text-[10px] text-slate-300 mt-0.5 uppercase tracking-wider font-bold">Smart Operations Platform</p>
          </div>
        </div>

        {/* BOTTOM: Carousel Slide Info & Controls */}
        <div className="space-y-6 md:space-y-8 mt-auto">
          {/* Active slide text */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-2 max-w-lg"
            >
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-widest bg-orange-600/30 text-orange-400 border border-orange-500/20 uppercase">
                {SLIDES[current].tag}
              </span>
              <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {SLIDES[current].title}
              </h2>
              <p className="text-xs md:text-sm text-slate-355 font-medium leading-relaxed">
                {SLIDES[current].description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Controls row */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === current ? 'w-6 bg-orange-500' : 'w-1.5 bg-white/30 hover:bg-white/50'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition-all text-white/80 hover:text-white"
                aria-label="Previous slide"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition-all text-white/80 hover:text-white"
                aria-label="Next slide"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
