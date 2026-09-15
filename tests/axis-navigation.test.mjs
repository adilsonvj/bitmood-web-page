import test from 'node:test';
import assert from 'node:assert/strict';
import { createAxisJourney } from '../lib/bitmood/axis-navigation.js';

test('two-axis journey loops, remembers pillars, exits horizontally and never visits intermediate scenes',()=>{
  const saved=globalThis.window, raf=globalThis.requestAnimationFrame;
  globalThis.window=new EventTarget(); globalThis.requestAnimationFrame=()=>0;
  const track=new EventTarget(), scenes=[], pillars=[];
  const root={style:{setProperty(){}},querySelector:()=>null};
  const journey=createAxisJourney({root,track,count:5,pillarCount:7,onScene:i=>scenes.push(i),onPillar:i=>pillars.push(i),isBlocked:()=>false});
  function key(name){const e=new Event('keydown',{cancelable:true});Object.defineProperty(e,'key',{value:name});window.dispatchEvent(e);}
  try {
    journey.go(1);key('ArrowUp');assert.equal(pillars.at(-1),6);
    key('ArrowDown');assert.equal(pillars.at(-1),0);
    journey.selectPillar(3);key('ArrowRight');assert.equal(scenes.at(-1),2);
    key('ArrowLeft');key('ArrowDown');assert.equal(pillars.at(-1),4);
    key('ArrowLeft');assert.equal(scenes.at(-1),0);
    key('ArrowLeft');assert.equal(scenes.at(-1),4);
    key('ArrowRight');assert.equal(scenes.at(-1),0);
    scenes.length=0;journey.go(3);assert.deepEqual(scenes,[3]);
    journey.go(2);key('ArrowDown');assert.equal(scenes.at(-1),2,'About never spills into another section vertically');
    journey.go(1);
    for(let i=0;i<20;i++){const e=new Event('wheel',{cancelable:true});Object.defineProperties(e,{deltaY:{value:100},deltaX:{value:0}});track.dispatchEvent(e);}
    assert.equal(pillars.at(-1),5,'wheel inertia changes only one pillar');
    const touch=(name,x,y)=>{const e=new Event(name,{cancelable:true});Object.defineProperty(e,'touches',{value:[{clientX:x,clientY:y}]});track.dispatchEvent(e);};
    touch('touchstart',200,200);touch('touchmove',100,190);touch('touchmove',0,180);
    assert.equal(scenes.at(-1),2,'one horizontal swipe exits to About only once');
  } finally {journey.dispose();globalThis.window=saved;globalThis.requestAnimationFrame=raf;}
});
