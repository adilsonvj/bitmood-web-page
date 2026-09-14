// The editorial chapter holds the last pillar's background; sculptures retain
// their original ten positions. Newsletter and home share the blue whales.
export function worldProgress(position) {
  const phase = ((position % 12) + 12) % 12;
  return phase <= 8 ? phase : phase < 9 ? 8 : phase < 11 ? phase - 1 : 10;
}
