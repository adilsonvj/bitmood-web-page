// The editorial chapter holds the last pillar's background; sculptures retain
// their original ten positions, including the transition from channels to home.
export function worldProgress(position) {
  const phase = ((position % 11) + 11) % 11;
  return phase <= 8 ? phase : phase < 9 ? 8 : phase - 1;
}
