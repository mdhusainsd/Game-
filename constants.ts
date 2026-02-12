
export const DIFFICULTY_CURVE = {
  // Base gravity boosted from 0.8 to 1.5 for immediate high-speed challenge
  getGravity: (level: number) => 1.5 + (level * 0.35), 
  getMinDelay: (level: number) => Math.max(400, 1800 - (level * 180)),
  getMaxDelay: (level: number) => Math.max(1000, 3500 - (level * 250)),
  getAcceleration: (level: number) => 0.15 + (level * 0.04)
};

export const RT_RATINGS = {
  LEGENDARY: 155, // Theoretical peak human performance
  ELITE: 190,
  PRO: 230,
  AVERAGE: 300
};

export const MAX_STRIKES = 3;
export const RULER_HEIGHT_CM = 45; // Taller ruler for higher speeds
export const PIXELS_PER_CM = 40; 
