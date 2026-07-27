/* Lightweight WebAudio chimes — no audio assets to bundle or load. */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

function tone(freq: number, start: number, duration: number, gainValue = 0.15): void {
  const audio = getCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, audio.currentTime + start);
  gain.gain.linearRampToValueAtTime(gainValue, audio.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(audio.currentTime + start);
  osc.stop(audio.currentTime + start + duration);
}

export const sounds = {
  /** Rising three-note chime when a focus session completes. */
  complete() {
    tone(523.25, 0, 0.18);
    tone(659.25, 0.16, 0.18);
    tone(783.99, 0.32, 0.32);
  },
  /** Soft two-note chime when a break ends. */
  breakOver() {
    tone(659.25, 0, 0.16);
    tone(523.25, 0.15, 0.26);
  },
  /** Single soft tick for start. */
  start() {
    tone(440, 0, 0.12, 0.1);
  },
};
