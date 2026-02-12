
class AudioManager {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private beep(freq: number, type: OscillatorType, duration: number, volume: number = 0.1) {
    this.init();
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playStart() {
    this.beep(880, 'sine', 0.1, 0.2);
  }

  playTick() {
    this.beep(440, 'sine', 0.05, 0.1);
  }

  playDrop() {
    this.beep(1200, 'sine', 0.1, 0.2);
  }

  playStop(quality: 'perfect' | 'good' | 'bad') {
    if (quality === 'perfect') {
      this.beep(1760, 'sine', 0.3, 0.3);
      setTimeout(() => this.beep(2200, 'sine', 0.3, 0.3), 100);
    } else if (quality === 'good') {
      this.beep(1320, 'sine', 0.15, 0.2);
    } else {
      this.beep(220, 'square', 0.2, 0.1);
    }
  }

  playFail() {
    this.beep(110, 'sawtooth', 0.4, 0.2);
  }
}

export const audioManager = new AudioManager();
