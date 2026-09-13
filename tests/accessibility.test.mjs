import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

// Structural guards, not a substitute for a browser or screen-reader audit.
test('decorative canvas stays hidden while chapter text and announcements remain accessible', () => {
  assert.match(page, /className="world-canvas" aria-hidden="true"/);
  assert.match(page, /aria-live="polite" aria-atomic="true"/);
  assert.match(page, /aria-labelledby=\{`title-\$\{chapter.id\}`\}/);
});

test('manual pause covers the loading animation and has an explicit control label', () => {
  assert.match(css, /\.motion-paused \.world-loading i\s*\{\s*animation-play-state:\s*paused;/);
  assert.match(page, /Pausar movimento contínuo/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
});
