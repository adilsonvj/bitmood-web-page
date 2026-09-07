"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type Engine = { context: AudioContext; master: GainNode; noise: AudioBuffer; sources: Set<AudioScheduledSourceNode> };
type Sound = "select" | "whale" | "transition";
const preferenceKey = "bitmood-sound";

function makeEngine(): Engine {
  const Constructor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Constructor) throw new Error("Audio unavailable");
  const context = new Constructor(), master = context.createGain(), sources = new Set<AudioScheduledSourceNode>();
  master.gain.value = 0;
  const compressor = context.createDynamicsCompressor(); compressor.threshold.value = -20; compressor.ratio.value = 5;
  master.connect(compressor); compressor.connect(context.destination);
  for (const [index, frequency] of [55, 82.41, 110.13].entries()) {
    const oscillator = context.createOscillator(), gain = context.createGain(), drift = context.createOscillator(), driftGain = context.createGain();
    oscillator.type = "sine"; oscillator.frequency.value = frequency; gain.gain.value = index === 0 ? .075 : .023;
    drift.frequency.value = .07 + index * .027; driftGain.gain.value = .012;
    drift.connect(driftGain); driftGain.connect(gain.gain); oscillator.connect(gain); gain.connect(master);
    oscillator.start(); drift.start(); sources.add(oscillator); sources.add(drift);
  }
  const buffer = context.createBuffer(1, context.sampleRate * 8, context.sampleRate), samples = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < samples.length; i++) { last = (last + (Math.random() * 2 - 1) * .018) / 1.018; samples[i] = last * 3; }
  // Smooth the loop seam so the ocean never clicks at the buffer boundary.
  const seam = Math.floor(context.sampleRate * .12);
  const seamOffset = samples[samples.length - 1] - samples[0];
  for (let i = 0; i < seam; i++) samples[samples.length - seam + i] -= seamOffset * i / (seam - 1);
  const noise = context.createBufferSource(), filter = context.createBiquadFilter(), noiseGain = context.createGain();
  noise.buffer = buffer; noise.loop = true; filter.type = "lowpass"; filter.frequency.value = 480; noiseGain.gain.value = .055;
  noise.connect(filter); filter.connect(noiseGain); noiseGain.connect(master); noise.start(); sources.add(noise);
  return { context, master, noise: buffer, sources };
}

