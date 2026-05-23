'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Car, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

const COUNTRIES = [
  'Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Egypt', 'Jordan'
];

export default function Loader({ fullScreen = true }: { fullScreen?: boolean }) {
  const [progress, setProgress] = useState(0);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 0.8;
      });
    }, 40); // Smooth fill in ~5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const newIndex = Math.min(
      Math.floor((progress / 100) * COUNTRIES.length),
      COUNTRIES.length - 1
    );
    setIndex(newIndex);
  }, [progress]);

  return (
    <div className={`flex flex-col items-center justify-center bg-white overflow-hidden ${fullScreen ? 'fixed inset-0 z-[9999]' : 'w-full py-24'}`}>
      
      <div className="w-full max-w-lg px-8 flex flex-col items-center">
        
        {/* Site Identity */}
        <div className="flex flex-col items-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-gray-900">
              AUT<span className="text-primary italic">O</span>URS
            </h1>
            <div className="h-[2px] w-12 bg-primary mt-2 rounded-full" />
          </motion.div>
        </div>

        {/* Linear Journey Loader */}
        <div className="relative w-full">
          
          {/* Floating Destination Card */}
          <div className="absolute -top-16 left-0 w-full pointer-events-none">
            <div 
              className="relative transition-all duration-300 ease-out"
              style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={COUNTRIES[index]}
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="flex flex-col items-center"
                >
                  <div className="bg-gray-900 text-white px-5 py-2.5 rounded-2xl shadow-2xl shadow-black/20 flex items-center gap-2.5 whitespace-nowrap">
                    <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                      <MapPin size={12} className="text-gray-900" fill="currentColor" />
                    </div>
                    <span className="text-sm font-black italic uppercase tracking-tight">
                      {COUNTRIES[index]}
                    </span>
                  </div>
                  {/* Speech bubble arrow */}
                  <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-gray-900 -mt-[1px]" />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Car Avatar following progress */}
          <div 
            className="absolute -top-8 transition-all duration-300 ease-out z-10"
            style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
          >
            <motion.div
              animate={{ 
                y: [0, -2, 0],
                rotate: progress === 100 ? 360 : 0 
              }}
              transition={{ 
                y: { duration: 0.4, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 0.5 }
              }}
              className="text-primary drop-shadow-[0_0_10px_rgba(244,216,73,0.6)]"
            >
              <Car size={28} fill="currentColor" />
            </motion.div>
          </div>

          {/* Main Progress Bar Track */}
          <div className="relative h-2.5 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
            {/* Animated Progress Fill */}
            <div 
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-300 ease-out"
              style={{ 
                width: `${progress}%`,
                boxShadow: '0 0 20px rgba(244,216,73,0.8)'
              }}
            />
            
            {/* Background Milestone markers (Dots) */}
            <div className="absolute inset-0 flex justify-between px-3 items-center opacity-10">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="w-1 h-1 bg-gray-900 rounded-full" />
              ))}
            </div>
          </div>

          {/* Visual Milestone Markers below the bar */}
          <div className="flex justify-between w-full px-0.5 mt-4">
             {COUNTRIES.map((_, i) => {
               const isPassed = i <= index;
               return (
                 <motion.div 
                   key={i}
                   animate={{ 
                     scale: isPassed ? 1.2 : 1,
                     opacity: isPassed ? 1 : 0.2
                   }}
                   className={`w-1.5 h-1.5 rounded-full ${isPassed ? 'bg-primary shadow-[0_0_8px_rgba(244,216,73,1)]' : 'bg-gray-300'}`}
                 />
               );
             })}
          </div>
        </div>

        {/* Contextual Status Message */}
        <div className="mt-20 flex flex-col items-center gap-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.6em]">
            Planning your trip to
          </p>
          <div className="flex items-center gap-2">
             <span className="text-xl font-black italic text-gray-900 uppercase">
               {COUNTRIES[index]}
             </span>
          </div>
          <div className="flex gap-1.5 mt-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-1 h-1 rounded-full bg-primary"
              />
            ))}
          </div>
        </div>

      </div>

      {/* Decorative Branding Watermark */}
      <div className="absolute bottom-10 left-10 opacity-5 hidden md:block">
        <h2 className="text-8xl font-black italic tracking-tighter text-gray-900 uppercase">
          AUTOURS
        </h2>
      </div>

    </div>
  );
}
