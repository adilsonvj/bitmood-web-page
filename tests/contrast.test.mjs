import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const token = name => {
  const match = css.match(new RegExp(`--${name}:\\s*(#[\\da-fA-F]{6,8})\\b`));
  assert.ok(match, `Missing color token ${name}`);
  return match[1];
};
const rgb = hex => [1,3,5].map(start => parseInt(hex.slice(start,start+2),16));
const luminance = color => color.map(channel => {
  const value = channel/255;
  return value <= .04045 ? value/12.92 : ((value+.055)/1.055)**2.4;
}).reduce((sum,value,index) => sum+value*[.2126,.7152,.0722][index],0);
const ratio = (a,b) => {
  const values = [luminance(a),luminance(b)].sort((x,y)=>y-x);
  return (values[0]+.05)/(values[1]+.05);
};

test('scene overlays do not restore opaque reading panels over sculptures', () => {
  assert.ok(!css.includes('--reading-surface'), 'Opaque reading surfaces must not return');
});

// This checks palette contrast only, not contrast over every animated 3D facet.
test('reading colors meet 4.5:1 against the base ocean background', () => {
  const background = rgb(token('background'));
  for (const name of ['foreground','muted-foreground','silver','primary']) {
    const actual = ratio(rgb(token(name)),background);
    assert.ok(actual >= 4.5, `${name}: ${actual.toFixed(2)}:1`);
    console.log(`Reading ${name}: ${actual.toFixed(2)}:1 (base background)`);
  }
});

test('placeholder, field text and primary action meet normal-text contrast', () => {
  for (const [foreground,background] of [
    ['silver','card'], ['foreground','card'], ['muted-foreground','card'], ['primary-foreground','primary'],
  ]) {
    const actual = ratio(rgb(token(foreground)),rgb(token(background)));
    assert.ok(actual >= 4.5, `${foreground} / ${background}: ${actual.toFixed(2)}:1`);
    console.log(`${foreground} / ${background}: ${actual.toFixed(2)}:1`);
  }
});
