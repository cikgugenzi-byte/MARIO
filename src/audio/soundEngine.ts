class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private bgmTimer: number | null = null;
  private bgmStep = 0;
  private gestureUnlocked = false;
  private listenerAttached = false;

  constructor() {
    this.attachGestureListeners();
  }

  private attachGestureListeners() {
    if (typeof window === 'undefined' || this.listenerAttached) return;
    this.listenerAttached = true;
    const unlock = () => {
      this.gestureUnlocked = true;
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      window.removeEventListener('pointerdown', unlock, true);
      window.removeEventListener('keydown', unlock, true);
    };
    window.addEventListener('pointerdown', unlock, true);
    window.addEventListener('keydown', unlock, true);
  }

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined' || !this.gestureUnlocked) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(nextMuted: boolean): boolean {
    this.muted = nextMuted;
    if (this.muted) {
      this.stopAdventureMusic();
    }
    return this.muted;
  }

  public toggleMute(): boolean {
    return this.setMuted(!this.muted);
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'triangle',
    gainLevel = 0.12,
    delay = 0,
    slideTo?: number,
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainLevel, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playCoin() {
    const jitter = 0.94 + Math.random() * 0.12;
    this.playTone(987.77 * jitter, 0.09, 'sine', 0.12, 0);
    this.playTone(1318.51 * jitter, 0.22, 'triangle', 0.11, 0.07);
  }

  public playJump() {
    const jitter = 0.95 + Math.random() * 0.1;
    this.playTone(280 * jitter, 0.18, 'triangle', 0.1, 0, 580 * jitter);
  }

  public playStep() {
    const jitter = 0.92 + Math.random() * 0.16;
    this.playTone(145 * jitter, 0.045, 'sine', 0.035, 0, 90);
  }

  public playCorrect() {
    this.playTone(523.25, 0.12, 'triangle', 0.12, 0);
    this.playTone(659.25, 0.12, 'triangle', 0.12, 0.08);
    this.playTone(783.99, 0.24, 'sine', 0.14, 0.16);
  }

  public playWrong() {
    this.playTone(260, 0.16, 'triangle', 0.09, 0, 195);
    this.playTone(195, 0.22, 'sine', 0.08, 0.12, 160);
  }

  public playBossHit() {
    this.playTone(220, 0.14, 'sawtooth', 0.11, 0, 110);
    this.playTone(660, 0.18, 'triangle', 0.13, 0.05, 880);
  }

  public playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, idx === notes.length - 1 ? 0.45 : 0.14, 'triangle', 0.14, idx * 0.11);
    });
  }

  public startAdventureMusic() {
    if (this.muted || this.bgmTimer !== null || typeof window === 'undefined') return;
    const scale = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.0, 783.99];
    this.bgmTimer = window.setInterval(() => {
      if (this.muted) return;
      if (!this.ctx) this.ensureContext();
      if (!this.ctx || this.ctx.state !== 'running') return;
      const note = scale[this.bgmStep % scale.length];
      this.bgmStep += 1;
      this.playTone(note, 0.24, 'sine', 0.028, 0);
    }, 360);
  }

  public stopAdventureMusic() {
    if (this.bgmTimer !== null) {
      window.clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const soundEngine = new SoundEngine();
