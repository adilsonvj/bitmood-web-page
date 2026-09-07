// Every sculpture is assembled from the same whale fragments.
const point = (x, y, z, size = .24, part = "body") => ({ p: [x, y, z], size, part });
const lerp = (a, b, t) => a + (b - a) * t;
const line = (a, b, count, size = .18, part = "body") => Array.from({ length: count }, (_, i) => point(...a.map((v, k) => lerp(v, b[k], count === 1 ? .5 : i / (count - 1))), size, part));
function ring(cx, cy, cz, radius, count, size = .16, plane = "xy", start = 0) {
  return Array.from({ length: count }, (_, i) => {
    const a = start + i / count * Math.PI * 2;
    const x = Math.cos(a) * radius, y = Math.sin(a) * radius;
    return plane === "xz" ? point(cx+x, cy, cz+y, size) : plane === "yz" ? point(cx,cy+x,cz+y,size) : point(cx+x,cy+y,cz,size);
  });
}
function frame(cx, cy, cz, width, height, countPerEdge, size = .22) {
  const l=cx-width/2,r=cx+width/2,b=cy-height/2,t=cy+height/2;
  return [...line([l,b,cz],[r,b,cz],countPerEdge,size),...line([r,b,cz],[r,t,cz],countPerEdge,size),...line([r,t,cz],[l,t,cz],countPerEdge,size),...line([l,t,cz],[l,b,cz],countPerEdge,size)];
}
function fit(points, count) {
  if(points.length===count)return points;
  return Array.from({length:count},(_,i)=>{
    const index=Math.min(points.length-1,Math.floor(i*points.length/count));
    const source=points[index];
    return {...source,p:[...source.p]};
  });
}

