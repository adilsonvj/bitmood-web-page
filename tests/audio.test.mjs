import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

// Exercise the real hook with small React/Web Audio doubles, without playing sound.
const source = ts.transpileModule(readFileSync(new URL('../components/bitmood/audio.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function harness({ preference, blocked = false, supported = true, pending = false, audioSession } = {}) {
  const slots = [], effects = [], contexts = [], storage = new Map();
  if (preference) storage.set('bitmood-sound', preference);
  let cursor = 0;
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], value => { slots[index] = value; }];
    },
    useRef(initial) {
      const index = cursor++;
      return slots[index] ??= { current: initial };
    },
    useCallback: fn => fn,
    useEffect: fn => { effects.push(fn); },
  };
  const parameter = () => ({ value: 0, cancelScheduledValues() {}, setTargetAtTime() {} });
  const node = () => ({
    gain: parameter(), frequency: parameter(), threshold: parameter(), ratio: parameter(),
    connect() {}, disconnect() {}, start() {}, stop() {},
  });
  class AudioContext {
    state = 'suspended'; currentTime = 0; sampleRate = 10; destination = {};
    resumeCalls = 0; pendingResumes = [];
    constructor() { contexts.push(this); }
    createGain = node; createDynamicsCompressor = node; createOscillator = node;
    createBufferSource = node; createBiquadFilter = node;
    createBuffer() { return { getChannelData: () => new Float32Array(80) }; }
    async resume() {
      this.resumeCalls++;
      if (blocked) throw new Error('Autoplay blocked');
      if (pending) await new Promise(resolve => this.pendingResumes.push(resolve));
      if (this.state === 'closed') return;
      this.state = 'running'; this.onstatechange?.();
    }
    async suspend() { this.state = 'suspended'; this.onstatechange?.(); }
    async close() { this.state = 'closed'; this.onstatechange?.(); this.pendingResumes.forEach(resolve=>resolve()); }
  }
  const window = new EventTarget(), document = new EventTarget(), exports = {};
  document.hidden = false;
  if (supported) window.AudioContext = AudioContext;
  runInNewContext(source, {
    exports, require: name => { assert.equal(name, 'react'); return react; },
    window, document, navigator: { audioSession }, Element: class {}, queueMicrotask,
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
  });
  const render = () => { cursor = 0; return exports.useOceanSound(); };
  render(); const cleanup = effects[0]();
  return { render, cleanup, contexts, storage, document, unblock: () => { blocked = false; pending = false; } };
}
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };

test('saved on is not reported as playing until activation; mute persists', async () => {
  const h = harness({ preference: 'on' });
  try {
    await flush();
    assert.equal(h.render().enabled, true);
    assert.equal(h.render().playing, false);
    h.render().toggle(); await flush();
    assert.equal(h.render().playing, true);
    assert.equal(h.contexts.length, 1);
    h.render().toggle();
    assert.equal(h.render().playing, false);
    assert.equal(h.storage.get('bitmood-sound'), 'off');
    h.render().toggle(); await flush();
    assert.equal(h.render().playing, true);
    assert.equal(h.contexts.length, 1);
  } finally { h.cleanup(); }
});

test('saved silence, blocked activation and retry retain truthful playback state', async () => {
  const h = harness({ preference: 'off', blocked: true });
  try {
    await flush(); assert.equal(h.render().enabled, false);
    assert.equal(h.contexts.length, 0);
    h.render().toggle(); await flush();
    assert.equal(h.render().playing, false);
    h.unblock(); h.render().toggle(); await flush();
    assert.equal(h.render().playing, true);
    assert.equal(h.storage.get('bitmood-sound'), 'on');
  } finally { h.cleanup(); }
});

test('hidden tabs and context suspension clear playback, without erasing preference', async () => {
  const h = harness();
  try {
    await flush(); h.render().toggle(); await flush();
    h.document.hidden = true; h.document.dispatchEvent(new Event('visibilitychange'));
    assert.equal(h.render().playing, false);
    assert.equal(h.render().enabled, true);
    h.document.hidden = false; h.document.dispatchEvent(new Event('visibilitychange')); await flush();
    assert.equal(h.render().playing, true);
    await h.contexts[0].suspend(); assert.equal(h.render().playing, false);
  } finally { h.cleanup(); }
  assert.equal(h.contexts[0].state, 'closed');
  assert.equal(h.contexts[0].onstatechange, null);
});

test('unsupported audio stays unavailable and inactive', async () => {
  const h = harness({ supported: false });
  try {
    await flush(); assert.equal(h.render().available, false);
    assert.equal(h.render().playing, false);
  } finally { h.cleanup(); }
});

test('Safari interrupted audio resumes on explicit activation and on returning to the page', async () => {
  const h = harness();
  try {
    await flush(); h.render().toggle(); await flush();
    const audio=h.contexts[0];
    audio.state='interrupted'; audio.onstatechange();
    assert.equal(h.render().playing,false);
    h.render().toggle(); await flush();
    assert.equal(audio.resumeCalls,2);
    assert.equal(h.render().playing,true);
    audio.state='interrupted'; audio.onstatechange();
    h.document.dispatchEvent(new Event('visibilitychange')); await flush();
    assert.equal(audio.resumeCalls,3);
    assert.equal(h.render().playing,true);
  } finally { h.cleanup(); }
});

test('a pending resume does not prevent a fresh activation gesture from retrying', async () => {
  const h=harness({pending:true});
  try {
    await flush(); h.render().toggle(); await flush();
    assert.equal(h.render().playing,false);
    h.unblock(); h.render().toggle(); await flush();
    assert.equal(h.contexts[0].resumeCalls,2);
    assert.equal(h.render().playing,true);
  } finally { h.cleanup(); await flush(); }
});

test('explicit activation claims playback and mute, hiding and cleanup release it', async () => {
  const audioSession={type:'auto'},h=harness({audioSession});
  try {
    await flush(); assert.equal(audioSession.type,'auto');
    h.render().toggle(); await flush();
    assert.equal(audioSession.type,'playback');
    h.render().toggle(); assert.equal(audioSession.type,'auto');
    h.render().toggle(); await flush();
    h.document.hidden=true; h.document.dispatchEvent(new Event('visibilitychange'));
    assert.equal(audioSession.type,'auto');
    h.document.hidden=false; h.document.dispatchEvent(new Event('visibilitychange')); await flush();
    assert.equal(audioSession.type,'playback');
  } finally {h.cleanup();}
  assert.equal(audioSession.type,'auto');
});

test('blocked activation releases the session; rejected session API still allows audio', async () => {
  const audioSession={type:'ambient'},h=harness({audioSession,blocked:true});
  try {
    await flush(); h.render().toggle(); await flush();
    assert.equal(audioSession.type,'ambient');
    assert.equal(h.render().playing,false);
  } finally {h.cleanup();}
  const rejected=harness({audioSession:{get type(){return 'auto';},set type(value){throw new Error(value);}}});
  try {
    await flush(); rejected.render().toggle(); await flush();
    assert.equal(rejected.render().playing,true);
  } finally {rejected.cleanup();}
});
