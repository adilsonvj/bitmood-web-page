import * as THREE from "three";
import { buildSculptures } from "./sculptures.js";
import { wrapScene } from "../../lib/bitmood/navigation.js";

const smooth = value => { const t = Math.max(0, Math.min(1, value)); return t*t*(3-2*t); };
const V = (x=0,y=0,z=0) => new THREE.Vector3(x,y,z);
const Q = (x=0,y=0,z=0,order="XYZ") => new THREE.Quaternion().setFromEuler(new THREE.Euler(x,y,z,order));
const decode = encoded => Float32Array.from(new Int16Array(Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)).buffer),n=>n/4000);

/**
 * @param {HTMLElement} host
 * @param {{signal: AbortSignal, getProgress: ()=>number, getMotion: ()=>boolean, onReady: ()=>void, onPulse: ()=>void, onError: ()=>void}} options
 */
export async function createWorld(host, options) {
  const response=await fetch("/experience/cetaceans.json",{signal:options.signal});
  if(!response.ok)throw new Error("Cetacean asset unavailable");
  const model=await response.json();
  if(options.signal.aborted)return {dispose(){}};
  const renderer=new THREE.WebGLRenderer({alpha:false,antialias:true,powerPreference:"high-performance"});
  renderer.setClearColor(0x071b2e,1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,window.innerWidth<900?1.5:1.8));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
  renderer.domElement.setAttribute("aria-hidden","true");host.appendChild(renderer.domElement);
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x071b2e,.020);
  const camera=new THREE.PerspectiveCamera(33,1,.1,100),world=new THREE.Group();scene.add(world);
  const key=new THREE.DirectionalLight(0xd3e5f4,3.2);key.position.set(-5,8,6);scene.add(key);
  const rim=new THREE.DirectionalLight(0x5b95ce,4);rim.position.set(4,3,-5);scene.add(rim);
  const fill=new THREE.DirectionalLight(0xa8c4dc,.65);fill.position.set(-4,-3,5);scene.add(fill);
  scene.add(new THREE.HemisphereLight(0xa8c4dc,0x071b2e,1.2));
  const envCanvas=document.createElement("canvas");envCanvas.width=1024;envCanvas.height=512;
  const ctx=envCanvas.getContext("2d");if(!ctx)throw new Error("Canvas unavailable");
  const gradient=ctx.createLinearGradient(0,0,0,512);gradient.addColorStop(0,"#103058");gradient.addColorStop(.45,"#345b80");gradient.addColorStop(1,"#071b2e");ctx.fillStyle=gradient;ctx.fillRect(0,0,1024,512);
  ctx.fillStyle="#c9ddec";ctx.fillRect(70,100,255,74);ctx.fillStyle="#5b95ce";ctx.fillRect(680,135,150,190);ctx.fillStyle="#a8c4dc";ctx.fillRect(420,60,120,22);
  const envTexture=new THREE.CanvasTexture(envCanvas);envTexture.mapping=THREE.EquirectangularReflectionMapping;envTexture.colorSpace=THREE.SRGBColorSpace;
  const pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromEquirectangular(envTexture);scene.environment=environment.texture;envTexture.dispose();pmrem.dispose();
  const palette=[0x477fad,0x5b95ce,0x315c81,0x89b4d5,0x254c70,0xa8c4dc];
  const materialMap=new Map();
  function materialFor(data,index){
    const blue=palette[data.l[1]<-.25?(index%5===0?1:5):index%palette.length];
    const orca=data.o.pale?0xdcebf5:[0x071b2e,0x103058,0x163a5b][index%3],id=`${blue}-${orca}`;
    if(!materialMap.has(id)){
      const material=new THREE.MeshPhysicalMaterial({color:blue,metalness:.34,roughness:.30,clearcoat:.8,clearcoatRoughness:.22,envMapIntensity:1.0,flatShading:true});
      materialMap.set(id,{material,blue:new THREE.Color(blue),orca:new THREE.Color(orca)});
    }
    return materialMap.get(id).material;
  }
  let seed=527;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  const pieces=[];
  for(let i=0;i<model.pieces.length;i++){
    const data=model.pieces[i],geometry=new THREE.BufferGeometry(),orcaGeometry=new THREE.BufferGeometry();
    geometry.setAttribute("position",new THREE.BufferAttribute(decode(data.v),3));geometry.computeVertexNormals();
    orcaGeometry.setAttribute("position",new THREE.BufferAttribute(decode(data.o.v),3));orcaGeometry.computeVertexNormals();
    geometry.morphAttributes.position=[orcaGeometry.getAttribute("position")];geometry.morphAttributes.normal=[orcaGeometry.getAttribute("normal")];
    const indexedBox=new THREE.BoxGeometry(data.s*1.16,data.s*1.16,data.s*1.16),box=indexedBox.toNonIndexed();indexedBox.dispose();
    const cubePositions=new Float32Array(geometry.getAttribute("position").array.length),cubeNormals=new Float32Array(cubePositions.length);
    for(let n=0;n<cubePositions.length;n++){cubePositions[n]=box.getAttribute("position").array[n%108];cubeNormals[n]=box.getAttribute("normal").array[n%108];}
    geometry.morphAttributes.position.push(new THREE.BufferAttribute(cubePositions,3));geometry.morphAttributes.normal.push(new THREE.BufferAttribute(cubeNormals,3));box.dispose();
    geometry.computeBoundingSphere();orcaGeometry.dispose();
    const mesh=new THREE.Mesh(geometry,materialFor(data,i));mesh.frustumCulled=false;world.add(mesh);
    const home=V(...data.p),direction=home.clone().normalize();direction.y+=.12;
    const spread=home.clone().multiplyScalar(1.6+random()*.6).add(direction.multiplyScalar(1.3+random()*1.4));spread.z+=(random()-.5)*8;
    pieces.push({mesh,home,data,phase:random()*Math.PI*2,rate:.3+random()*.35,spin:V(random()-.5,random()-.5,random()-.5),spread,seed:random(),rotation:Q((random()-.5)*1.8,(random()-.5)*2.2,(random()-.5)*1.4),targets:[]});
  }
  const sculptures=buildSculptures(pieces.length),ranked=pieces.map((p,i)=>({i,s:p.data.s})).sort((a,b)=>b.s-a.s);
  for(let rank=0;rank<ranked.length;rank++){
    const p=pieces[ranked[rank].i];
    p.targets=[{p:p.home,s:1,q:Q(),part:p.data.k,animal:model.animals[p.data.a],local:p.data.l},{p:p.spread,s:1,q:p.rotation,part:"expansion"},{p:V(...p.data.o.p),s:1,q:Q(),part:p.data.o.k,animal:model.orcas[p.data.o.a],local:p.data.o.l}];
    for(let shape=1;shape<sculptures.length;shape++){
      const target=sculptures[shape][rank];
      p.targets.push({p:V(...target.p),s:target.size/p.data.s,q:target.r?Q(...target.r,"ZYX"):Q(p.spin.x*.22,p.spin.y*.22,p.spin.z*.22),part:target.part});
    }
  }

  // The light source is inside each animal. Opaque facets occlude these tapered,
  // depth-tested beams; the open seams let the light reach the surrounding water.
  const lightRigs=[],eyeRigs=[],eyeGeometry=new THREE.IcosahedronGeometry(.060,1);
  const rayGeometry=new THREE.CylinderGeometry(.48,.018,3.8,16,1,true);rayGeometry.translate(0,1.9,0);
  const coreGeometry=new THREE.IcosahedronGeometry(.12,1);
  for(const [kind,animals] of [[0,model.animals],[2,model.orcas]])for(const animal of animals){
    const group=new THREE.Group();world.add(group);
    const point=new THREE.PointLight(0x8bc9f4,0,6*animal.scale,2);group.add(point);
    const coreMaterial=new THREE.MeshBasicMaterial({color:0xd8efff,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
    const core=new THREE.Mesh(coreGeometry,coreMaterial);core.scale.setScalar(animal.scale);group.add(core);
    const rayMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
      uniforms:{strength:{value:0}},
      vertexShader:'varying vec2 rayUv; void main(){rayUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader:'varying vec2 rayUv; uniform float strength; void main(){float edge=pow(max(0.0,sin(rayUv.x*3.14159265)),2.0);float fade=pow(1.0-rayUv.y,1.7)*smoothstep(0.0,0.07,rayUv.y);gl_FragColor=vec4(0.36,0.67,0.96,strength*edge*fade);}'
    });
    const rays=[];
    for(let i=0;i<5;i++){const ray=new THREE.Mesh(rayGeometry,rayMaterial);ray.scale.setScalar(animal.scale);group.add(ray);rays.push(ray);}
    lightRigs.push({kind,animal,group,point,coreMaterial,rayMaterial,rays});
    const material=new THREE.MeshPhysicalMaterial({color:0x030d17,metalness:.2,roughness:.2,transparent:true});
    for(const pos of animal.eyes){const eye=new THREE.Mesh(eyeGeometry,material);eye.scale.set(animal.scale,animal.scale*.7,animal.scale*.45);world.add(eye);eyeRigs.push({kind,animal,eye,base:V(...pos),material});}
  }
  const dust=[];for(let i=0;i<(window.innerWidth<900?130:260);i++)dust.push((random()-.5)*28,(random()-.5)*17,(random()-.5)*23);
  const dustGeometry=new THREE.BufferGeometry();dustGeometry.setAttribute("position",new THREE.Float32BufferAttribute(dust,3));
  const dustMaterial=new THREE.PointsMaterial({color:0xa8c4dc,size:.022,transparent:true,opacity:.42,sizeAttenuation:true,depthWrite:false});
  const particles=new THREE.Points(dustGeometry,dustMaterial);scene.add(particles);
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),hitPointer=new THREE.Vector2();
  const workingP=V(),fromP=V(),toP=V(),workingQ=new THREE.Quaternion(),fromQ=new THREE.Quaternion(),toQ=new THREE.Quaternion(),pulseP=V(),direction=V(),upAxis=V(0,1,0),swimRotation=new THREE.Quaternion();
  let width=1,height=1,time=0,lastTime=0,frame=0,disposed=false,bursts=[];
  const views=[
    {x:2.65,y:1.15,yaw:-.16,roll:-.025,scale:1,distance:16.2,mobileY:4.2,framing:10.6},
    {x:0,y:.7,yaw:.12,roll:-.04,scale:1,distance:15,mobileY:2.7,framing:11.0},
    {x:2.25,y:1.05,yaw:-.22,roll:-.015,scale:1.12,distance:15,mobileY:3.55,framing:9.1},
    {x:2.1,y:.85,yaw:.21,roll:0,scale:1,distance:15,mobileY:2.55,framing:7.9},
    {x:2.0,y:.95,yaw:-.14,roll:.04,scale:1,distance:15,mobileY:2.55,framing:7.9},
    {x:2.2,y:1.0,yaw:.2,roll:-.17,scale:1.05,distance:15,mobileY:2.55,framing:7.9},
    {x:2.0,y:1.0,yaw:-.24,roll:0,scale:.96,distance:15,mobileY:2.6,framing:8.1},
    {x:2.1,y:1.0,yaw:-.22,roll:.04,scale:1.04,distance:15,mobileY:2.7,framing:7.9},
    {x:2.0,y:1.0,yaw:-.2,roll:-.02,scale:1,distance:15,mobileY:2.55,framing:8.0},
    {x:2.2,y:1.0,yaw:.22,roll:0,scale:1.08,distance:15,mobileY:2.55,framing:7.9},
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

  function swim(target,position,quaternion,motion){
    position.copy(target.p);quaternion.copy(target.q);
    if(!target.animal||!motion)return;
    const a=target.animal,[x,,z]=target.local,phase=time*.82+a.phase;
    const tail=smooth((x+.9)/4.4),bend=Math.sin(phase-x*.55)*tail;
    position.x+=Math.sin(time*.19+a.phase)*.22*a.scale;
    position.y+=(Math.sin(phase*.56)*.14+bend*.43)*a.scale;
    position.z+=Math.sin(time*.23+a.phase)*.11*a.scale;
    const angle=(Math.cos(phase-x*.55)*tail*-.11+.014*Math.sin(phase*.56));
    swimRotation.setFromEuler(new THREE.Euler(0,Math.sin(phase)*tail*.035,angle));quaternion.premultiply(swimRotation);
    if(target.part==='fin'){
      position.y+=Math.sin(phase+.7)*Math.abs(z)*.15*a.scale;
      swimRotation.setFromAxisAngle(V(1,0,0),Math.sin(phase+.7)*Math.sign(z)*.10);quaternion.premultiply(swimRotation);
    }
  }
  function draw(){
    const progress=wrapScene(options.getProgress(),views.length),segment=Math.floor(progress),nextIndex=(segment+1)%views.length,fraction=progress-segment;
    const mix=smooth((fraction-.12)/.76),motion=options.getMotion(),mobile=width<900;
    const current=views[segment],next=views[nextIndex],blend=key=>THREE.MathUtils.lerp(current[key],next[key],mix);
    const weight=chapter=>(segment===chapter?1-mix:0)+(nextIndex===chapter?mix:0);
    const whaleWeight=weight(0),orcaWeight=weight(2),angle=progress/views.length*Math.PI*2;
    world.rotation.set(motion?.025*Math.sin(time*.11):0,blend("yaw")+(motion?pointer.x*.10+Math.sin(time*.09)*.027:0),blend("roll"));
    world.position.set(mobile?.02:blend("x"),mobile?blend("mobileY"):blend("y"),0);world.scale.setScalar(blend("scale"));
    const distance=mobile?Math.max(21.8,blend("framing")/(2*Math.tan(THREE.MathUtils.degToRad(16.5))*camera.aspect)):blend("distance");
    camera.position.set(Math.sin(angle)*.35+(motion?pointer.x*.2:0),2.6+Math.sin(angle)*.25-(motion?pointer.y*.2:0),distance-Math.sin(fraction*Math.PI)*.35);camera.lookAt(0,.85,0);
    for(const {material,blue,orca} of materialMap.values())material.color.lerpColors(blue,orca,orcaWeight);
    bursts=bursts.filter(b=>time-b.t<2.5);
    for(const p of pieces){
      const from=p.targets[segment],to=p.targets[nextIndex];
      const stagger=(segment===9?(p.home.x+4.6)/9.4:p.seed)*.08;
      const t=smooth(THREE.MathUtils.clamp((mix-stagger)/(1-stagger),0,1));
      swim(from,fromP,fromQ,motion);swim(to,toP,toQ,motion);
      workingP.lerpVectors(fromP,toP,t);workingQ.slerpQuaternions(fromQ,toQ,t);
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
        const idle=.014+(1-whaleWeight)*.019;
        workingP.x+=Math.sin(time*p.rate+p.phase)*idle;workingP.y+=Math.cos(time*p.rate*.7+p.phase)*idle*1.25;workingP.z+=Math.sin(time*p.rate*.8+p.phase)*idle;
        const leverWeight=segment===7?t:segment===8?1-t:0;
        if(leverWeight>0&&['lever','weight'].includes(p.targets[8].part)){
          const a=Math.sin(time*.38)*.020*leverWeight,x=workingP.x-1,y=workingP.y-.30;
          workingP.x=1+x*Math.cos(a)-y*Math.sin(a);workingP.y=.30+x*Math.sin(a)+y*Math.cos(a);
        }
        for(const burst of bursts){pulseP.subVectors(workingP,burst.p);const distance=pulseP.length(),age=time-burst.t-distance*.045;if(age>0){const force=Math.sin(Math.min(age*2.3,Math.PI))*Math.exp(-age*1.1)*.30/(1+distance*.25);workingP.addScaledVector(pulseP.normalize(),force);}}
      }
      p.mesh.position.copy(workingP);p.mesh.quaternion.copy(workingQ);p.mesh.scale.setScalar(THREE.MathUtils.lerp(from.s,to.s,t));
      p.mesh.morphTargetInfluences[0]=segment===2?1-t:nextIndex===2?t:0;
      p.mesh.morphTargetInfluences[1]=(['block','weight'].includes(from.part)?1-t:0)+(['block','weight'].includes(to.part)?t:0);
      if(motion){const small=Math.sin(time*p.rate*.5+p.phase)*.011*(1-p.mesh.morphTargetInfluences[1]*.8);p.mesh.rotateX(small);p.mesh.rotateY(small*.75);}
    }
    for(const rig of lightRigs){
      const a=rig.animal,w=rig.kind===0?whaleWeight:orcaWeight;
      rig.group.visible=w>.002;
      const phase=time*.82+a.phase;
      rig.group.position.set(a.center[0]+(-1.2+Math.sin(time*.48+a.phase)*1.25)*a.scale+Math.sin(time*.19+a.phase)*.22*a.scale,a.center[1]+(.14*Math.sin(phase*.56)+.16*Math.cos(time*.5+a.phase))*a.scale,a.center[2]+Math.sin(time*.39+a.phase)*.3*a.scale);
      rig.point.intensity=w*(9+Math.sin(time*.56+a.phase)*2)*a.scale*a.scale;rig.coreMaterial.opacity=w*.60;rig.rayMaterial.uniforms.strength.value=w*.12;
      for(let i=0;i<rig.rays.length;i++){
        const a0=i/rig.rays.length*Math.PI*2+time*.18+a.phase;
        direction.set(.22*Math.sin(time*.27+i),Math.cos(a0),Math.sin(a0)).normalize();rig.rays[i].quaternion.setFromUnitVectors(upAxis,direction);
      }
    }
    for(const rig of eyeRigs){
      const w=rig.kind===0?whaleWeight:orcaWeight,a=rig.animal;rig.eye.visible=w>.02;rig.material.opacity=w;
      rig.eye.position.copy(rig.base);
      if(motion){rig.eye.position.x+=Math.sin(time*.19+a.phase)*.22*a.scale;rig.eye.position.y+=Math.sin((time*.82+a.phase)*.56)*.14*a.scale;rig.eye.position.z+=Math.sin(time*.23+a.phase)*.11*a.scale;}
    }
    particles.rotation.y=time*.003;particles.position.y=Math.sin(time*.025)*.25;
    renderer.render(scene,camera);
  }
  function animate(now){frame=0;if(disposed||document.hidden)return;const dt=Math.min((now-lastTime)/1000||.016,.05);lastTime=now;if(options.getMotion())time+=dt;draw();frame=requestAnimationFrame(animate);}
  draw();options.onReady();frame=requestAnimationFrame(animate);
  function dispose(){
    if(disposed)return;disposed=true;if(frame)cancelAnimationFrame(frame);resizeObserver.disconnect();
    window.removeEventListener("pointermove",move);document.removeEventListener("pointerleave",leave);window.removeEventListener("pointerdown",pointerDown);window.removeEventListener("click",click);document.removeEventListener("visibilitychange",visibility);renderer.domElement.removeEventListener("webglcontextlost",contextLost);
    pieces.forEach(p=>p.mesh.geometry.dispose());for(const {material} of materialMap.values())material.dispose();
    lightRigs.forEach(r=>{r.coreMaterial.dispose();r.rayMaterial.dispose();});new Set(eyeRigs.map(r=>r.material)).forEach(m=>m.dispose());
    eyeGeometry.dispose();rayGeometry.dispose();coreGeometry.dispose();dustGeometry.dispose();dustMaterial.dispose();environment.dispose();renderer.dispose();renderer.domElement.remove();
  }
  options.signal.addEventListener("abort",dispose,{once:true});return {dispose};
}
