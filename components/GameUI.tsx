
import React from 'react';
import { GameState, GameStats, Rating } from '../types';
import { MAX_STRIKES, RT_RATINGS } from '../constants';

interface GameUIProps {
  state: GameState;
  stats: GameStats;
  lastRating: Rating | null;
  onStart: () => void;
  onRestart: () => void;
  onPause: () => void;
}

const getResponseGrade = (rt: number) => {
  if (rt < 160) return { label: 'S+', color: 'text-amber-400' };
  if (rt < 185) return { label: 'S', color: 'text-purple-400' };
  if (rt < 210) return { label: 'A', color: 'text-blue-400' };
  if (rt < 250) return { label: 'B', color: 'text-emerald-400' };
  return { label: 'C', color: 'text-zinc-500' };
};

const RatingBadge: React.FC<{ rating: Rating }> = ({ rating }) => {
  const styles = {
    LEGENDARY: 'bg-amber-400 text-black shadow-[0_0_30px_rgba(251,191,36,0.6)]',
    ELITE: 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]',
    PRO: 'bg-blue-600 text-white',
    AVERAGE: 'bg-zinc-700 text-zinc-300',
    SLOW: 'bg-red-900 text-red-100'
  };
  return (
    <span className={`px-10 py-2.5 rounded-sm text-[12px] font-black tracking-[0.5em] uppercase transition-all ${styles[rating]}`}>
      {rating}
    </span>
  );
};

const GameUI: React.FC<GameUIProps> = ({ state, stats, lastRating, onStart, onRestart }) => {
  const neuralEfficiency = lastRating ? Math.round((RT_RATINGS.LEGENDARY / stats.reactionTime) * 100) : 0;
  const grade = lastRating ? getResponseGrade(stats.reactionTime) : null;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-50">
      {/* HUD HEADER */}
      <div className="flex justify-between items-start">
        <div className="space-y-4">
          <div className="space-y-0 text-white/90">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Synaptic Level</div>
            <div className="text-6xl font-black italic mono leading-none tracking-tighter">{stats.level}</div>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div 
                key={i} 
                className={`w-14 h-1.5 rounded-full transition-all duration-300 ${i < stats.levelProgress ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'bg-white/5'}`}
              />
            ))}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-6">
          <div className="flex gap-1">
            {Array.from({ length: MAX_STRIKES }).map((_, i) => (
              <div 
                key={i} 
                className={`w-6 h-1 transition-all duration-300 ${i < stats.strikes ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)]' : 'bg-white/10'}`}
              />
            ))}
          </div>
          <div className="text-right">
             <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 text-white">Record Response</div>
             <div className="text-3xl font-black mono text-amber-500/80">{stats.bestRT === 99999 ? '---' : `${stats.bestRT}ms`}</div>
          </div>
        </div>
      </div>

      {/* CORE DISPLAY */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {state === GameState.IDLE && (
          <div className="text-center space-y-12 pointer-events-auto scale-in-center">
            <div className="space-y-4">
              <h1 className="text-8xl font-black italic tracking-tighter text-white leading-[0.85] filter drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                NEURAL<br/><span className="text-amber-500">REFLEX</span>
              </h1>
              <div className="flex items-center justify-center gap-4">
                <span className="h-[1px] w-8 bg-white/20"></span>
                <p className="text-[10px] font-black tracking-[1em] text-white/40 uppercase">Overclocked Edition</p>
                <span className="h-[1px] w-8 bg-white/20"></span>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onStart(); }}
              className="group relative px-20 py-8 bg-white text-black font-black text-2xl transition-all active:scale-95 overflow-hidden"
            >
              <span className="relative z-10">START TEST</span>
              <div className="absolute inset-0 bg-amber-400 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>
            </button>
          </div>
        )}

        {state === GameState.STOPPED && (
          <div className="text-center space-y-12 animate-in fade-in zoom-in duration-150">
            <div className="space-y-8">
              {lastRating && <RatingBadge rating={lastRating} />}
              <div className="space-y-4">
                <div className="text-[11px] font-black uppercase tracking-[1em] text-white/40">Neural Response Rate</div>
                <div className="relative">
                   <div className="text-[11rem] font-black mono text-white leading-none tracking-tighter -mt-6">
                    {stats.reactionTime}
                  </div>
                  {grade && (
                    <div className={`absolute -right-8 top-0 text-7xl font-black italic ${grade.color} drop-shadow-2xl`}>
                      {grade.label}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-center gap-10 border-t border-white/10 pt-8 mt-4">
                   <div className="text-center">
                      <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Catch Distance</div>
                      <div className="text-2xl font-black text-amber-500">{stats.distance} CM</div>
                   </div>
                   <div className="h-10 w-[1px] bg-white/10"></div>
                   <div className="text-center">
                      <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Efficiency</div>
                      <div className="text-2xl font-black text-white">{neuralEfficiency}%</div>
                   </div>
                </div>
              </div>
            </div>
            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.8em] animate-pulse">
              Tap to re-engage
            </div>
          </div>
        )}

        {state === GameState.GAMEOVER && (
          <div className="text-center space-y-14 pointer-events-auto bg-zinc-950 p-16 border-l-8 border-red-600 shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
            <div className="space-y-4 text-left">
              <h2 className="text-7xl font-black italic tracking-tighter text-red-600">LIMIT<br/>REACHED</h2>
              <div className="h-1 w-20 bg-red-600/30"></div>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Score</span>
                <span className="text-3xl font-black mono text-white">{stats.score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Neural Depth</span>
                <span className="text-3xl font-black mono text-white">LVL {stats.level}</span>
              </div>
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); onRestart(); }}
              className="w-full py-6 bg-red-600 text-white font-black text-xl hover:bg-red-500 transition-colors tracking-widest"
            >
              REINITIALIZE
            </button>
          </div>
        )}
      </div>

      {/* FOOTER INFO */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 text-white">Neural Load (XP)</div>
          <div className="text-5xl font-black mono text-zinc-100 tracking-tighter">{stats.score.toLocaleString()}</div>
        </div>
        
        {stats.combo > 1 && (
          <div className="px-8 py-3 bg-white text-black font-black text-lg italic shadow-[10px_10px_0_rgba(251,191,36,0.8)] transform -rotate-1">
             X{stats.combo} STREAK
          </div>
        )}
      </div>
    </div>
  );
};

export default GameUI;
