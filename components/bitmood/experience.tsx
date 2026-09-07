"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

export function Scramble({ text }: { text: string }) {
  const [display, setDisplay] = useState(text);
  const frame = useRef(0);
  const element = useRef<HTMLSpanElement>(null);
  const scramble = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    cancelAnimationFrame(frame.current);
    const start = performance.now();
    const alphabet = "BITMOOD/017:+";
    let last = -1;
    function step(time: number) {
      const progress = clamp((time - start) / 460);
      const tick = Math.floor((time - start) / 35);
      if (tick !== last) {
        last = tick;
        setDisplay(text.split("").map((char, index) => char === " " || index < progress * text.length ? char : alphabet[(index * 7 + tick) % alphabet.length]).join(""));
      }
      if (progress < 1) frame.current = requestAnimationFrame(step);
      else setDisplay(text);
    }
    frame.current = requestAnimationFrame(step);
  }, [text]);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { scramble(); observer.disconnect(); }
    });
    if (element.current) observer.observe(element.current);
    return () => { cancelAnimationFrame(frame.current); observer.disconnect(); };
  }, [scramble]);
  return <span ref={element} className="scramble" onMouseEnter={scramble} onFocus={scramble}><span className="sr-only">{text}</span><span aria-hidden="true">{display}</span></span>;
}

export function useExperience() {
  useEffect(() => {
    const root = document.documentElement;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reveal = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add("is-visible"); reveal.unobserve(entry.target); }
    }, { threshold: .08, rootMargin: "0px 0px -20px 0px" });
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => reveal.observe(element));
    root.classList.add("experience-ready");
    let frame = 0;
    let current = window.scrollY;
    let target = current;
    let pointerX = 0;
    let pointerY = 0;
    let heroHeight = document.querySelector<HTMLElement>(".hero-scroll")?.offsetHeight || window.innerHeight * 1.95;
    let total = Math.max(1, root.scrollHeight - window.innerHeight);
    const depth = document.querySelector<HTMLElement>("[data-depth-number]");
    let lastNumber = -1;
    function update() {
      current = motion.matches ? target : current + (target - current) * .09;
      const hero = clamp(current / Math.max(1, heroHeight - window.innerHeight));
      root.style.setProperty("--hero-progress", String(motion.matches ? 0 : hero));
      root.style.setProperty("--page-progress", String(clamp(target / total)));
      root.style.setProperty("--pointer-x", String(pointerX)); root.style.setProperty("--pointer-y", String(pointerY));
      root.classList.toggle("has-scrolled", target > 60);
      const interlude = document.querySelector<HTMLElement>(".interlude");
      if (interlude && !motion.matches) {
        const scene = clamp((window.innerHeight - interlude.getBoundingClientRect().top) / (window.innerHeight + interlude.offsetHeight));
        root.style.setProperty("--interlude-progress", String(scene));
      }
      const number = Math.round(clamp(target / total) * 100);
      if (depth && number !== lastNumber) { depth.textContent = String(number).padStart(2, "0"); lastNumber = number; }
      if (Math.abs(target - current) > .15) frame = requestAnimationFrame(update); else frame = 0;
    }
    function requestUpdate() { if (!frame) frame = requestAnimationFrame(update); }
    function onScroll() { target = window.scrollY; requestUpdate(); }
    function onPointer(event: PointerEvent) {
      if (motion.matches || event.pointerType === "touch") return;
      pointerX = event.clientX / window.innerWidth * 2 - 1; pointerY = event.clientY / window.innerHeight * 2 - 1; requestUpdate();
    }
    const resize = new ResizeObserver(() => {
      heroHeight = document.querySelector<HTMLElement>(".hero-scroll")?.offsetHeight || window.innerHeight * 1.95;
      total = Math.max(1, root.scrollHeight - window.innerHeight); requestUpdate();
    });
    resize.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true }); motion.addEventListener("change", requestUpdate); requestUpdate();
    return () => { cancelAnimationFrame(frame); reveal.disconnect(); resize.disconnect(); root.classList.remove("experience-ready"); window.removeEventListener("scroll", onScroll); window.removeEventListener("pointermove", onPointer); window.removeEventListener("resize", requestUpdate); motion.removeEventListener("change", requestUpdate); };
  }, []);
}

