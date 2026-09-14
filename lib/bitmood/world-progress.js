// Five home sections, while dedicated pillars retain original sculpture indices.
export function worldProgress(position) {
  const phase = ((position % 5) + 5) % 5;
  const frames = [0,1,1,9,10,10];
  const index = Math.floor(phase);
  return frames[index] + (frames[index+1]-frames[index])*(phase-index);
}
