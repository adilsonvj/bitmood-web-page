export const wrapScene = (position, count) => ((position % count) + count) % count;

// Pick the closest occurrence on a circular timeline, in either direction.
export function nearestOccurrence(index, position, count) {
  const scene = wrapScene(index, count);
  return scene + Math.round((position - scene) / count) * count;
}

export function recenterScroll(scroll, offset, step, count) {
  const cycle = step * count;
  const turns = Math.floor((scroll - cycle * .5) / cycle);
  return { scroll: scroll - turns * cycle, offset: offset + turns * count };
}

export function ignoresSceneKeys(target) {
  return !!target?.closest?.('input,textarea,select,[contenteditable="true"],[role="dialog"],[role="slider"],[role="combobox"],[role="listbox"],[role="menu"]');
}

/** Native scroll remains the input; only the invisible scroll range is recentered. */
export function createJourney({ root, track, stage, count, progress, getMotion, isBlocked, onScene }) {
  let step = 1, offset = -count, position = 0, target = 0;
  let animation = null, timer = 0, frame = 0, previousTime = 0, touching = false;
  let active = -1, focusOnArrival = false, disposed = false;
  const oldRestoration = history.scrollRestoration;
  history.scrollRestoration = 'manual';
  const ease = t => t * t * (3 - 2 * t);

  function writePosition(value) {
    const native = recenterScroll((value - offset) * step, offset, step, count);
    offset = native.offset;
    target = value;
    window.scrollTo({ top: native.scroll, behavior: 'instant' });
  }

  function animateTo(value, focus = false) {
    clearTimeout(timer);
    focusOnArrival = focus;
    if (!getMotion()) { animation = null; writePosition(value); position = value; return; }
    animation = { from: target, to: value, start: performance.now(), duration: 480 + Math.min(2, Math.abs(value - target)) * 160 };
  }

  function scheduleSnap() {
    clearTimeout(timer);
    if (animation || touching || isBlocked()) return;
    timer = window.setTimeout(() => {
      if (touching || isBlocked() || animation || ignoresSceneKeys(document.activeElement)) return;
      const scene = Math.round(target);
      if (Math.abs(scene - target) > .001) animateTo(scene);
    }, 220);
  }

  function onScroll() {
    if (isBlocked()) return;
    const native = recenterScroll(window.scrollY, offset, step, count);
    offset = native.offset;
    target = native.scroll / step + offset;
    if (Math.abs(native.scroll - window.scrollY) > 1) window.scrollTo({ top: native.scroll, behavior: 'instant' });
    scheduleSnap();
  }

  function interrupt() { animation = null; focusOnArrival = false; clearTimeout(timer); }
  function onWheel() { if (!isBlocked()) { interrupt(); scheduleSnap(); } }
  function down(event) { if (event.pointerType !== 'touch') touching = true; interrupt(); }
  function up(event) { if (event.pointerType === 'touch') return; touching = false; scheduleSnap(); }
  function touchStart() { touching = true; interrupt(); }
  function touchEnd(event) { touching = event.touches.length > 0; if (!touching) scheduleSnap(); }
  function keydown(event) {
    if (isBlocked() || event.altKey || event.ctrlKey || event.metaKey || ignoresSceneKeys(event.target)) return;
    let destination;
    const anchor = animation ? animation.to : Math.round(target);
    if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(event.key)) destination = anchor + 1;
    else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(event.key)) destination = anchor - 1;
    else if (event.key === 'Home') destination = nearestOccurrence(0, target, count);
    else if (event.key === 'End') destination = nearestOccurrence(count - 1, target, count);
    else if (event.key === ' ' && !event.target.closest?.('button,a')) destination = anchor + (event.shiftKey ? -1 : 1);
    else return;
    event.preventDefault();
    if (event.repeat && animation) return;
    animateTo(destination, true);
  }

  function measure() {
    const nextStep = Math.max(1, stage.clientHeight * 1.55);
    if (Math.abs(nextStep - step) < .1) return;
    step = nextStep;
    track.style.height = `${step * count * 3 + stage.clientHeight}px`;
    writePosition(target);
  }

  function draw(now) {
    frame = 0;
    if (disposed || document.hidden) return;
    const dt = Math.min((now - previousTime) / 1000 || .016, .05); previousTime = now;
    if (isBlocked()) { animation = null; clearTimeout(timer); }
    if (animation) {
      const fraction = Math.min(1, (now - animation.start) / animation.duration);
      writePosition(animation.from + (animation.to - animation.from) * ease(fraction));
      if (fraction === 1) animation = null;
    }
    position += (target - position) * (getMotion() ? 1 - Math.exp(-dt * 10) : 1);
    if (Math.abs(target - position) < .0005) position = target;
    progress.current = position;
    const phase = wrapScene(position, count), scene = wrapScene(Math.round(position), count);
    const distance = Math.abs(position - Math.round(position));
    const opacity = 1 - ease(Math.max(0, Math.min(1, (distance - .16) / .27)));
    root.style.setProperty('--copy-opacity', String(opacity));
    root.style.setProperty('--copy-offset', `${(1 - opacity) * 10}px`);
    root.style.setProperty('--journey-progress', `${phase / count * 100}%`);
    if (scene !== active) { active = scene; onScene(scene); }
    if (!animation && Math.abs(position - Math.round(position)) < .006 && focusOnArrival) {
      requestAnimationFrame(() => { if (!disposed) root.querySelector('.scene-copy.is-active h1,.scene-copy.is-active h2')?.focus({ preventScroll: true }); });
      focusOnArrival = false;
    }
    frame = requestAnimationFrame(draw);
  }

  function visibility() {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; clearTimeout(timer); }
    else { previousTime = performance.now(); scheduleSnap(); if (!frame) frame = requestAnimationFrame(draw); }
  }
  const observer = new ResizeObserver(measure); observer.observe(stage);
  measure(); frame = requestAnimationFrame(draw);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('wheel', onWheel, { passive: true });
  window.addEventListener('pointerdown', down, { passive: true });
  window.addEventListener('pointerup', up, { passive: true });
  window.addEventListener('pointercancel', up, { passive: true });
  window.addEventListener('touchstart', touchStart, { passive: true });
  window.addEventListener('touchend', touchEnd, { passive: true });
  window.addEventListener('touchcancel', touchEnd, { passive: true });
  window.addEventListener('keydown', keydown);
  document.addEventListener('focusout', scheduleSnap);
  document.addEventListener('visibilitychange', visibility);
  return {
    go(index, focus = false) { animateTo(nearestOccurrence(index, target, count), focus); },
    stop: interrupt,
    dispose() {
      disposed = true; cancelAnimationFrame(frame); clearTimeout(timer); observer.disconnect(); history.scrollRestoration = oldRestoration;
      window.removeEventListener('scroll', onScroll); window.removeEventListener('wheel', onWheel);
      window.removeEventListener('pointerdown', down); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      window.removeEventListener('touchstart', touchStart); window.removeEventListener('touchend', touchEnd); window.removeEventListener('touchcancel', touchEnd);
      window.removeEventListener('keydown', keydown); document.removeEventListener('visibilitychange', visibility);
      document.removeEventListener('focusout', scheduleSnap);
    },
  };
}