type Particle = { x: number; y: number; z: number; size: number; phase: number };
type Burst = { x: number; y: number; start: number; seed: number };
export function DepthField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = window.innerWidth, height = window.innerHeight;
    let frame = 0;
    let pointer = { x: width / 2, y: height / 2 };
    let bursts: Burst[] = [];
    let seed = 13;
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const particles: Particle[] = Array.from({ length: width < 768 ? 55 : 120 }, () => ({ x: random(), y: random(), z: .12 + random() * .88, size: .35 + random() * 1.3, phase: random() * 6.28 }));
    function resize() {
      width = window.innerWidth; height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      canvas!.width = width * dpr; canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`; canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0); if (motion.matches) draw(0);
    }
    function draw(time: number) {
      ctx!.clearRect(0, 0, width, height);
      const t = motion.matches ? 0 : time * .00012;
      const scroll = motion.matches ? 0 : window.scrollY;
      for (const p of particles) {
        const x = p.x * width + Math.sin(t + p.phase) * 18 * p.z + (motion.matches ? 0 : (pointer.x - width / 2) * p.z * .026);
        const wrapped = p.y * height - scroll * p.z * .12 - t * 18 * p.z;
        const y = ((wrapped % (height + 80)) + height + 80) % (height + 80) - 40;
        const alpha = .11 + p.z * .32;
        ctx!.fillStyle = `rgba(168,196,220,${alpha})`;
        ctx!.beginPath(); ctx!.arc(x, y, p.size * p.z, 0, Math.PI * 2); ctx!.fill();
        if (p.z > .92) { ctx!.strokeStyle = `rgba(91,149,206,${alpha * .4})`; ctx!.lineWidth = .5; ctx!.beginPath(); ctx!.moveTo(x - 4, y); ctx!.lineTo(x + 4, y); ctx!.moveTo(x, y - 4); ctx!.lineTo(x, y + 4); ctx!.stroke(); }
      }
      bursts = bursts.filter((burst) => time - burst.start < 1000);
      for (const burst of bursts) {
        const age = (time - burst.start) / 1000;
        for (let i = 0; i < 12; i++) { const angle = i / 12 * Math.PI * 2 + burst.seed; const radius = (1 - Math.pow(1 - age, 3)) * (45 + i % 3 * 14); ctx!.fillStyle = `rgba(168,196,220,${(1 - age) * .7})`; ctx!.fillRect(burst.x + Math.cos(angle) * radius, burst.y + Math.sin(angle) * radius, 1.7, 1.7); }
      }
    }
    function loop(time: number) { draw(time); frame = requestAnimationFrame(loop); }
    function restart() { cancelAnimationFrame(frame); if (!document.hidden && !motion.matches) frame = requestAnimationFrame(loop); else if (!document.hidden) draw(0); }
    function move(event: PointerEvent) { pointer = { x: event.clientX, y: event.clientY }; }
    function burst(event: PointerEvent) { if (motion.matches || (event.target instanceof Element && event.target.closest("input, textarea"))) return; bursts.push({ x: event.clientX, y: event.clientY, start: performance.now(), seed: random() }); bursts = bursts.slice(-5); }
    resize(); restart(); window.addEventListener("resize", resize, { passive: true }); window.addEventListener("pointermove", move, { passive: true }); window.addEventListener("pointerdown", burst, { passive: true }); document.addEventListener("visibilitychange", restart); motion.addEventListener("change", restart);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); window.removeEventListener("pointermove", move); window.removeEventListener("pointerdown", burst); document.removeEventListener("visibilitychange", restart); motion.removeEventListener("change", restart); };
  }, []);
  return <canvas ref={canvasRef} className="depth-field" aria-hidden="true" />;
}

type OceanAudio = { context: AudioContext; master: GainNode; voices: AudioScheduledSourceNode[] };
export function useOceanSound() {
  const [enabled, setEnabled] = useState(false);
  const [available, setAvailable] = useState(true);
  const engine = useRef<OceanAudio | null>(null);
  const enabledRef = useRef(false);
  const lastWhale = useRef(-1);
  const toggleLock = useRef(false);
  function createAudio(): OceanAudio {
    const Constructor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Constructor) throw new Error("Audio not supported");
    const context = new Constructor();
    const master = context.createGain(); master.gain.value = 0;
    const compressor = context.createDynamicsCompressor(); compressor.threshold.value = -20; compressor.ratio.value = 5;
    master.connect(compressor); compressor.connect(context.destination);
    const voices: AudioScheduledSourceNode[] = [];
    for (const [index, frequency] of [55, 82.41, 110.13].entries()) {
      const oscillator = context.createOscillator(); oscillator.type = "sine"; oscillator.frequency.value = frequency;
      const gain = context.createGain(); gain.gain.value = index === 0 ? .075 : .023;
      const drift = context.createOscillator(); drift.frequency.value = .07 + index * .027;
      const driftGain = context.createGain(); driftGain.gain.value = .012;
      drift.connect(driftGain); driftGain.connect(gain.gain); oscillator.connect(gain); gain.connect(master); oscillator.start(); drift.start(); voices.push(oscillator, drift);
    }
    const buffer = context.createBuffer(1, context.sampleRate * 5, context.sampleRate);
    const channel = buffer.getChannelData(0); let last = 0;
    for (let i = 0; i < channel.length; i++) { last = (last + (Math.random() * 2 - 1) * .018) / 1.018; channel[i] = last * 3; }
    const noise = context.createBufferSource(); noise.buffer = buffer; noise.loop = true;
    const filter = context.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 480;
    const noiseGain = context.createGain(); noiseGain.gain.value = .055;
    noise.connect(filter); filter.connect(noiseGain); noiseGain.connect(master); noise.start(); voices.push(noise);
    return { context, master, voices };
  }
  const toggle = useCallback(async () => {
    if (toggleLock.current) return;
    toggleLock.current = true;
    try {
      if (!engine.current) engine.current = createAudio();
      const audio = engine.current;
      if (audio.context.state === "suspended") await audio.context.resume();
      const next = !enabledRef.current; enabledRef.current = next; setEnabled(next);
      audio.master.gain.cancelScheduledValues(audio.context.currentTime); audio.master.gain.setTargetAtTime(next ? .6 : 0, audio.context.currentTime, .25);
    } catch { setAvailable(false); enabledRef.current = false; setEnabled(false); } finally { toggleLock.current = false; }
  }, []);
  const play = useCallback((kind: "select" | "whale", index = 0) => {
    const audio = engine.current;
    if (!audio || !enabledRef.current || document.hidden) return;
    const { context, master } = audio;
    if (kind === "whale" && context.currentTime - lastWhale.current < .18) return;
    if (kind === "whale") lastWhale.current = context.currentTime;
    const oscillator = context.createOscillator(), gain = context.createGain();
    const now = context.currentTime, duration = kind === "whale" ? 1.8 : .48;
    const note = kind === "whale" ? 174.61 : [220, 246.94, 261.63, 293.66, 329.63, 349.23, 392][Math.max(0, index) % 7];
    oscillator.type = "sine"; oscillator.frequency.setValueAtTime(note, now); oscillator.frequency.exponentialRampToValueAtTime(kind === "whale" ? 87.3 : note * .998, now + duration);
    gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(kind === "whale" ? .12 : .06, now + .045); gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    oscillator.connect(gain); gain.connect(master); oscillator.start(now); oscillator.stop(now + duration + .03); oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }, []);
  useEffect(() => {
    setAvailable(Boolean(window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext));
    function visibility() { const audio = engine.current; if (!audio) return; if (document.hidden) void audio.context.suspend(); else if (enabledRef.current) void audio.context.resume().catch(() => { enabledRef.current = false; setEnabled(false); }); }
    document.addEventListener("visibilitychange", visibility);
    return () => { document.removeEventListener("visibilitychange", visibility); if (engine.current) { engine.current.voices.forEach((voice) => voice.stop()); void engine.current.context.close(); engine.current = null; } };
  }, []);
  return { enabled, available, toggle, play };
}
