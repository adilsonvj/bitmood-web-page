"use client";
import { useEffect, useRef, useState } from "react";

export function PillarWorld({index}:{index:number}) {
  const host=useRef<HTMLDivElement>(null),motion=useRef(true);
  const [paused,setPaused]=useState(false),[failed,setFailed]=useState(false);
  useEffect(()=>{
    const query=matchMedia("(prefers-reduced-motion: reduce)");
    const change=()=>{motion.current=!query.matches;setPaused(query.matches);};change();query.addEventListener("change",change);
    const abort=new AbortController();let engine:{dispose:()=>void}|undefined;
    void import("./world.js").then(async({createWorld})=>{
      if(abort.signal.aborted||!host.current)return;
      engine=await createWorld(host.current,{signal:abort.signal,getProgress:()=>index,getMotion:()=>motion.current,onReady(){},onPulse(){},onError(){setFailed(true);}});
      if(abort.signal.aborted)engine.dispose();
    }).catch(()=>{if(!abort.signal.aborted)setFailed(true);});
    return()=>{abort.abort();engine?.dispose();query.removeEventListener("change",change);};
  },[index]);
  return <><div ref={host} className="world-canvas" aria-hidden="true" />{failed&&<p className="pillar-fallback">A visualização 3D está indisponível neste dispositivo. O conteúdo permanece disponível abaixo.</p>}<button className="pillar-pause" onClick={()=>{motion.current=!motion.current;setPaused(!motion.current);}} aria-pressed={paused}>{paused?"Ativar movimento":"Pausar movimento"}</button></>;
}
