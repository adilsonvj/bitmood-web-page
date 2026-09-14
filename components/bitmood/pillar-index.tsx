"use client";
import { useEffect, useRef, useState } from "react";
import { pillars } from "@/lib/bitmood/chapters";

let cached: string[] = [];
export function PillarIndex({active}:{active:boolean}) {
  const host=useRef<HTMLDivElement>(null);
  const [images,setImages]=useState<string[]>(cached);
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    if(!active||cached.length||!host.current)return;
    const abort=new AbortController();const element=host.current;let scene=2;
    let engine:{dispose:()=>void}|undefined;
    void import("./world.js").then(async({createWorld})=>{
      if(abort.signal.aborted)return;
      const instance=await createWorld(element,{signal:abort.signal,getProgress:()=>scene,getMotion:()=>false,onReady(){},onPulse(){},onError(){setFailed(true);},preview:true});
      engine=instance;if(abort.signal.aborted){instance.dispose();return;}
      const capture=instance.capture;if(!capture)return;
      const frames:string[]=[];
      for(const pillar of pillars){scene=pillar.worldIndex;frames.push(capture());}
      cached=frames;setImages(frames);instance.dispose();
    }).catch(()=>{if(!abort.signal.aborted)setFailed(true);});
    return()=>{abort.abort();engine?.dispose();};
  },[active]);
  return <>
    <div ref={host} className="pillar-render-host" aria-hidden="true" />
    <div className="pillar-grid">{pillars.map((pillar,index)=><a className="pillar-card" href={`/${pillar.route}`} key={pillar.id}>
      <div className="pillar-art">{images[index]?<img src={images[index]} width="480" height="280" alt="" />:<span>{failed?"Explore a perspectiva":"Preparando a escultura…"}</span>}</div>
      <span className="pillar-number">{String(index+1).padStart(2,"0")} / 07</span>
      <h3>{pillar.nav}</h3><p>{pillar.summary}</p><span className="pillar-open">Explorar →</span>
    </a>)}</div>
  </>;
}
