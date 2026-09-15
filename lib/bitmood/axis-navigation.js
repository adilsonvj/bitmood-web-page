import { wrapScene, ignoresSceneKeys } from './navigation.js';

// Discrete states: never interpolate through unrelated sculpture indices.
export function createAxisJourney({ root, track, count, pillarCount, onScene, onPillar, isBlocked }) {
  let scene = 0, pillar = 0, swipe = null, wheelAt = -Infinity, wheelTotal = 0, wheelAxis = '', wheelUsed = false;
  function go(index, focus = false) {
    scene = wrapScene(index, count); onScene(scene);
    root.style.setProperty('--journey-progress', `${(scene + 1) / count * 100}%`);
    if (focus) requestAnimationFrame(() => root.querySelector('.scene-copy.is-active h1,.scene-copy.is-active h2')?.focus({ preventScroll: true }));
  }
  function selectPillar(index) { pillar = wrapScene(index, pillarCount); onPillar(pillar); }
  function move(axis, direction) {
    if (axis === 'y' && scene === 1) selectPillar(pillar + direction);
    else go(scene + direction, true);
  }
  function reading(target) {
    const copy = root.querySelector('.scene-copy.is-active');
    return scene === 2 || (copy && copy.scrollHeight > copy.clientHeight + 2 && target?.closest?.('.scene-copy.is-active') === copy);
  }
  function wheel(event) {
    if (isBlocked() || event.ctrlKey || ignoresSceneKeys(event.target)) return;
    const axis = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? 'x' : 'y';
    if (axis === 'y' && reading(event.target)) return;
    event.preventDefault();
    const now = performance.now();
    if (now - wheelAt > 220) { wheelUsed = false; wheelTotal = 0; wheelAxis = axis; }
    wheelAt = now;
    if (wheelUsed || wheelAxis !== axis) return;
    wheelTotal += (axis === 'x' ? event.deltaX : event.deltaY) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1);
    if (Math.abs(wheelTotal) >= 45) { wheelUsed = true; move(axis, Math.sign(wheelTotal)); }
  }
  function start(event) {
    swipe = null;
    if (isBlocked() || event.touches.length !== 1 || ignoresSceneKeys(event.target) || (window.visualViewport?.scale ?? 1) > 1) return;
    const touch = event.touches[0]; swipe = { x: touch.clientX, y: touch.clientY, axis: null, used: false, reading: reading(event.target) };
  }
  function touch(event) {
    if (!swipe) return;
    if (isBlocked() || event.touches.length !== 1) { swipe = null; return; }
    const dx = swipe.x - event.touches[0].clientX, dy = swipe.y - event.touches[0].clientY;
    if (!swipe.axis && (dx || dy)) swipe.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    if (swipe.axis === 'y' && swipe.reading) return;
    if (event.cancelable) event.preventDefault();
    const distance = swipe.axis === 'x' ? dx : dy;
    if (!swipe.used && Math.abs(distance) >= 45) { swipe.used = true; move(swipe.axis, Math.sign(distance)); }
  }
  function end() { swipe = null; }
  function key(event) {
    if (isBlocked() || event.altKey || event.ctrlKey || event.metaKey || ignoresSceneKeys(event.target)) return;
    const horizontal = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    const vertical = ['ArrowDown','PageDown'].includes(event.key) ? 1 : ['ArrowUp','PageUp'].includes(event.key) ? -1 : event.key === ' ' && !event.target.closest?.('a,button') ? (event.shiftKey ? -1 : 1) : 0;
    if (vertical && reading(event.target)) return;
    if (!horizontal && !vertical && !['Home','End'].includes(event.key)) return;
    event.preventDefault(); if (event.repeat) return;
    if (horizontal) move('x', horizontal);
    else if (vertical) move('y', vertical);
    else go(event.key === 'Home' ? 0 : count - 1, true);
  }
  track.addEventListener('wheel', wheel, { passive: false });
  track.addEventListener('touchstart', start, { passive: true });
  track.addEventListener('touchmove', touch, { passive: false });
  track.addEventListener('touchend', end); track.addEventListener('touchcancel', end);
  window.addEventListener('keydown', key);
  go(0);
  return { go, selectPillar, dispose() {
    track.removeEventListener('wheel', wheel); track.removeEventListener('touchstart', start);
    track.removeEventListener('touchmove', touch); track.removeEventListener('touchend', end); track.removeEventListener('touchcancel', end);
    window.removeEventListener('keydown', key);
  } };
}
