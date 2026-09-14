import test from 'node:test';
import assert from 'node:assert/strict';
import { createJourney, wrapScene, recenterScroll } from '../lib/bitmood/navigation.js';
import { worldProgress } from '../lib/bitmood/world-progress.js';

// Exercise the event-driven controller without a browser or a network service.
function harness({ nativeSnap = false, count = 10 } = {}) {
  const saved = new Map(), frames = new Map(), timers = new Map();
  let now = 0, serial = 0, blocked = false, motion = true, focused = false;
  const body = { closest: () => null }, properties = {}, scenes = [];
  const win = new EventTarget(), doc = new EventTarget(), track = new EventTarget(), progress = { current: 0 };
  track.scrollTop = 0; doc.hidden = false; doc.activeElement = body;
  const classes = new Set();
  track.classList = { add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name) };
  const emit = (name, values = {}) => {
    const event = new Event(name, { cancelable: true });
    const receiver = ['keydown','pointerup','pointercancel'].includes(name) ? win : track;
    Object.defineProperty(event, 'target', { value: values.target || (receiver === track ? track : body) });
    for (const [key,value] of Object.entries(values)) if (key !== 'target') Object.defineProperty(event,key,{value});
    receiver.dispatchEvent(event); return event;
  };
  track.scrollTo = ({top}) => { if (Math.abs(top - track.scrollTop) < 1e-7) return; track.scrollTop = top; emit('scroll'); };
  win.setTimeout = (fn, delay) => { const id = ++serial; timers.set(id,{fn,at:now+delay}); return id; };
  const globals = { window:win, document:doc, history:{scrollRestoration:'auto'}, performance:{now:()=>now},
    CSS: { supports: () => nativeSnap },
    ResizeObserver:class { constructor(fn) { this.callback = fn; } observe() {} disconnect() {} },
    requestAnimationFrame:fn=>{const id=++serial;frames.set(id,fn);return id;}, cancelAnimationFrame:id=>frames.delete(id),
    clearTimeout:id=>timers.delete(id),
  };
  for (const [key,value] of Object.entries(globals)) { saved.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{configurable:true,writable:true,value}); }
  const stage={clientHeight:800},copy={scrollTop:0,querySelector:()=>({focus:()=>{focused=true;}})},root={style:{setProperty:(key,value)=>{properties[key]=value;}},querySelector:()=>copy};
  const controller=createJourney({root,track,stage,count,progress,getMotion:()=>motion,isBlocked:()=>blocked,onScene:index=>scenes.push(index)});
  return { win,doc,track,progress,controller,emit,scenes,properties,stage,
    step:800,
    advance(ms) { const end=now+ms;while(now<end){now=Math.min(end,now+16);for(const [id,item] of [...timers])if(item.at<=now){timers.delete(id);item.fn();}const batch=[...frames];frames.clear();for(const [,fn] of batch)fn(now);} },
    setBlocked(value) {blocked=value;}, setMotion(value) {motion=value;}, wasFocused:()=>focused,
    close() {controller.dispose();for(const [key,descriptor] of saved){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}},
  };
}

test('five home sections retain mapped backgrounds and circular navigation', () => {
  const h=harness({count:5});
  try {
    h.setMotion(false); h.advance(32);
    for (const [index, sculpture] of [[0,0],[1,1],[2,1],[3,9],[4,10],[5,0],[-1,10]]) {
      h.controller.go(index); h.advance(32);
      assert.equal(h.scenes.at(-1), wrapScene(index,5));
      assert.equal(worldProgress(h.progress.current),sculpture);
    }
    assert.equal(worldProgress(1.5),1);
    assert.equal(worldProgress(3.5),9.5);
    assert.equal(worldProgress(4.5),10);
  } finally {h.close();}
});

test('the journey loops in both directions without clamping or losing its logical position', () => {
  const h=harness();
  try {
    h.advance(32);
    for(let i=1;i<=31;i++){h.emit('keydown',{key:'ArrowDown'});h.advance(1500);assert.ok(Math.abs(h.progress.current-i)<.002);}
    assert.equal(h.scenes.at(-1),1);
    for(let i=30;i>=-12;i--){h.emit('keydown',{key:'ArrowUp'});h.advance(1500);assert.ok(Math.abs(h.progress.current-i)<.002);}
    assert.equal(h.scenes.at(-1),8); assert.ok(h.wasFocused());
    assert.ok(h.track.scrollTop>=h.step*5 && h.track.scrollTop<h.step*15);
    for(const phase of [-10003.7,-.2,0,9.99,10004.3]){
      const centered=recenterScroll((phase+10)*h.step,-10,h.step,10);
      assert.ok(Math.abs(centered.scroll/h.step+centered.offset-phase)<1e-9);
      assert.ok(wrapScene(phase,10)>=0&&wrapScene(phase,10)<10);
    }
  } finally {h.close();}
});