export function buildSculptures(count=207) {
  // B: a closed vault, recessed door and unmistakable radial locking wheel.
  const vault=[...frame(0,0,-.48,3.9,3.35,13,.25),...frame(0,0,.63,3.9,3.35,13,.25),...frame(0,0,.83,3.1,2.62,10,.21)];
  for(const x of [-1.95,1.95])for(const y of [-1.67,1.67])vault.push(...line([x,y,-.48],[x,y,.63],5,.22));
  vault.push(...ring(0,0,1.01,.68,24,.15));
  for(let a=0;a<4;a++){const angle=a*Math.PI/2;vault.push(...line([Math.cos(angle)*.12,Math.sin(angle)*.12,1.04],[Math.cos(angle)*.64,Math.sin(angle)*.64,1.04],4,.13));}
  for(const y of [-.76,.76])vault.push(...line([1.61,y-.17,.93],[1.61,y+.17,.93],3,.16));
  vault.push(point(0,0,1.09,.24));

  // I: the approved pediment, paired columns and broad steps.
  const institution=[];
  for(const z of [-.65,.65])for(const x of [-2.05,-.68,.68,2.05])for(let j=0;j<9;j++)institution.push(point(x,-1.42+j*.355,z,.28));
  for(let tier=0;tier<3;tier++)for(let x=0;x<16;x++)for(const z of [-.65,.65])institution.push(point(-2.62+x*.349,-1.78-tier*.24,z,.24));
  for(let y=0;y<6;y++){const w=2.8*(1-y/6),n=Math.max(1,Math.round(w*3));for(let x=0;x<n;x++)institution.push(point(n===1?0:-w+2*w*x/(n-1),1.75+y*.22,0,.31));}
  while(institution.length<count){const j=institution.length;institution.push(point(-2.6+(j%16)*.345,1.55,j%2?.5:-.5,.25));}

  // T: five candles, wicks, a moving-average curve and three reference levels.
  const technical=[];
  const candles=[[-2.3,-.82,.8],[-1.15,-.28,1.25],[0,-.38,.72],[1.15,.4,1.72],[2.3,1.04,1.18]];
  for(const [x,y,h] of candles){
    for(const side of [-1,1])technical.push(...line([x+side*.19,y-h/2,.12],[x+side*.19,y+h/2,.12],9,.19));
    technical.push(...line([x,y-h/2-.52,.12],[x,y-h/2-.12,.12],4,.09),...line([x,y+h/2+.12,.12],[x,y+h/2+.48,.12],4,.09));
  }
  for(let i=0;i<37;i++){const t=i/36;technical.push(point(-2.9+t*5.8,-1.6+2.65*t+.17*Math.sin(t*Math.PI*2),.58,.11));}
  for(const y of [-1.55,-.1,1.36])technical.push(...line([-2.85,y,-.4],[2.85,y,-.4],13,.06));

  // M: meridians and parallels form a globe, with depth from every angle.
  const macro=[];
  for(let m=0;m<4;m++){
    const angle=m*Math.PI/4;
    for(let i=0;i<32;i++){const t=i/32*Math.PI*2;macro.push(point(2.2*Math.cos(t)*Math.cos(angle),2.2*Math.sin(t),2.2*Math.cos(t)*Math.sin(angle),.135));}
  }
  for(const latitude of [-.57,0,.57]){
    const y=Math.sin(latitude)*2.2,r=Math.cos(latitude)*2.2;
    macro.push(...ring(0,y,0,r,26,.125,"xz"));
  }

  // O1: three block frames joined in a continuous path.
  const onchain=[];
  const blocks=[[-2.3,-.84,.5],[0,.16,0],[2.3,1.06,-.5]];
  for(const [cx,cy,cz] of blocks){
    for(const dz of [-.63,.63])onchain.push(...frame(cx,cy,cz+dz,1.38,1.38,5,.17));
    for(const x of [-.69,.69])for(const y of [-.69,.69])onchain.push(...line([cx+x,cy+y,cz-.63],[cx+x,cy+y,cz+.63],4,.16));
  }
  for(let i=0;i<2;i++){
    const a=blocks[i],b=blocks[i+1];
    onchain.push(...line([a[0]+.75,a[1],a[2]],[b[0]-.75,b[1],b[2]],15,.10));
  }

  // O2: a processor, contacts and an inscribed central die.
  const ordinals=[...frame(0,0,0,3.2,3.2,11,.24),...frame(0,0,.27,2.27,2.27,8,.17)];
  for(let i=0;i<6;i++){
    const c=-1.23+i*.492;
    ordinals.push(...line([c,-1.68,-.06],[c,-2.32,-.06],4,.115),...line([c,1.68,-.06],[c,2.32,-.06],4,.115),...line([-1.68,c,-.06],[-2.32,c,-.06],4,.115),...line([1.68,c,-.06],[2.32,c,-.06],4,.115));
  }
  const glyph=["11101","10001","10111","10001","11101"];
  for(let y=0;y<5;y++)for(let x=0;x<5;x++)if(glyph[y][x]==="1")ordinals.push(point((x-2)*.3,(2-y)*.3,.52,.16));
  ordinals.push(...line([-.7,-.9,.43],[.7,-.9,.43],7,.11),...line([-.7,.9,.43],[.7,.9,.43],7,.11));

  // D: an actual lever and triangular fulcrum, with unequal arms/weights.
  const derivatives=[];
  for(const z of [-.43,.43]){
    derivatives.push(...line([-1,-1.95,z],[0,.16,z],12,.22),...line([0,.16,z],[1,-1.95,z],12,.22),...line([-1,-1.95,z],[1,-1.95,z],11,.22));
  }
  for(const z of [-.3,.3])derivatives.push(...line([-3.0,.36,z],[3.0,.36,z],26,.19,"lever"));
  for(const [cx,width,h] of [[-2.1,1.1,.78],[1.6,1.32,1.34]]){
    for(const z of [-.4,.4]){
      const f=frame(cx,.57+h/2,z,width,h,9,.23).map(p=>({...p,part:"lever"}));derivatives.push(...f);
    }
  }

  // Channels: an extruded play symbol with a loose orbit of connections.
  const play=[];
  const triangle=[[-1.32,-1.86],[2.03,0],[-1.32,1.86]];
  for(const z of [-.35,.35])for(let edge=0;edge<3;edge++){
    const a=triangle[edge],b=triangle[(edge+1)%3];
    play.push(...line([a[0],a[1],z],[b[0],b[1],z],23,.18));
  }
  for(const [x,y] of triangle)play.push(...line([x,y,-.35],[x,y,.35],5,.19));
  for(let row=0;row<7;row++){const x=-.94+row*.35,half=1.36*(1-row/7);play.push(...line([x,-half,0],[x,half,0],Math.max(2,8-row),.22));}
  play.push(...ring(.2,0,0,2.75,22,.095,"xz",.18));

  return [vault,institution,technical,macro,onchain,ordinals,derivatives,play].map(points=>fit(points,count));
}