export function useOceanSound() {
  const [enabled, setEnabled] = useState(true), [available, setAvailable] = useState(true);
  const engine = useRef<Engine | null>(null), enabledRef = useRef(true), unlocking = useRef(false), alive = useRef(true);
  const lastCue = useRef(-10), lastWhale = useRef(-10);

  const unlock = useCallback(async () => {
    if (!enabledRef.current || unlocking.current || !alive.current) return;
    unlocking.current = true;
    try {
      const audio = engine.current || (engine.current = makeEngine());
      if (audio.context.state === "suspended") await audio.context.resume();
      if (!alive.current || !enabledRef.current || audio.context.state !== "running") return;
      audio.master.gain.cancelScheduledValues(audio.context.currentTime);
      audio.master.gain.setTargetAtTime(.6, audio.context.currentTime, .65);
    } catch {
      // A blocked autoplay attempt can be retried by the next real gesture.
    } finally { unlocking.current = false; }
  }, []);

  const toggle = useCallback(() => {
    const next = !enabledRef.current; enabledRef.current = next; setEnabled(next);
    try { localStorage.setItem(preferenceKey, next ? "on" : "off"); } catch { /* Storage is optional. */ }
    if (next) void unlock();
    else if (engine.current) {
      const { context, master } = engine.current;
      master.gain.cancelScheduledValues(context.currentTime); master.gain.setTargetAtTime(0, context.currentTime, .12);
    }
  }, [unlock]);

  const play = useCallback((kind: Sound, index = 0) => {
    const audio = engine.current;
    if (!audio || !enabledRef.current || document.hidden || audio.context.state !== "running" || audio.sources.size > 64) return;
    const { context, master, sources } = audio, now = context.currentTime;
    if (kind === "whale") { if (now - lastWhale.current < .24) return; lastWhale.current = now; }
    else { if (now - lastCue.current < .3) return; lastCue.current = now; }

    function tone(frequency: number, start: number, duration: number, volume: number, pan = 0, end = frequency) {
      const oscillator = context.createOscillator(), gain = context.createGain(), panner = context.createStereoPanner();
      oscillator.type = "sine"; oscillator.frequency.setValueAtTime(frequency, start); oscillator.frequency.exponentialRampToValueAtTime(end, start + duration);
      gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(volume, start + .055); gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
      panner.pan.value = pan; oscillator.connect(gain); gain.connect(panner); panner.connect(master);
      sources.add(oscillator); oscillator.start(start); oscillator.stop(start + duration + .03);
      oscillator.onended = () => { sources.delete(oscillator); oscillator.disconnect(); gain.disconnect(); panner.disconnect(); };
    }
    if (kind === "whale") { tone(174.61, now, 1.8, .10, 0, 87.3); return; }
    const scene = ((index % 10) + 10) % 10;
    const note = kind === "select" ? [220,246.94,261.63,293.66,329.63,349.23,392][scene % 7] : [174.61,146.83,164.81,220,246.94,196,261.63,293.66,164.81,220][scene];
    for (let i = 0; i < 3; i++) {
      const frequency = note * [1,1.5,2][i], start = now + i * (scene === 6 ? .16 : .085);
      tone(frequency, start, 1.45 - i * .13, .044 / (1 + i * .5), (i - 1) * .28);
      tone(frequency * 2, start, .65, .007 / (1 + i), (i - 1) * .28);
    }
    if (kind === "transition") {
      const wash = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain(), pan = context.createStereoPanner();
      wash.buffer = audio.noise; filter.type = "bandpass"; filter.Q.value = .45;
      filter.frequency.setValueAtTime(280, now); filter.frequency.exponentialRampToValueAtTime(scene === 1 ? 1100 : 720, now + .55); filter.frequency.exponentialRampToValueAtTime(220, now + 1.5);
      gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(scene === 1 ? .05 : .028, now + .38); gain.gain.exponentialRampToValueAtTime(.0001, now + 1.65);
      pan.pan.setValueAtTime(-.35, now); pan.pan.linearRampToValueAtTime(.35, now + 1.65);
      wash.connect(filter); filter.connect(gain); gain.connect(pan); pan.connect(master); sources.add(wash); wash.start(now); wash.stop(now + 1.7);
      wash.onended = () => { sources.delete(wash); wash.disconnect(); filter.disconnect(); gain.disconnect(); pan.disconnect(); };
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    const supported = Boolean(window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
    setAvailable(supported);
    let preferred = true; try { preferred = localStorage.getItem(preferenceKey) !== "off"; } catch { /* No storage required. */ }
    enabledRef.current = supported && preferred; setEnabled(enabledRef.current);
    function gesture(event: Event) {
      if (!event.isTrusted || (event.target instanceof Element && event.target.closest('[data-sound-toggle]'))) return;
      void unlock();
    }
    function visibility() {
      const audio = engine.current; if (!audio) return;
      if (document.hidden) void audio.context.suspend(); else if (enabledRef.current) void unlock();
    }
    window.addEventListener("pointerdown", gesture, { passive: true }); window.addEventListener("touchend", gesture, { passive: true }); window.addEventListener("keydown", gesture);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      alive.current = false; window.removeEventListener("pointerdown", gesture); window.removeEventListener("touchend", gesture); window.removeEventListener("keydown", gesture); document.removeEventListener("visibilitychange", visibility);
      const audio = engine.current; engine.current = null;
      if (audio) { audio.sources.forEach(source => { try { source.stop(); } catch { /* Already ended. */ } }); void audio.context.close(); }
    };
  }, [unlock]);
  return { enabled, available, toggle, play };
}
