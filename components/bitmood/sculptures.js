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

const fibonacciTransform=(x,y,z)=>[(x+7)*5.6/34,(y-5.5)*5.6/34,z];
export function fibonacciGuidePoints() {
  const squares=[[0,0,1],[1,0,1],[0,1,2],[-3,0,3],[-3,-5,5],[2,-5,8],[-3,3,13],[-24,-5,21]];
  return squares.flatMap(([x,y,s])=>{
    const corners=[[x,y],[x+s,y],[x+s,y+s],[x,y+s]];
    return corners.flatMap((p,i)=>[fibonacciTransform(...p,-.22),fibonacciTransform(...corners[(i+1)%4],-.22)]);
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

  // T: continuous quarter arcs in Fibonacci squares (1,1,2,3,5,8,13,21).
  const technical=[];
  const arcs=[[1,1,1,Math.PI],[1,1,1,Math.PI*1.5],[0,1,2,0],[0,0,3,Math.PI/2],[2,0,5,Math.PI],[2,3,8,Math.PI*1.5],[-3,3,13,0],[-3,-5,21,Math.PI/2]];
  const scale=5.6/34,curveBudget=count;
  const arcWeights=arcs.map(a=>Math.sqrt(a[2])),weightSum=arcWeights.reduce((a,b)=>a+b,0);
  for(let arc=0;arc<arcs.length;arc++){
    const [cx,cy,r,start]=arcs[arc];
    const amount=arc===arcs.length-1?curveBudget-technical.length:Math.round(curveBudget*arcWeights[arc]/weightSum);
    for(let i=0;i<amount;i++){
      const angle=start+(i/Math.max(1,amount-1))*Math.PI/2;
      const thickness=Math.min(.18,.026+r*.008),phase=i*2.4;
      const radial=r+Math.cos(phase)*thickness/scale;
      technical.push(point(...fibonacciTransform(cx+radial*Math.cos(angle),cy+radial*Math.sin(angle),.20+Math.sin(phase)*thickness),Math.min(.22,.06+r*.013),"spiral"));
    }
  }

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

  // O1: original growth rings, restored after visual review.
  const onchain=[];
  const radii=[.38,.83,1.30,1.80,2.34],totalRadius=radii.reduce((sum,r)=>sum+r,0);
  for(let layer=0;layer<radii.length;layer++){
    const radius=radii[layer];
    const amount=layer===radii.length-1?count-onchain.length:Math.round(count*radius/totalRadius);
    for(let i=0;i<amount;i++){
      const angle=.30+.11+ i/Math.max(1,amount-1)*(Math.PI*2-.22);
      const grain=1+.045*Math.sin(3*angle+.4)+.025*Math.cos(7*angle)+.012*Math.sin(11*angle+layer*.6);
      const r=radius*grain;
      onchain.push(point(r*Math.cos(angle)+.065*Math.sin(layer),r*Math.sin(angle)*.94,.10*Math.sin(2*angle+layer*.5),layer===4?.22:.17,`growth-ring-${layer}`));
    }
  }

  // O2 reuses the closed, tilted cubes; recessed face cells form three carved glyphs.
  const blocks=[[-2.45,-.68,.65],[0,.1,0],[2.45,.88,-.65]];
  function cube(center,edge,resolution,size,part="body",angles=[0,0,0],glyph=null){
    const points=[];
    const rotate=(p)=>{
      let [x,y,z]=p;const [rx,ry,rz]=angles;
      [y,z]=[y*Math.cos(rx)-z*Math.sin(rx),y*Math.sin(rx)+z*Math.cos(rx)];
      [x,z]=[x*Math.cos(ry)+z*Math.sin(ry),-x*Math.sin(ry)+z*Math.cos(ry)];
      [x,y]=[x*Math.cos(rz)-y*Math.sin(rz),x*Math.sin(rz)+y*Math.cos(rz)];
      return [x+center[0],y+center[1],z+center[2]];
    };
    // A closed voxel shell has real front, side, top, and rear surfaces.
    for(let u=0;u<resolution;u++)for(let v=0;v<resolution;v++)for(let w=0;w<resolution;w++){
      if(![u,v,w].some(n=>n===0||n===resolution-1))continue;
      const local=[u,v,w].map(n=>(n-(resolution-1)/2)*edge/resolution);
      const carved=w===resolution-1 && glyph?.[resolution-1-v]?.[u]==="1";
      if(carved)local[2]-=edge*.16;
      points.push({...point(...rotate(local),carved?size*.60:size,carved?"inscription":part),r:angles});
    }
    return points;
  }
  const ordinals=[];
  const glyphs=[
    ["00000","01010","01010","01110","00000"],
    ["00000","01110","00100","00100","00000"],
    ["00000","01110","01000","01110","00000"],
  ];
  blocks.forEach((center,index)=>ordinals.push(...cube(center,index===1?2.05:1.65,5,index===1?.32:.26,"block",[.22,-.38,.05],glyphs[index])));
  for(let i=0;i<2;i++){
    const a=blocks[i],b=blocks[i+1];
    ordinals.push(...line([a[0]+.83,a[1],a[2]],[b[0]-.83,b[1],b[2]],3,.11,"link"));
  }

  // D: the small weight has the long arm; its lower end raises the heavy block.
  const derivatives=[];
  for(const z of [-.43,.43]){
    derivatives.push(...line([.18,-1.95,z],[1,.16,z],12,.22),...line([1,.16,z],[1.82,-1.95,z],12,.22),...line([.18,-1.95,z],[1.82,-1.95,z],11,.22));
  }
  for(const z of [-.3,.3])derivatives.push(...line([-3.4,.36,z],[2.6,.36,z],27,.19,"lever"));
  derivatives.push(...cube([-2.83,.88,0],.85,4,.16,"weight"),...cube([1.97,1.17,0],1.4,4,.28,"weight"));
  for(const p of derivatives)if(p.part==="lever"||p.part==="weight"){
    const x=p.p[0]-1,y=p.p[1]-.30,a=.19;
    p.p[0]=1+x*Math.cos(a)-y*Math.sin(a);p.p[1]=.30+x*Math.sin(a)+y*Math.cos(a);p.r=[0,0,a];
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
