import test from 'node:test';
import assert from 'node:assert/strict';
import { createJourney, wrapScene, recenterScroll } from '../lib/bitmood/navigation.js';

// Exercise the event-driven controller without a browser or a network service.
function harness() {
  const saved = new Map(), frames = new Map(), timers = new Map();
  let now = 0, serial = 0, blocked = false, motion = true, focused = false;
  const body = { closest: () => null }, properties = {}, scenes = [];
  const win = new EventTarget(), doc = new EventTarget(), progress = { current: 0 };
  win.scrollY = 0; doc.hidden = false; doc.activeElement = body;
  const emit = (name, values = {}) => {
    const event = new Event(name, { cancelable: true });
    Object.defineProperty(event, 'target', { value: values.target || body });
    for (const [key,value] of Object.entries(values)) if (key !== 'target') Object.defineProperty(event,key,{value});
    win.dispatchEvent(event); return event;
  };
  win.scrollTo = ({top}) => { if (Math.abs(top - win.scrollY) < 1e-7) return; win.scrollY = top; emit('scroll'); };
  win.setTimeout = (fn, delay) => { const id = ++serial; timers.set(id,{fn,at:now+delay}); return id; };
  const globals = { window:win, document:doc, history:{scrollRestoration:'auto'}, performance:{now:()=>now},
    ResizeObserver:class { observe() {} disconnect() {} },
    requestAnimationFrame:fn=>{const id=++serial;frames.set(id,fn);return id;}, cancelAnimationFrame:id=>frames.delete(id),
    clearTimeout:id=>timers.delete(id),
  };
  for (const [key,value] of Object.entries(globals)) { saved.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{configurable:true,writable:true,value}); }
  const stage={clientHeight:800},track={style:{}},root={style:{setProperty:(key,value)=>{properties[key]=value;}},querySelector:()=>({focus:()=>{focused=true;}})};
  const controller=createJourney({root,track,stage,count:10,progress,getMotion:()=>motion,isBlocked:()=>blocked,onScene:index=>scenes.push(index)});
  return { win,doc,progress,controller,emit,scenes,properties,stage,
    step:1240,
    advance(ms) { const end=now+ms;while(now<end){now=Math.min(end,now+16);for(const [id,item] of [...timers])if(item.at<=now){timers.delete(id);item.fn();}const batch=[...frames];frames.clear();for(const [,fn] of batch)fn(now);} },
    setBlocked(value) {blocked=value;}, setMotion(value) {motion=value;}, wasFocused:()=>focused,
    close() {controller.dispose();for(const [key,descriptor] of saved){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}},
  };
}

test('the journey loops in both directions without clamping or losing its logical position', () => {
  const h=harness();
  try {
    h.advance(32);
    for(let i=1;i<=31;i++){h.emit('keydown',{key:'ArrowDown'});h.advance(1500);assert.ok(Math.abs(h.progress.current-i)<.002);}
    assert.equal(h.scenes.at(-1),1);
    for(let i=30;i>=-12;i--){h.emit('keydown',{key:'ArrowUp'});h.advance(1500);assert.ok(Math.abs(h.progress.current-i)<.002);}
    assert.equal(h.scenes.at(-1),8); assert.ok(h.wasFocused());
    assert.ok(h.win.scrollY>=h.step*5 && h.win.scrollY<h.step*15);
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
    h.win.scrollTo({top:h.win.scrollY+.39*h.step});h.advance(2000);assert.ok(Math.abs(h.progress.current)<.002);
    h.win.scrollTo({top:h.win.scrollY+.68*h.step});h.advance(2000);assert.ok(Math.abs(h.progress.current-1)<.002);
    h.controller.go(9);h.advance(2000);assert.equal(h.scenes.at(-1),9);
    h.win.scrollTo({top:h.win.scrollY+.72*h.step});h.advance(2000);assert.equal(h.scenes.at(-1),0);
  } finally {h.close();}
});

test('touch contact postpones snapping until the gesture ends, including pointer cancellation', () => {
  const h=harness();
  try {
    h.emit('touchstart');h.win.scrollTo({top:h.win.scrollY+.35*h.step});h.emit('pointercancel',{pointerType:'touch'});h.advance(1300);
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
