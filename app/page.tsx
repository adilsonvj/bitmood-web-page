"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, CandlestickChart, Check, ChevronLeft, ChevronRight, Cpu, Globe2, Landmark, Layers3, Menu, MoveHorizontal, Pause, Play, Radio, Vault, Volume2, VolumeX, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Newsletter } from "@/components/bitmood/newsletter";
import { useOceanSound } from "@/components/bitmood/experience";
import { chapters, channels } from "@/lib/bitmood/chapters";

const verticalIcons = [Vault, Landmark, CandlestickChart, Globe2, Layers3, Cpu, MoveHorizontal];
const lastChapter=chapters.length-1;
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const smooth=(n:number)=>{const t=clamp(n,0,1);return t*t*(3-2*t);};

export default function Home() {
  const rootRef=useRef<HTMLDivElement>(null);
  const trackRef=useRef<HTMLElement>(null);
  const stageRef=useRef<HTMLDivElement>(null);
  const worldRef=useRef<HTMLDivElement>(null);
  const progressRef=useRef(0);
  const motionRef=useRef(true);
  const activeRef=useRef(0);
  const [active,setActive]=useState(0);
  const [ready,setReady]=useState(false);
  const [graphicsFailed,setGraphicsFailed]=useState(false);
  const [motionPaused,setMotionPaused]=useState(false);
  const [dialog,setDialog]=useState<"menu"|"privacy"|"channels"|null>(null);
  const [linkChoice,setLinkChoice]=useState("YouTube e redes sociais");
  const {enabled:soundEnabled,available:soundAvailable,toggle:toggleSound,play}=useOceanSound();
  const playRef=useRef(play);
  useEffect(()=>{playRef.current=play;},[play]);

  useEffect(()=>{
    const preference=window.matchMedia("(prefers-reduced-motion: reduce)");
    const change=()=>{motionRef.current=!preference.matches;setMotionPaused(preference.matches);};
    change();preference.addEventListener("change",change);
    return()=>preference.removeEventListener("change",change);
  },[]);

  useEffect(()=>{
    const root=rootRef.current,track=trackRef.current,stage=stageRef.current;
    if(!root||!track||!stage)return;
    let frame=0,last=0,target=0,range=1;
    const measure=()=>{range=Math.max(1,track.offsetHeight-stage.offsetHeight);target=clamp(window.scrollY/range*lastChapter,0,lastChapter);};
    const scroll=()=>{target=clamp(window.scrollY/range*lastChapter,0,lastChapter);};
    const draw=(now:number)=>{
      frame=0;if(document.hidden)return;
      const dt=Math.min((now-last)/1000||.016,.05);last=now;
      progressRef.current+=(target-progressRef.current)*(motionRef.current?1-Math.exp(-dt*6.5):1);
      if(Math.abs(target-progressRef.current)<.0001)progressRef.current=target;
      const p=progressRef.current,next=clamp(Math.round(p),0,lastChapter);
      const nearest=Math.abs(p-Math.round(p));
      const opacity=1-smooth((nearest-.16)/.27);
      root.style.setProperty("--copy-opacity",String(opacity));
      root.style.setProperty("--copy-offset",`${(1-opacity)*10}px`);
      root.style.setProperty("--journey-progress",`${p/lastChapter*100}%`);
      if(next!==activeRef.current){activeRef.current=next;setActive(next);if(next>=2&&next<=8)playRef.current("select",next-2);}
      frame=requestAnimationFrame(draw);
    };
    const visibility=()=>{if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;}else{measure();if(!frame)frame=requestAnimationFrame(draw);}};
    const observer=new ResizeObserver(measure);observer.observe(track);observer.observe(stage);
    measure();progressRef.current=target;frame=requestAnimationFrame(draw);
    window.addEventListener("scroll",scroll,{passive:true});window.addEventListener("resize",measure,{passive:true});document.addEventListener("visibilitychange",visibility);
    return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener("scroll",scroll);window.removeEventListener("resize",measure);document.removeEventListener("visibilitychange",visibility);};
  },[]);

  useEffect(()=>{
    const host=worldRef.current;if(!host)return;
    const abort=new AbortController();let instance:{dispose:()=>void}|undefined;
    import("@/components/bitmood/world.js").then(({createWorld})=>createWorld(host,{
      signal:abort.signal,getProgress:()=>progressRef.current,getMotion:()=>motionRef.current,
      onReady:()=>{if(!abort.signal.aborted)setReady(true);},
      onPulse:()=>playRef.current("whale"),
      onError:()=>{if(!abort.signal.aborted)setGraphicsFailed(true);},
    })).then(result=>{instance=result;if(abort.signal.aborted)result.dispose();}).catch(error=>{if(error?.name!=="AbortError"&&!abort.signal.aborted){setGraphicsFailed(true);setReady(true);}});
    return()=>{abort.abort();instance?.dispose();};
  },[]);

  const navigate=useCallback((index:number)=>{
    const id=chapters[clamp(index,0,lastChapter)].id;
    setDialog(null);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const node=document.getElementById(id);
      if(node){window.history.replaceState(null,"",`#${id}`);window.scrollTo({top:node.offsetTop,behavior:motionRef.current?"smooth":"instant"});}
    }));
  },[]);
  function toggleMotion(){motionRef.current=!motionRef.current;setMotionPaused(!motionRef.current);}
  const current=chapters[active];

  return <div ref={rootRef} className={`bitmood ${ready?"is-ready":"is-loading"} ${graphicsFailed?"graphics-fallback":""} ${motionPaused?"motion-paused":""}`} data-scene={current.id}>
    <a className="skip-link" href="#baleias" onClick={event=>{event.preventDefault();navigate(2);}}>Ir para as perspectivas</a>
    <main ref={trackRef} className="journey" aria-label="O universo BITMOOD">
      {chapters.map((chapter,index)=><div key={chapter.id} id={chapter.id} className="scroll-anchor" style={{top:`${index*155}svh`}} aria-hidden="true" />)}
      <div className="experience-stage" ref={stageRef}>
        <div ref={worldRef} className="world-canvas" role="img" aria-label="Baleia de facetas azuis e prateadas. As peças se reorganizam em esculturas que representam as sete perspectivas BITMOOD." />
        {graphicsFailed&&<img className="fallback-whale" src="/images/whale-hero.webp" alt="" />}
        <div className="atmosphere" aria-hidden="true" />
        <div className="scene-bracket bracket-a" aria-hidden="true" /><div className="scene-bracket bracket-b" aria-hidden="true" />
        <span className="side-caption" aria-hidden="true">UMA LEITURA EM SETE DIMENSÕES</span>

        <header className="scene-header">
          <a href="#inicio" className="wordmark" aria-label="BITMOOD — início" onClick={event=>{event.preventDefault();navigate(0);}}><img src="/brand/whale.svg" width="42" height="26" alt="" /><span>BITMOOD<span className="brand-dot">.</span></span></a>
          <nav className="header-navigation" aria-label="Navegação principal">
            <a href="#baleias" onClick={event=>{event.preventDefault();navigate(2);}}>Perspectivas</a>
            <a href="#canais" onClick={event=>{event.preventDefault();navigate(9);}}>Canais</a>
            <a href="#newsletter" onClick={event=>{event.preventDefault();navigate(10);}}>Newsletter <ArrowUpRight size={14}/></a>
          </nav>
          <div className="header-controls">
            <button className={`sound-control ${soundEnabled?"is-on":""}`} onClick={toggleSound} aria-pressed={soundEnabled} aria-label={soundEnabled?"Desativar som ambiente":"Ativar som ambiente"} disabled={!soundAvailable}>
              {soundEnabled?<Volume2 size={16}/>:<VolumeX size={16}/>}<span>Som {soundEnabled?"on":"off"}</span><span className="sound-bars" aria-hidden="true"><i/><i/><i/><i/></span>
            </button>
            <button className="icon-control motion-control" onClick={toggleMotion} aria-label={motionPaused?"Ativar movimento contínuo":"Reduzir os movimentos"} aria-pressed={motionPaused} title={motionPaused?"Ativar movimento":"Reduzir movimentos"}>{motionPaused?<Play size={15}/>:<Pause size={15}/>}</button>
            <button className="icon-control menu-control" onClick={()=>setDialog("menu")} aria-label="Abrir navegação"><Menu size={20}/></button>
          </div>
        </header>

        {!ready&&!graphicsFailed&&<div className="world-loading" role="status"><span>Formando a baleia</span><i/><small>BITMOOD / EXPLORE</small></div>}

        <nav className="vertical-rail" aria-label="As sete perspectivas BITMOOD">
          {chapters.slice(2,9).map((chapter,index)=><a key={chapter.id} href={`#${chapter.id}`} aria-label={chapter.nav} aria-current={active===index+2?"step":undefined} onClick={event=>{event.preventDefault();navigate(index+2);}}><span>{chapter.letter}</span><span className="rail-title">{chapter.nav}</span></a>)}
        </nav>

        <div className="scene-copy-zone">
          {chapters.map((chapter,index)=>{
            const Icon=index>=2&&index<=8?verticalIcons[index-2]:null;
            return <section key={chapter.id} className={`scene-copy ${index===active?"is-active":""} ${index===10?"newsletter-copy":""}`} aria-labelledby={`title-${chapter.id}`} aria-hidden={index!==active} inert={index!==active}>
              <p className="scene-eyebrow">{Icon&&<Icon size={17} strokeWidth={1.4}/>}<span>{chapter.eyebrow}</span></p>
              {index===0?<h1 id={`title-${chapter.id}`}>{chapter.title[0]}<br/>{chapter.title[1]}</h1>:<h2 id={`title-${chapter.id}`}>{chapter.title[0]}<br/>{chapter.title[1]}</h2>}
              <p className="scene-description">{chapter.description}</p>
              {index>=2&&index<=8&&<p className="scene-signals">{chapter.signals}</p>}
              {index===0&&<button className="quiet-link intro-link" onClick={()=>navigate(1)}>Explore as perspectivas <ArrowDown size={16}/></button>}
              {index===9&&<div className="channels-list">{channels.map(channel=>channel.href?<a className="channel-action" href={channel.href} target="_blank" rel="noopener noreferrer" key={channel.label}>{channel.kind==="youtube"?<Play size={18}/>:<Radio size={18}/>}<span>{channel.label}</span><ArrowUpRight size={18}/></a>:<button className="channel-action" key={channel.label} onClick={()=>{setLinkChoice(channel.label);setDialog("channels");}}>{channel.kind==="youtube"?<Play size={18}/>:<Radio size={18}/>}<span>{channel.label}<small>Em breve</small></span><ArrowUpRight size={18}/></button>)}</div>}
              {index===10&&<><Newsletter/><button className="privacy-link" onClick={()=>setDialog("privacy")}>Sobre seu cadastro <ArrowUpRight size={13}/></button></>}
            </section>;
          })}
        </div>

        <div className="sculpture-caption" aria-hidden="true"><i/><span>{current.sculpture}</span></div>
        <footer className="scene-footer">
          <button className="scroll-prompt" onClick={()=>navigate(active===lastChapter?0:active+1)}>{active===lastChapter?<><span>Voltar à superfície</span><ArrowUpRight size={16}/></>:<><ArrowDown size={16}/><span>Role para explorar</span></>}</button>
          <span className="footer-signature">BITCOIN INTELLIGENCE</span>
          <div className="chapter-controls"><button className="icon-control" aria-label="Capítulo anterior" disabled={active===0} onClick={()=>navigate(active-1)}><ChevronLeft size={19}/></button><span aria-live="polite" aria-atomic="true"><span className="sr-only">Capítulo </span>{String(active+1).padStart(2,"0")}<span className="chapter-total"> / {chapters.length}</span></span><button className="icon-control" aria-label="Próximo capítulo" disabled={active===lastChapter} onClick={()=>navigate(active+1)}><ChevronRight size={19}/></button></div>
        </footer>
        <div className="journey-line" aria-hidden="true"><i/></div>
      </div>
    </main>

    <Dialog open={dialog!==null} onOpenChange={open=>{if(!open)setDialog(null);}}><DialogContent className={`bitmood-dialog ${dialog==="menu"?"navigation-dialog":""}`} showCloseButton={false}>
      <DialogClose className="dialog-close icon-control" aria-label="Fechar"><X size={20}/></DialogClose>
      <DialogHeader><span className="dialog-eyebrow">UNIVERSO BITMOOD</span><DialogTitle>{dialog==="menu"?"Escolha uma perspectiva.":dialog==="privacy"?"Seu e-mail, com propósito.":linkChoice}</DialogTitle><DialogDescription>{dialog==="menu"?"Explore as forças que ajudam a explicar o Bitcoin.":dialog==="privacy"?"Seu cadastro registra o e-mail, a data e o consentimento para a newsletter BITMOOD.":"Os links oficiais serão disponibilizados aqui. Entre na newsletter para acompanhar as próximas novidades."}</DialogDescription></DialogHeader>
      {dialog==="menu"?<nav className="dialog-chapters" aria-label="Todos os capítulos">{chapters.filter((_,i)=>i!==1).map(chapter=>{const index=chapters.indexOf(chapter);return <a href={`#${chapter.id}`} key={chapter.id} aria-current={index===active?"step":undefined} onClick={event=>{event.preventDefault();navigate(index);}}><span>{chapter.letter}</span><span>{chapter.nav}</span>{index===active?<Check size={16}/>:<ArrowUpRight size={15}/>}</a>;})}</nav>:dialog==="privacy"?<p className="dialog-body">Ao enviar o formulário, você autoriza o uso do seu e-mail para receber os conteúdos da newsletter. Não pedimos dados financeiros ou informações de carteira. O som ambiente só começa quando você o ativa.</p>:<button className="join-button" onClick={()=>navigate(10)}>Ir para a newsletter <ArrowRight size={17}/></button>}
    </DialogContent></Dialog>
  </div>;
}
