
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, GameStats, Rating } from './types';
import { DIFFICULTY_CURVE, RT_RATINGS, MAX_STRIKES, PIXELS_PER_CM, RULER_HEIGHT_CM } from './constants';
import { audioManager } from './services/AudioManager';
import Ruler from './components/Ruler';
import GameUI from './components/GameUI';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [stats, setStats] = useState<GameStats>({
    reactionTime: 0,
    distance: 0,
    level: 1,
    levelProgress: 0,
    combo: 0,
    score: 0,
    bestScore: parseInt(localStorage.getItem('bestScore') || '0'),
    bestRT: parseInt(localStorage.getItem('bestRT') || '99999'),
    strikes: 0
  });
  const [lastRating, setLastRating] = useState<Rating | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [flash, setFlash] = useState(false);

  const RULER_FULL_PX = RULER_HEIGHT_CM * PIXELS_PER_CM;
  // Lowered target line slightly to give more falling visibility
  const targetLineY = typeof window !== 'undefined' ? window.innerHeight * 0.8 : 650;
  
  const READY_Y = -RULER_FULL_PX - 200; 
  const START_Y = targetLineY - RULER_FULL_PX;

  const rulerYRef = useRef(READY_Y);
  const [displayY, setDisplayY] = useState(READY_Y);
  const velocity = useRef(0);
  const dropStartTime = useRef(0);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const isInputLocked = useRef(false);

  const triggerShake = (intensity: 'heavy' | 'light' = 'light') => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), intensity === 'heavy' ? 300 : 150);
  };

  const getRating = (rt: number): Rating => {
    if (rt < RT_RATINGS.LEGENDARY) return 'LEGENDARY';
    if (rt < RT_RATINGS.ELITE) return 'ELITE';
    if (rt < RT_RATINGS.PRO) return 'PRO';
    if (rt < RT_RATINGS.AVERAGE) return 'AVERAGE';
    return 'SLOW';
  };

  const updatePhysics = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    // Faster simulation steps for higher precision at high speeds
    const dt = Math.min((time - lastTimeRef.current) / 16.67, 1.2); 
    lastTimeRef.current = time;

    if (gameState === GameState.FALLING) {
      const g = DIFFICULTY_CURVE.getGravity(stats.level);
      const acc = DIFFICULTY_CURVE.getAcceleration(stats.level);
      
      velocity.current += (g + acc) * dt;
      rulerYRef.current += velocity.current * dt;
      setDisplayY(rulerYRef.current);

      if (rulerYRef.current > window.innerHeight) {
        audioManager.playFail();
        setGameState(GameState.GAMEOVER);
      }
    }
    requestRef.current = requestAnimationFrame(updatePhysics);
  }, [gameState, stats.level]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [updatePhysics]);

  const startTest = useCallback(() => {
    if (isInputLocked.current) return;
    setGameState(GameState.COUNTDOWN);
    rulerYRef.current = READY_Y;
    setDisplayY(READY_Y);
    velocity.current = 0;
    audioManager.playStart();

    setTimeout(() => {
      setGameState(GameState.WAITING);
      // Fixed waiting position: bottom of ruler just barely peeking from top
      rulerYRef.current = -RULER_FULL_PX + 40;
      setDisplayY(rulerYRef.current);

      const delay = Math.random() * 
        (DIFFICULTY_CURVE.getMaxDelay(stats.level) - DIFFICULTY_CURVE.getMinDelay(stats.level)) + 
        DIFFICULTY_CURVE.getMinDelay(stats.level);
      
      setTimeout(() => {
        setGameState(current => {
          if (current === GameState.WAITING) {
            dropStartTime.current = performance.now();
            audioManager.playDrop();
            return GameState.FALLING;
          }
          return current;
        });
      }, delay);
    }, 600);
  }, [stats.level, READY_Y, RULER_FULL_PX]);

  const handleInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isInputLocked.current) return;
    
    if (gameState === GameState.IDLE || gameState === GameState.STOPPED) {
      startTest();
      return;
    }

    if (gameState === GameState.WAITING) {
      isInputLocked.current = true;
      audioManager.playFail();
      triggerShake('heavy');
      if (navigator.vibrate) navigator.vibrate([150, 50, 150]);
      
      setStats(prev => ({
        ...prev,
        strikes: prev.strikes + 1,
        combo: 0,
        score: Math.max(0, prev.score - 800)
      }));

      if (stats.strikes + 1 >= MAX_STRIKES) {
        setGameState(GameState.GAMEOVER);
      } else {
        setTimeout(() => {
          setGameState(GameState.IDLE);
          isInputLocked.current = false;
        }, 800);
      }
      return;
    }

    if (gameState === GameState.FALLING) {
      isInputLocked.current = true;
      const rt = Math.floor(performance.now() - dropStartTime.current);
      const rating = getRating(rt);
      setLastRating(rating);
      
      const pixelsFallen = rulerYRef.current - START_Y;
      const distanceCm = Math.max(0, Math.round((pixelsFallen / PIXELS_PER_CM) * 10) / 10);

      if (rt < RT_RATINGS.LEGENDARY) {
        setFlash(true);
        setTimeout(() => setFlash(false), 30);
        triggerShake('heavy');
      } else {
        triggerShake('light');
      }

      audioManager.playStop(rt < RT_RATINGS.ELITE ? 'perfect' : rt < RT_RATINGS.PRO ? 'good' : 'bad');
      if (navigator.vibrate) navigator.vibrate(rt < 200 ? 120 : 50);

      const baseScore = Math.max(0, 1500 - (rt * 2));
      const gain = Math.floor((baseScore + (stats.level * 300)) * (rt < 180 ? 2.5 : 1));

      setStats(prev => {
        const newScore = prev.score + gain;
        let newLevel = prev.level;
        let newProgress = prev.levelProgress + 1;
        if (newProgress >= 3) {
          newLevel++;
          newProgress = 0;
        }

        const statsUpdate = {
          ...prev,
          reactionTime: rt,
          distance: distanceCm,
          combo: rt < 250 ? prev.combo + 1 : 0,
          score: newScore,
          bestScore: Math.max(prev.bestScore, newScore),
          bestRT: Math.min(prev.bestRT, rt),
          level: newLevel,
          levelProgress: newProgress
        };
        localStorage.setItem('bestScore', statsUpdate.bestScore.toString());
        localStorage.setItem('bestRT', statsUpdate.bestRT.toString());
        return statsUpdate;
      });

      setGameState(GameState.STOPPED);
      setTimeout(() => {
        isInputLocked.current = false;
      }, 400);
    }
  }, [gameState, stats, START_Y, startTest]);

  return (
    <div 
      className={`relative w-full h-screen bg-black overflow-hidden select-none touch-none transition-colors duration-75 ${flash ? 'bg-white' : ''} ${isShaking ? 'shake' : ''}`}
      onMouseDown={handleInteraction}
      onTouchStart={handleInteraction}
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/60 via-transparent to-black pointer-events-none" />
      
      {/* Target Marker */}
      <div className="absolute w-full h-[3px] z-10 flex justify-center items-center pointer-events-none"
           style={{ top: `${targetLineY}px` }}>
        <div className="w-full h-full bg-amber-500/10" />
        <div className="absolute -top-6 px-4 py-1 border border-amber-500/20 bg-zinc-950/80 text-[9px] font-black text-amber-500 uppercase tracking-[0.4em] rounded-sm shadow-2xl">
          Point Zero
        </div>
      </div>

      <Ruler 
        y={displayY} 
        velocity={velocity.current} 
        isStopped={gameState === GameState.STOPPED} 
        isFalling={gameState === GameState.FALLING}
      />
      
      <GameUI 
        state={gameState} 
        stats={stats} 
        lastRating={lastRating}
        onStart={startTest} 
        onRestart={() => window.location.reload()}
        onPause={() => {}}
      />

      {/* Decorative Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>
    </div>
  );
};

export default App;
