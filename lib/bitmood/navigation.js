export const wrapScene = (position, count) => ((position % count) + count) % count;

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

// A long paragraph must remain scrollable before a vertical key changes scenes.
export function canScrollCopy(target, direction) {
  const copy = target?.closest?.('.scene-copy.is-active');
  if (!copy || copy.scrollHeight <= copy.clientHeight + 2) return false;
  return direction < 0 ? copy.scrollTop > 1 : copy.scrollTop < copy.scrollHeight - copy.clientHeight - 1;
}

/** A native snap scrollport drives the fixed 3D stage. No wheel/touch interception. */
export function createJourney({ root, track, stage, count, progress, getMotion, isBlocked, onScene }) {
  let step = 1, offset = -count, position = 0, target = 0;
  let animation = null, timer = 0, frame = 0, snapFrame = 0, previousTime = 0, touching = false;
  let active = -1, focusOnArrival = false, disposed = false;
  const nativeSnap = globalThis.CSS?.supports?.('scroll-snap-type', 'y mandatory') ?? false;
  const oldRestoration = history.scrollRestoration;
  history.scrollRestoration = 'manual';
  const ease = t => t * t * (3 - 2 * t);

  function holdSnap() {
    cancelAnimationFrame(snapFrame); snapFrame = 0;
    track.classList.add('is-repositioning');
  }
  function releaseSnap() {
    cancelAnimationFrame(snapFrame);
    snapFrame = requestAnimationFrame(() => {
      snapFrame = 0;
      if (!disposed && !animation) track.classList.remove('is-repositioning');
    });
  }
  function writePosition(value) {
    const native = recenterScroll((value - offset) * step, offset, step, count);
    offset = native.offset; target = value;
    track.scrollTo({ top: native.scroll, behavior: 'instant' });
  }
  function animateTo(value, focus = false) {
    clearTimeout(timer); holdSnap(); focusOnArrival = focus;
    if (!getMotion()) {
      animation = null; writePosition(value); position = value; releaseSnap(); return;
    }
    animation = { from: target, to: value, start: performance.now(), duration: 500 };
  }
  function settle() {
    if (touching || isBlocked() || animation) return;
    // Recenter after native snapping settles, without interrupting touch momentum.
    const nearest = Math.round(target);
    if (Math.abs(target - nearest) > .002) {
      if (!nativeSnap && !ignoresSceneKeys(document.activeElement)) animateTo(nearest);
      return;
    }
    const native = recenterScroll(track.scrollTop, offset, step, count);
    if (Math.abs(native.scroll - track.scrollTop) > 1) {
      holdSnap(); offset = native.offset;
      track.scrollTo({ top: native.scroll, behavior: 'instant' }); releaseSnap();
    }
  }
  function scheduleSettle() {
    clearTimeout(timer);
    if (!animation && !touching && !isBlocked()) timer = window.setTimeout(settle, 160);
  }
  function onScroll(event) {
    if ((event?.target && event.target !== track) || isBlocked()) return;
    target = track.scrollTop / step + offset;
    scheduleSettle();
  }
  function interrupt() {
    animation = null; focusOnArrival = false; clearTimeout(timer); releaseSnap();
  }
  function onWheel() { if (!isBlocked()) { interrupt(); scheduleSettle(); } }
  function down(event) { if (event.pointerType !== 'touch') touching = true; interrupt(); }
  function up(event) { if (event.pointerType !== 'touch') { touching = false; scheduleSettle(); } }
  function touchStart() { touching = true; interrupt(); }
  function touchEnd(event) { touching = event.touches.length > 0; if (!touching) scheduleSettle(); }
  function keydown(event) {
    if (isBlocked() || event.altKey || event.ctrlKey || event.metaKey || ignoresSceneKeys(event.target)) return;
    const vertical = ['ArrowDown', 'PageDown'].includes(event.key) ? 1
      : ['ArrowUp', 'PageUp'].includes(event.key) ? -1
      : event.key === ' ' && !event.target.closest?.('button,a') ? (event.shiftKey ? -1 : 1) : 0;
    if (vertical && canScrollCopy(event.target, vertical)) return;
    const anchor = animation ? animation.to : Math.round(target);
    let destination;
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
    const nextStep = Math.max(1, stage.clientHeight);
    if (Math.abs(nextStep - step) < .1) return;
    holdSnap(); animation = null; step = nextStep;
    root.style.setProperty('--scene-step', step + 'px');
    writePosition(target); releaseSnap();
  }
  function draw(now) {
    frame = 0;
    if (disposed || document.hidden) return;
    const dt = Math.min((now - previousTime) / 1000 || .016, .05); previousTime = now;
    if (isBlocked() && animation) interrupt();
    if (animation) {
      const fraction = Math.min(1, (now - animation.start) / animation.duration);
      writePosition(animation.from + (animation.to - animation.from) * ease(fraction));
      if (fraction === 1) { animation = null; releaseSnap(); }
    }
    position += (target - position) * (getMotion() ? 1 - Math.exp(-dt * 18) : 1);
    if (Math.abs(target - position) < .0005) position = target;
    progress.current = position;
    const phase = wrapScene(position, count), scene = wrapScene(Math.round(position), count);
    const distance = Math.abs(position - Math.round(position));
    const opacity = 1 - ease(Math.max(0, Math.min(1, (distance - .16) / .27)));
    root.style.setProperty('--copy-opacity', String(opacity));
    root.style.setProperty('--copy-offset', ((1 - opacity) * 6) + 'px');
    root.style.setProperty('--journey-progress', (phase / count * 100) + '%');
    if (scene !== active) { active = scene; onScene(scene); }
    if (!animation && Math.abs(position - Math.round(position)) < .006 && focusOnArrival) {
      requestAnimationFrame(() => {
        if (disposed) return;
        const copy = root.querySelector('.scene-copy.is-active');
        if (copy) copy.scrollTop = 0;
        copy?.querySelector('h1,h2')?.focus({ preventScroll: true });
      });
      focusOnArrival = false;
    }
    frame = requestAnimationFrame(draw);
  }
  function visibility() {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; clearTimeout(timer); }
    else { previousTime = performance.now(); scheduleSettle(); if (!frame) frame = requestAnimationFrame(draw); }
  }
  const observer = new ResizeObserver(measure); observer.observe(stage);
  measure(); frame = requestAnimationFrame(draw);
  track.addEventListener('scroll', onScroll, { passive: true });
  track.addEventListener('scrollend', settle, { passive: true });
  track.addEventListener('wheel', onWheel, { passive: true });
  track.addEventListener('pointerdown', down, { passive: true });
  window.addEventListener('pointerup', up, { passive: true });
  window.addEventListener('pointercancel', up, { passive: true });
  track.addEventListener('touchstart', touchStart, { passive: true });
  track.addEventListener('touchend', touchEnd, { passive: true });
  track.addEventListener('touchcancel', touchEnd, { passive: true });
  window.addEventListener('keydown', keydown);
  document.addEventListener('focusout', scheduleSettle);
  document.addEventListener('visibilitychange', visibility);
  return {
    go(index, focus = false) { animateTo(nearestOccurrence(index, target, count), focus); },
    stop: interrupt,
    dispose() {
      disposed = true; cancelAnimationFrame(frame); cancelAnimationFrame(snapFrame); clearTimeout(timer);
      observer.disconnect(); history.scrollRestoration = oldRestoration; track.classList.remove('is-repositioning');
      track.removeEventListener('scroll', onScroll); track.removeEventListener('scrollend', settle); track.removeEventListener('wheel', onWheel);
      track.removeEventListener('pointerdown', down); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      track.removeEventListener('touchstart', touchStart); track.removeEventListener('touchend', touchEnd); track.removeEventListener('touchcancel', touchEnd);
      window.removeEventListener('keydown', keydown); document.removeEventListener('focusout', scheduleSettle); document.removeEventListener('visibilitychange', visibility);
    },
  };
}
