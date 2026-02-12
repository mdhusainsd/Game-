
import React from 'react';
import { PIXELS_PER_CM, RULER_HEIGHT_CM } from '../constants';

interface RulerProps {
  y: number;
  velocity: number;
  isStopped: boolean;
  isFalling: boolean;
}

const Ruler: React.FC<RulerProps> = ({ y, velocity, isStopped, isFalling }) => {
  const totalPx = RULER_HEIGHT_CM * PIXELS_PER_CM;
  const marks = Array.from({ length: RULER_HEIGHT_CM * 10 + 1 });

  // Dynamic blur based on velocity
  const blurAmount = isFalling ? Math.min(velocity / 4, 6) : 0;

  return (
    <div 
      className={`absolute w-14 bg-[#EEE8AA] rounded-b-xl border-x-[1px] border-b-2 border-amber-900/30 shadow-2xl transition-transform duration-75 ${isStopped ? 'scale-[1.02]' : 'scale-100'}`}
      style={{ 
        height: `${totalPx}px`,
        transform: `translateY(${y}px)`,
        left: 'calc(50% - 1.75rem)',
        top: '0',
        willChange: 'transform',
        zIndex: 20,
        filter: `blur(${blurAmount}px)`,
        boxShadow: isStopped ? '0 0 40px rgba(251,191,36,0.3)' : '0 20px 40px rgba(0,0,0,0.4)'
      }}
    >
      <div className="relative w-full h-full overflow-hidden">
        {marks.map((_, i) => {
          const isCm = i % 10 === 0;
          const isMid = i % 5 === 0;
          const posFromBottom = (i / 10) * PIXELS_PER_CM;
          const topPos = totalPx - posFromBottom;

          return (
            <div 
              key={i}
              className={`absolute right-0 bg-zinc-900/90 ${isCm ? 'w-8 h-[2px]' : isMid ? 'w-5 h-[1.5px]' : 'w-3 h-[1px]'}`}
              style={{ top: `${topPos}px` }}
            >
              {isCm && (
                <span className="absolute -left-8 -top-2 text-[10px] font-black text-zinc-900 mono w-7 text-right tracking-tighter">
                  {i / 10}
                </span>
              )}
            </div>
          );
        })}
        
        {/* Technical Markings */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 text-amber-900/10 font-black text-[8px] rotate-90 whitespace-nowrap tracking-[0.8em] pointer-events-none uppercase">
          Neural Calibration System v4.2
        </div>
      </div>
      
      {/* Texture & Shine */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      <div className="absolute inset-y-0 left-0 w-[2px] bg-white/20"></div>
      <div className="absolute inset-y-0 right-0 w-[2px] bg-black/10"></div>
    </div>
  );
};

export default Ruler;
