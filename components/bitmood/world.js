import * as THREE from "three";
import { buildSculptures } from "./sculptures.js";

const smooth = value => { const t = Math.max(0, Math.min(1, value)); return t*t*(3-2*t); };
const V = (x=0,y=0,z=0) => new THREE.Vector3(x,y,z);
const Q = (x=0,y=0,z=0) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x,y,z));

/**
 * @param {HTMLElement} host
 * @param {{signal: AbortSignal, getProgress: ()=>number, getMotion: ()=>boolean, onReady: ()=>void, onPulse: ()=>void, onError: ()=>void}} options
 */
export async function createWorld(host, options) {
  const response=await fetch("/experience/whale.json",{signal:options.signal});
  if(!response.ok)throw new Error("Whale asset unavailable");
  const model=await response.json();
  if(options.signal.aborted)return {dispose(){}};
  const renderer=new THREE.WebGLRenderer({alpha:false,antialias:true,powerPreference:"high-performance"});
  renderer.setClearColor(0x071b2e,1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,window.innerWidth<900?1.5:1.8));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
  renderer.domElement.setAttribute("aria-hidden","true");host.appendChild(renderer.domElement);
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x071b2e,.023);
  const camera=new THREE.PerspectiveCamera(33,1,.1,100);
  const world=new THREE.Group();scene.add(world);
  const key=new THREE.DirectionalLight(0xd3e5f4,3.2);key.position.set(-5,8,6);scene.add(key);
  const rim=new THREE.DirectionalLight(0x5b95ce,4);rim.position.set(4,3,-5);scene.add(rim);
  const fill=new THREE.DirectionalLight(0xa8c4dc,.65);fill.position.set(-4,-3,5);scene.add(fill);
  scene.add(new THREE.HemisphereLight(0xa8c4dc,0x071b2e,1.2));
  const envCanvas=document.createElement("canvas");envCanvas.width=1024;envCanvas.height=512;
  const ctx=envCanvas.getContext("2d");
  if(!ctx)throw new Error("Canvas unavailable");
  const gradient=ctx.createLinearGradient(0,0,0,512);gradient.addColorStop(0,"#103058");gradient.addColorStop(.45,"#345b80");gradient.addColorStop(1,"#071b2e");ctx.fillStyle=gradient;ctx.fillRect(0,0,1024,512);
  ctx.fillStyle="#c9ddec";ctx.fillRect(70,100,255,74);ctx.fillStyle="#5b95ce";ctx.fillRect(680,135,150,190);ctx.fillStyle="#a8c4dc";ctx.fillRect(420,60,120,22);
  const envTexture=new THREE.CanvasTexture(envCanvas);envTexture.mapping=THREE.EquirectangularReflectionMapping;envTexture.colorSpace=THREE.SRGBColorSpace;
  const pmrem=new THREE.PMREMGenerator(renderer);const env=pmrem.fromEquirectangular(envTexture);scene.environment=env.texture;envTexture.dispose();pmrem.dispose();
  const palette=[0x477fad,0x5b95ce,0x315c81,0x89b4d5,0x254c70,0xa8c4dc];
  const materials=palette.map((color,i)=>new THREE.MeshPhysicalMaterial({color,metalness:.38,roughness:.27+(i%3)*.055,clearcoat:.8,clearcoatRoughness:.22,envMapIntensity:1.05,flatShading:true}));
  let seed=527;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  const pieces=[];
  for(let i=0;i<model.pieces.length;i++){
    const data=model.pieces[i],bytes=Uint8Array.from(atob(data.v),c=>c.charCodeAt(0));
    const positions=Float32Array.from(new Int16Array(bytes.buffer),n=>n/4000);
    const geometry=new THREE.BufferGeometry();geometry.setAttribute("position",new THREE.BufferAttribute(positions,3));geometry.computeVertexNormals();
    const mesh=new THREE.Mesh(geometry,materials[data.p[1]<-.25?(i%5===0?1:5):i%palette.length]);world.add(mesh);
    const home=V(...data.p),direction=home.clone().normalize();direction.y+=.12;
    const spread=home.clone().multiplyScalar(1.6+random()*.6).add(direction.multiplyScalar(1.3+random()*1.4));spread.z+=(random()-.5)*8;
    pieces.push({mesh,home,data,phase:random()*Math.PI*2,rate:.3+random()*.35,spin:V(random()-.5,random()-.5,random()-.5),spread,seed:random(),rotation:Q((random()-.5)*1.8,(random()-.5)*2.2,(random()-.5)*1.4),targets:[]});
  }
  const sculptures=buildSculptures(pieces.length);
  const ranked=pieces.map((p,i)=>({i,s:p.data.s})).sort((a,b)=>b.s-a.s);
  for(let rank=0;rank<ranked.length;rank++){
    const p=pieces[ranked[rank].i];
    p.targets=[{p:p.home,s:1,q:Q(),part:"whale"},{p:p.spread,s:1,q:p.rotation,part:"expansion"}];
    for(let shape=0;shape<sculptures.length;shape++){
      const target=sculptures[shape][rank];
      p.targets.push({p:V(...target.p),s:target.size/p.data.s,q:Q(p.spin.x*.22,p.spin.y*.22,p.spin.z*.22),part:target.part});
    }
    p.targets.push({p:p.home,s:1,q:Q(),part:"whale"});
  }
  const eyeMaterial=new THREE.MeshPhysicalMaterial({color:0x071b2e,metalness:.35,roughness:.17,transparent:true});
  const eyeGeometry=new THREE.IcosahedronGeometry(.069,1);
  for(const side of [-1,1]){
    const position=V(-3.50,.17,.965*side);
    const nearest=pieces.reduce((best,p)=>p.home.distanceToSquared(position)<best.home.distanceToSquared(position)?p:best,pieces[0]);
    const eye=new THREE.Mesh(eyeGeometry,eyeMaterial);eye.position.copy(position.sub(nearest.home));eye.scale.set(1,.7,.42);nearest.mesh.add(eye);
  }
  const dust=[];for(let i=0;i<(window.innerWidth<900?130:260);i++)dust.push((random()-.5)*28,(random()-.5)*17,(random()-.5)*23);
  const dustGeometry=new THREE.BufferGeometry();dustGeometry.setAttribute("position",new THREE.Float32BufferAttribute(dust,3));
  const dustMaterial=new THREE.PointsMaterial({color:0xa8c4dc,size:.022,transparent:true,opacity:.42,sizeAttenuation:true,depthWrite:false});
  const particles=new THREE.Points(dustGeometry,dustMaterial);scene.add(particles);
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),hitPointer=new THREE.Vector2();
  const workingP=V(),workingQ=new THREE.Quaternion(),pulseP=V();
  let width=1,height=1,time=0,lastTime=0,frame=0,disposed=false,bursts=[];
  const views=[
    {x:.2,y:.7,yaw:-.12,roll:.065,scale:1},
    {x:0,y:.7,yaw:.12,roll:-.04,scale:1},
    {x:2.2,y:.95,yaw:-.27,roll:0,scale:1.1},
    {x:2.1,y:.85,yaw:.21,roll:0,scale:1},
    {x:2.0,y:.95,yaw:-.14,roll:.04,scale:1},
    {x:2.2,y:1.0,yaw:.2,roll:-.17,scale:1.05},
    {x:2.0,y:1.0,yaw:-.22,roll:0,scale:.97},
    {x:2.1,y:1.0,yaw:-.28,roll:.04,scale:1.04},
    {x:2.0,y:1.0,yaw:-.2,roll:-.02,scale:1},
    {x:2.2,y:1.0,yaw:.22,roll:0,scale:1.08},
    {x:2.2,y:1.2,yaw:-.50,roll:.16,scale:.82},
  ];
  function resize(){width=host.clientWidth;height=host.clientHeight;camera.aspect=width/Math.max(1,height);camera.updateProjectionMatrix();renderer.setSize(width,height,false);}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resize();
  function move(event){pointer.set(event.clientX/Math.max(1,width)-.5,event.clientY/Math.max(1,height)-.5);}
  function leave(){pointer.set(0,0);}
  let down=null;
  function pointerDown(event){down={x:event.clientX,y:event.clientY};}
  function click(event){
    if(!options.getMotion()||event.target.closest("a,button,input,label,[role=dialog]")||!down||Math.hypot(event.clientX-down.x,event.clientY-down.y)>8)return;
    hitPointer.set(event.clientX/width*2-1,-event.clientY/height*2+1);raycaster.setFromCamera(hitPointer,camera);
    const hits=raycaster.intersectObjects(pieces.map(p=>p.mesh),false);
    if(hits.length){bursts.push({p:world.worldToLocal(hits[0].point.clone()),t:time});bursts=bursts.slice(-3);options.onPulse();}
  }
  window.addEventListener("pointermove",move,{passive:true});document.addEventListener("pointerleave",leave);
  window.addEventListener("pointerdown",pointerDown,{passive:true});window.addEventListener("click",click);
  function contextLost(event){event.preventDefault();options.onError();if(frame)cancelAnimationFrame(frame);frame=0;}
  renderer.domElement.addEventListener("webglcontextlost",contextLost);
  function visibility(){if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;}else if(!disposed&&!frame)frame=requestAnimationFrame(animate);}
  document.addEventListener("visibilitychange",visibility);
  function draw(){
    const progress=THREE.MathUtils.clamp(options.getProgress(),0,10);
    const segment=Math.min(9,Math.floor(progress));const fraction=progress-segment;
    const mix=smooth((fraction-.12)/.76),motion=options.getMotion(),mobile=width<900;
    const current=views[segment],next=views[segment+1];
    const blend=key=>THREE.MathUtils.lerp(current[key],next[key],mix);
    const isWhale=1-smooth(progress/.6)+smooth((progress-9.5)/.5);
    const final=smooth((progress-9.2)/.8);
    const globalYaw=blend("yaw")+(motion?pointer.x*.10+Math.sin(time*.09)*.027:0);
    world.rotation.set(motion?.025*Math.sin(time*.11):0,globalYaw,mobile?THREE.MathUtils.lerp(.20,.04,smooth(progress/1.9))+final*.17:blend("roll"));
    const mobileY=1.45+smooth((progress-1.4)/.6)*1.1+final*.4;
    world.position.set(mobile?.02:blend("x"),mobile?mobileY:blend("y"),0);
    world.scale.setScalar(blend("scale")*(mobile?1-final*.07:1));
    const framedWidth=THREE.MathUtils.lerp(10.8,7.9,smooth((progress-1.4)/.6))+final*2.0;
    const distance=mobile?Math.max(21.8,framedWidth/(2*Math.tan(THREE.MathUtils.degToRad(16.5))*camera.aspect)):15;
    camera.position.set(Math.sin(progress*.63)*.5+(motion?pointer.x*.2:0),2.6+Math.sin(progress*.72)*.35-(motion?pointer.y*.2:0),distance-Math.sin(fraction*Math.PI)*.35);
    camera.lookAt(0,.85,0);
    eyeMaterial.opacity=Math.min(1,isWhale);
    bursts=bursts.filter(b=>time-b.t<2.5);
    for(const p of pieces){
      const from=p.targets[segment],to=p.targets[segment+1];
      // Stable endpoints and small staggering preserve scroll reversibility.
      const stagger=(segment===9?(p.home.x+4.6)/8.6:p.seed)*.10;
      const t=smooth(THREE.MathUtils.clamp((mix-stagger)/(1-stagger),0,1));
      workingP.lerpVectors(from.p,to.p,t);workingQ.slerpQuaternions(from.q,to.q,t);
      const arc=Math.sin(t*Math.PI);
      if(segment>0){
        if(segment===2){workingP.y+=arc*(.7+p.seed*1.2);workingP.z+=arc*p.spin.z*2;}
        else if(segment===3){workingP.x+=arc*p.spin.x*2.7;workingP.y+=arc*.6;}
        else if(segment===4||segment===8){workingP.x+=Math.sin(t*Math.PI*2)*p.spin.x*1.4;workingP.z+=arc*(1+p.seed*1.7);}
        else if(segment===5){workingP.y+=arc*Math.sin(p.phase)*1.1;workingP.z+=arc*p.spin.z*3;}
        else if(segment===6){workingP.z+=arc*(.4+p.seed*1.7);}
        else if(segment===7){workingP.x+=arc*Math.sign(to.p.x)*.85;workingP.y+=arc*p.spin.y;}
        else if(segment===9){workingP.z+=arc*(2+p.seed*2);workingP.y+=arc*.6;}
        else {workingP.y+=arc*.35;}
      }
      if(motion){
        const idle=.014+Math.sin(Math.min(progress,1)*Math.PI/2)*.019;
        workingP.x+=Math.sin(time*p.rate+p.phase)*idle;
        workingP.y+=Math.cos(time*p.rate*.7+p.phase)*idle*1.25;
        workingP.z+=Math.sin(time*p.rate*.8+p.phase)*idle;
        if(isWhale>.6&&p.data.k==="fin")workingP.y+=Math.sin(time*.65+p.home.z)*.034*isWhale;
        if(isWhale>.6&&p.data.k==="tail")workingP.y+=Math.sin(time*.62+p.home.z*.2)*.03*isWhale;
        const leverWeight=segment===7?t:segment===8?1-t:0;
        if(leverWeight>0&&p.targets[8].part==="lever"){
          const a=Math.sin(time*.38)*.035*leverWeight,x=workingP.x,y=workingP.y-.30;
          workingP.x=x*Math.cos(a)-y*Math.sin(a);workingP.y=.30+x*Math.sin(a)+y*Math.cos(a);
        }
        for(const burst of bursts){pulseP.subVectors(workingP,burst.p);const distance=pulseP.length(),age=time-burst.t-distance*.045;if(age>0){const force=Math.sin(Math.min(age*2.3,Math.PI))*Math.exp(-age*1.1)*.37/(1+distance*.25);workingP.addScaledVector(pulseP.normalize(),force);}}
      }
      p.mesh.position.copy(workingP);p.mesh.quaternion.copy(workingQ);p.mesh.scale.setScalar(THREE.MathUtils.lerp(from.s,to.s,t));
      if(motion){const small=Math.sin(time*p.rate*.5+p.phase)*.014;p.mesh.rotateX(small);p.mesh.rotateY(small*.75);}
    }
    particles.rotation.y=motion?time*.003:0;particles.position.y=motion?Math.sin(time*.025)*.25:0;
    renderer.render(scene,camera);
  }
  function animate(now){frame=0;if(disposed||document.hidden)return;const dt=Math.min((now-lastTime)/1000||.016,.05);lastTime=now;if(options.getMotion())time+=dt;draw();frame=requestAnimationFrame(animate);}
  draw();options.onReady();frame=requestAnimationFrame(animate);
  function dispose(){
    if(disposed)return;disposed=true;if(frame)cancelAnimationFrame(frame);resizeObserver.disconnect();
    window.removeEventListener("pointermove",move);document.removeEventListener("pointerleave",leave);window.removeEventListener("pointerdown",pointerDown);window.removeEventListener("click",click);document.removeEventListener("visibilitychange",visibility);renderer.domElement.removeEventListener("webglcontextlost",contextLost);
    pieces.forEach(p=>p.mesh.geometry.dispose());materials.forEach(m=>m.dispose());eyeGeometry.dispose();eyeMaterial.dispose();dustGeometry.dispose();dustMaterial.dispose();env.dispose();renderer.dispose();renderer.domElement.remove();
  }
  options.signal.addEventListener("abort",dispose,{once:true});
  return {dispose};
}