test('stopping before or after halfway settles on the nearest complete scene', () => {
  const h=harness();
  try {
    h.track.scrollTo({top:h.track.scrollTop+.39*h.step});h.advance(2000);assert.ok(Math.abs(h.progress.current)<.002);
    h.track.scrollTo({top:h.track.scrollTop+.68*h.step});h.advance(2000);assert.ok(Math.abs(h.progress.current-1)<.002);
    h.controller.go(9);h.advance(2000);assert.equal(h.scenes.at(-1),9);
    h.track.scrollTo({top:h.track.scrollTop+.72*h.step});h.advance(2000);assert.equal(h.scenes.at(-1),0);
  } finally {h.close();}
});

test('touch contact postpones snapping until the gesture ends, including pointer cancellation', () => {
  const h=harness();
  try {
    h.emit('touchstart');h.track.scrollTo({top:h.track.scrollTop+.35*h.step});h.emit('pointercancel',{pointerType:'touch'});h.advance(1300);
    assert.ok(Math.abs(h.progress.current-.35)<.002);
    h.emit('touchend',{touches:[]});h.advance(2000);assert.ok(Math.abs(h.progress.current)<.002);
  } finally {h.close();}
});

test('form fields, modifier shortcuts and dialogs keep their keyboard behavior', () => {
  const h=harness();
  try {
    const field={closest:selector=>selector.includes('input')?field:null};
    assert.equal(h.emit('keydown',{key:'ArrowRight',target:field}).defaultPrevented,false);
    assert.equal(h.emit('keydown',{key:'ArrowLeft',altKey:true}).defaultPrevented,false);
    h.setBlocked(true);assert.equal(h.emit('keydown',{key:'ArrowDown'}).defaultPrevented,false);h.advance(900);assert.equal(h.progress.current,0);
    h.setBlocked(false);assert.equal(h.emit('keydown',{key:'ArrowRight'}).defaultPrevented,true);h.advance(1500);assert.ok(Math.abs(h.progress.current-1)<.002);
  } finally {h.close();}
});

test('reduced motion and direct chapter navigation retain the circular ordering', () => {
  const h=harness();
  try {
    h.setMotion(false);h.emit('keydown',{key:'End'});h.advance(32);assert.equal(h.scenes.at(-1),9);
    h.emit('keydown',{key:'ArrowRight'});h.advance(32);assert.equal(h.scenes.at(-1),0);
    h.controller.go(6);h.advance(32);assert.equal(h.scenes.at(-1),6);
    h.emit('keydown',{key:'Home'});h.advance(32);assert.equal(h.scenes.at(-1),0);
  } finally {h.close();}
});

test('vertical keys read overflowing text before advancing; lateral keys always change scenes', () => {
  const h=harness();
  const copy={scrollTop:30,scrollHeight:900,clientHeight:180,closest:selector=>selector==='.scene-copy.is-active'?copy:null};
  try {
    for(const key of ['ArrowDown','ArrowUp','PageDown','PageUp',' ','Tab']) {
      assert.equal(h.emit('keydown',{key,target:copy}).defaultPrevented,false);
    }
    h.advance(900);assert.equal(h.progress.current,0);
    assert.equal(h.emit('keydown',{key:'ArrowRight',target:copy}).defaultPrevented,true);
    h.advance(1000);assert.equal(h.scenes.at(-1),1);
    copy.scrollTop=720;
    assert.equal(h.emit('keydown',{key:'PageDown',target:copy}).defaultPrevented,true);
    h.advance(1000);assert.equal(h.scenes.at(-1),2);
    copy.scrollTop=0;
    assert.equal(h.emit('keydown',{key:'ArrowUp',target:copy}).defaultPrevented,true);
    h.advance(1000);assert.equal(h.scenes.at(-1),1);
  } finally {h.close();}
});

test('native snapping owns wheel settlement and recentering preserves the visible scene', () => {
  const h=harness({nativeSnap:true});
  try {
    h.advance(32);
    assert.equal(h.emit('wheel',{deltaY:120}).defaultPrevented,false);
    assert.equal(h.emit('touchstart',{touches:[{}]}).defaultPrevented,false);
    h.track.scrollTo({top:15.3*h.step});
    h.emit('touchend',{touches:[]});h.advance(1200);
    assert.ok(Math.abs(h.progress.current-5.3)<.002, 'JS must not fight the browser snap animation');
    h.track.scrollTo({top:15*h.step});h.emit('scrollend');h.advance(1200);
    assert.ok(Math.abs(h.progress.current-5)<.002);
    assert.equal(h.scenes.at(-1),5);
    assert.equal(h.track.scrollTop,5*h.step);
    assert.equal(h.track.classList.contains('is-repositioning'),false);
    h.controller.go(6);h.advance(1000);assert.equal(h.scenes.at(-1),6);
    assert.equal(h.track.classList.contains('is-repositioning'),false);
  } finally {h.close();}
});

const finger = (x, y, identifier = 1) => ({ clientX: x, clientY: y, identifier });

