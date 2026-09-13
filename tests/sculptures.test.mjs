import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { buildSculptures, fibonacciGuidePoints } from '../components/bitmood/sculptures.js';

test('sculptures reuse a fixed fragment budget with finite bounded targets', () => {
  for (const count of [207,300]) {
    const shapes = buildSculptures(count);
    assert.equal(shapes.length,8);
    for (const shape of shapes) {
      assert.equal(shape.length,count);
      for (const target of shape) {
        assert.equal(target.p.length,3);
        assert.ok(target.p.every(n=>Number.isFinite(n)&&Math.abs(n)<6));
        assert.ok(Number.isFinite(target.size)&&target.size>0&&target.size<1);
      }
    }
    assert.deepEqual(shapes,buildSculptures(count),'geometry is deterministic');
  }
});

test('unrelated sculptures retain their approved geometry', () => {
  // SHA-256 of JSON targets before item 4, at the live 300-fragment budget.
  const baseline = {
    0:'aedea9aa3df5b8b6df088113cfa65b8fb992ac6565d1f923e6003fb4af953345',
    1:'45c96ec32ab0124d46fadf59768b0e699cbe540509a50e054de4467ae3d25a48',
    3:'58a85b2cf631e12e45f554a4625a8bf17fc80418be88612a76cd4da02656efb4',
    6:'7b73db339ed95b71ff722187413790d8c359231d0d2d1add1c37139cb2312e7d',
    7:'ca067b0c72ff49f334609653d01d866381b4d39a04945b8b3ecbe5199ae1d780',
  };
  const shapes=buildSculptures(300);
  for(const [index,hash] of Object.entries(baseline)) {
    assert.equal(createHash('sha256').update(JSON.stringify(shapes[index])).digest('hex'),hash);
  }
});

test('new metaphors retain spiral volume, five rings and inscriptions on all three blocks', () => {
  const shapes=buildSculptures(300);
  assert.ok(shapes[2].every(p=>p.part==='spiral'));
  assert.equal(fibonacciGuidePoints().length,64);
  assert.ok(Math.max(...shapes[2].map(p=>p.p[2]))-Math.min(...shapes[2].map(p=>p.p[2]))>.3);
  assert.equal(new Set(shapes[4].map(p=>p.part)).size,5);
  const inscriptions=shapes[5].filter(p=>p.part==='inscription');
  assert.ok(inscriptions.length>=18);
  for(const [low,high] of [[-4,-1.4],[-1.4,1.4],[1.4,4]]) {
    assert.ok(inscriptions.some(p=>p.p[0]>low&&p.p[0]<high));
  }
  assert.equal(shapes[5].filter(p=>p.part==='link').length,6);
  assert.equal(shapes[5].filter(p=>p.part==='pick'||p.part==='handle').length,0);
});

test('tree rings match the original version selected by the owner (6a19732)', () => {
  assert.equal(createHash('sha256').update(JSON.stringify(buildSculptures(300)[4])).digest('hex'),
    'be786ee8522fe76131dbbf36895ef28c3ceb3c84775b43d7eb55c959701231ef');
});