test('touch swipes cancel native page panning and change only one scene per gesture', () => {
  const h = harness({ nativeSnap: true });
  try {
    h.advance(32);
    h.emit('touchstart', { touches: [finger(150, 400)] });
    assert.equal(h.emit('touchmove', { touches: [finger(150, 396)] }).defaultPrevented, true);
    assert.equal(h.track.scrollTop, 10 * h.step, 'no native displacement before navigation');
    h.emit('touchmove', { touches: [finger(150, 340)] }); h.advance(1000);
    assert.equal(h.scenes.at(-1), 1);
    h.emit('touchmove', { touches: [finger(150, 100)] }); h.advance(1000);
    assert.equal(h.scenes.at(-1), 1);
    h.emit('touchend', { touches: [] });
    h.emit('touchstart', { touches: [finger(150, 300)] });
    h.emit('touchmove', { touches: [finger(150, 360)] });
    h.emit('touchend', { touches: [] }); h.advance(1000);
    assert.equal(h.scenes.at(-1), 0);
    assert.equal(h.emit('wheel', { deltaY: 120 }).defaultPrevented, false);
  } finally { h.close(); }
});

test('touch keeps long text native for the whole gesture, even on reaching its boundary', () => {
  const h = harness({ nativeSnap: true });
  const copy = { scrollTop: 30, scrollHeight: 900, clientHeight: 180,
    closest: selector => selector === '.scene-copy.is-active' ? copy : null };
  try {
    h.emit('touchstart', { target: copy, touches: [finger(100, 400)] });
    assert.equal(h.emit('touchmove', { touches: [finger(100, 350)] }).defaultPrevented, false);
    copy.scrollTop = 720;
    assert.equal(h.emit('touchmove', { touches: [finger(100, 250)] }).defaultPrevented, false);
    h.emit('touchend', { touches: [] }); h.advance(1000);
    assert.equal(h.scenes.at(-1), 0);
    h.emit('touchstart', { target: copy, touches: [finger(100, 400)] });
    assert.equal(h.emit('touchmove', { touches: [finger(100, 340)] }).defaultPrevented, true);
    h.emit('touchend', { touches: [] }); h.advance(1000);
    assert.equal(h.scenes.at(-1), 1);
  } finally { h.close(); }
});

test('touch preserves pinch, horizontal gestures, inputs, dialogs and short taps', () => {
  const h = harness();
  try {
    h.emit('touchstart', { touches: [finger(100, 400), finger(200, 400, 2)] });
    assert.equal(h.emit('touchmove', { touches: [finger(100, 300), finger(200, 500, 2)] }).defaultPrevented, false);
    h.emit('touchstart', { touches: [finger(100, 400)] });
    assert.equal(h.emit('touchmove', { touches: [finger(170, 399)] }).defaultPrevented, false);
    const field = { closest: selector => selector.includes('input') ? field : null };
    h.emit('touchstart', { target: field, touches: [finger(100, 400)] });
    assert.equal(h.emit('touchmove', { touches: [finger(100, 300)] }).defaultPrevented, false);
    h.setBlocked(true);
    h.emit('touchstart', { touches: [finger(100, 400)] });
    assert.equal(h.emit('touchmove', { touches: [finger(100, 300)] }).defaultPrevented, false);
    h.setBlocked(false);
    h.emit('touchstart', { touches: [finger(100, 400)] });
    h.emit('touchmove', { touches: [finger(100, 390)] });
    h.emit('touchcancel', { touches: [] }); h.advance(1000);
    assert.equal(h.scenes.at(-1), 0);
  } finally { h.close(); }
});

test('touch wraps the final scene and respects reduced motion', () => {
  const h = harness();
  try {
    h.setMotion(false); h.controller.go(9); h.advance(32);
    h.emit('touchstart', { touches: [finger(100, 400)] });
    h.emit('touchmove', { touches: [finger(100, 300)] });
    h.emit('touchend', { touches: [] }); h.advance(32);
    assert.equal(h.scenes.at(-1), 0);
  } finally { h.close(); }
});

test('pinch-zoomed pages retain native panning and a second finger cancels swipe ownership', () => {
  const h = harness();
  try {
    h.win.visualViewport = { scale: 2 };
    h.emit('touchstart', { touches: [finger(100, 400)] });
    assert.equal(h.emit('touchmove', { touches: [finger(100, 300)] }).defaultPrevented, false);
    h.win.visualViewport.scale = 1;
    h.emit('touchstart', { touches: [finger(100, 400)] });
    h.emit('touchmove', { touches: [finger(100, 395)] });
    assert.equal(h.emit('touchmove', { touches: [finger(100, 300), finger(200, 400, 2)] }).defaultPrevented, false);
    assert.equal(h.emit('touchmove', { touches: [finger(100, 250)] }).defaultPrevented, false);
    h.emit('touchend', { touches: [] }); h.advance(1000);
    assert.equal(h.scenes.at(-1), 0);
  } finally { h.close(); }
});

test('keyboard transitions finish in 500 ms and nested copy scroll does not move the scene', () => {
  const h=harness();
  try {
    h.advance(32);h.emit('keydown',{key:'ArrowRight'});h.advance(512);
    assert.equal(h.track.scrollTop,11*h.step);
    h.advance(350);assert.ok(Math.abs(h.progress.current-1)<.002);
    h.emit('scroll',{target:{scrollTop:160}});h.advance(900);
    assert.ok(Math.abs(h.progress.current-1)<.002);
  } finally {h.close();}
});
