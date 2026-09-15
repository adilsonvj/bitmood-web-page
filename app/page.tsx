"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, Menu, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Newsletter } from "@/components/bitmood/newsletter";
import { AboutStory } from "@/components/bitmood/about-story";
import { useOceanSound } from "@/components/bitmood/audio";
import { wrapScene } from "@/lib/bitmood/navigation.js";
import { createAxisJourney } from "@/lib/bitmood/axis-navigation.js";
import { chapters, channels, pillars } from "@/lib/bitmood/chapters";

const channelsChapter=chapters.findIndex(chapter=>chapter.id==="canais");
const newsletterChapter=chapters.findIndex(chapter=>chapter.id==="newsletter");
const stationLabels=["Início","Pilares","Sobre mim","Canais","Newsletter"];


export default function Home({initialPillar}:{initialPillar?:number} = {}) {
  const rootRef=useRef<HTMLDivElement>(null);
  const trackRef=useRef<HTMLElement>(null);
  const stageRef=useRef<HTMLDivElement>(null);
  const worldRef=useRef<HTMLDivElement>(null);
  const progressRef=useRef(0);
  const journeyRef=useRef<ReturnType<typeof createAxisJourney>|null>(null);
  const pillarRef=useRef(initialPillar ?? 0);
  const sceneRef=useRef(0);
  const [pillarIndex,setPillarIndex]=useState(initialPillar ?? 0);
  const dialogRef=useRef(false);
  const motionRef=useRef(true);
  const [active,setActive]=useState(initialPillar===undefined?0:1);
  const [ready,setReady]=useState(false);
  const [graphicsFailed,setGraphicsFailed]=useState(false);
  const [staticGraphics,setStaticGraphics]=useState(false);
  const [motionPaused,setMotionPaused]=useState(false);
  const [dialog,setDialog]=useState<"menu"|"privacy"|"channels"|null>(null);
  const [linkChoice,setLinkChoice]=useState("YouTube e redes sociais");
  const {enabled:soundEnabled,playing:soundPlaying,available:soundAvailable,toggle:toggleSound,play}=useOceanSound();
  const playRef=useRef(play);
  useEffect(()=>{playRef.current=play;},[play]);
  useEffect(()=>{dialogRef.current=dialog!==null;},[dialog]);

  useEffect(()=>{
    const preference=window.matchMedia("(prefers-reduced-motion: reduce)");
    const change=()=>{motionRef.current=!preference.matches;setMotionPaused(preference.matches);};
    change();preference.addEventListener("change",change);
    return()=>preference.removeEventListener("change",change);
  },[]);

  useEffect(()=>{
    const root=rootRef.current,track=trackRef.current,stage=stageRef.current;
    if(!root||!track||!stage)return;
    const journey=createAxisJourney({root,track,count:chapters.length,pillarCount:pillars.length,isBlocked:()=>dialogRef.current,onScene:(index:number)=>{sceneRef.current=index;progressRef.current=index===1?pillars[pillarRef.current].worldIndex:([0,2,1,9,0][index]);setActive(index);playRef.current("transition",index);},onPillar:(index:number)=>{pillarRef.current=index;setPillarIndex(index);if(sceneRef.current===1)progressRef.current=pillars[index].worldIndex;playRef.current("transition",index+2);}});
    journeyRef.current=journey;
    if(initialPillar!==undefined){journey.selectPillar(initialPillar);journey.go(1);}
    const hash=()=>{const id=window.location.hash.slice(1);const selected=pillars.findIndex(pillar=>pillar.route===id);if(selected>=0){journey.selectPillar(selected);journey.go(1);return;}const index=chapters.findIndex(chapter=>chapter.id===id);if(index>=0)journey.go(index);};
    hash();window.addEventListener("hashchange",hash);
    return()=>{journey.dispose();journeyRef.current=null;window.removeEventListener("hashchange",hash);};
  },[initialPillar]);

  useEffect(()=>{
    const host=worldRef.current;if(!host)return;
    const abort=new AbortController();let instance:{dispose:()=>void}|undefined;
    const connection=(navigator as Navigator & {connection?:{saveData?:boolean}}).connection;
    let frame=requestAnimationFrame(()=>{
      frame=requestAnimationFrame(()=>{
        if(abort.signal.aborted)return;
        if(connection?.saveData){setStaticGraphics(true);setReady(true);return;}
        void import("@/components/bitmood/world.js").then(({createWorld})=>{
          if(abort.signal.aborted)return {dispose(){}};
          return createWorld(host,{
      signal:abort.signal,getProgress:()=>progressRef.current,getMotion:()=>motionRef.current,
      onReady:()=>{if(!abort.signal.aborted)setReady(true);},
      onPulse:()=>playRef.current("whale"),
      onError:()=>{if(!abort.signal.aborted)setGraphicsFailed(true);},
          });
        }).then(result=>{instance=result;if(abort.signal.aborted)result.dispose();}).catch(error=>{if(error?.name!=="AbortError"&&!abort.signal.aborted){setGraphicsFailed(true);setReady(true);}});
      });
    });
    return()=>{cancelAnimationFrame(frame);abort.abort();instance?.dispose();};
  },[]);

  const navigate=useCallback((index:number)=>{
    const scene=wrapScene(index,chapters.length),id=chapters[scene].id;
    setDialog(null);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      window.history.replaceState(null,"",`#${id}`);journeyRef.current?.go(index,true);
    }));
  },[]);
  function toggleMotion(){motionRef.current=!motionRef.current;setMotionPaused(!motionRef.current);}
  const current=chapters[active];
  useEffect(()=>{window.history.replaceState(null,"",`#${active===1?pillars[pillarIndex].route:chapters[active].id}`);},[active,pillarIndex]);

  return <div ref={rootRef} className={`bitmood axis-journey ${ready?"is-ready":"is-loading"} ${graphicsFailed?"graphics-fallback":""} ${motionPaused?"motion-paused":""}`} data-scene={current.id}>
    <a className="skip-link" href="#perspectivas" onClick={event=>{event.preventDefault();navigate(1);}}>Ir para as perspectivas</a>
    <p id="navigation-help" className="sr-only">Esquerda e direita percorrem Início, Pilares, Sobre mim, Canais e Newsletter em ciclo. Dentro de Pilares, cima e baixo trocam entre os sete pilares. Home vai ao início e End à newsletter. Textos longos rolam verticalmente; as setas laterais continuam disponíveis. Tab percorre os controles.</p>
    <p className="sr-only" aria-live="polite" aria-atomic="true">Seção {active+1} de {chapters.length}: {current.nav}.{active===1?` Pilar ${pillarIndex+1} de 7: ${pillars[pillarIndex].nav}.`:""}</p>
    <main ref={trackRef} className="journey" aria-label="O universo BITMOOD" aria-describedby="navigation-help">
      <div className="experience-stage" ref={stageRef}>
        <div ref={worldRef} className="world-canvas" aria-hidden="true" />
        {(!ready||graphicsFailed||staticGraphics)&&<img className="fallback-whale" src="/images/whale-hero.webp" alt="" fetchPriority="high" decoding="async" />}
        <div className="atmosphere" aria-hidden="true" />
        <div className="scene-bracket bracket-a" aria-hidden="true" /><div className="scene-bracket bracket-b" aria-hidden="true" />
        <span className="side-caption" aria-hidden="true">UMA LEITURA EM SETE DIMENSÕES</span>

        <header className="scene-header">
          <a href="#inicio" className="wordmark" aria-label="BITMOOD — início" onClick={event=>{event.preventDefault();navigate(0);}}><img src="/brand/whale.svg" width="42" height="26" alt="" /><span>BITMOOD<span className="brand-dot">.</span></span></a>
          <nav className="header-navigation" aria-label="Navegação principal">
            <a href="#perspectivas" onClick={event=>{event.preventDefault();navigate(1);}}>Perspectivas</a>
            <a href="#sobre" onClick={event=>{event.preventDefault();navigate(2);}}>Sobre mim</a>
            <a href="#canais" onClick={event=>{event.preventDefault();navigate(channelsChapter);}}>Canais</a>
            <a href="#newsletter" onClick={event=>{event.preventDefault();navigate(newsletterChapter);}}>Newsletter <ArrowUpRight size={14}/></a>
          </nav>
          <div className="header-controls">
            <button data-sound-toggle className={`sound-control ${soundPlaying?"is-on":""}`} onClick={toggleSound} aria-pressed={soundPlaying} aria-label={!soundAvailable?"Som indisponível":soundPlaying?"Desativar som ambiente":"Ativar som ambiente"} disabled={!soundAvailable}>
              {soundPlaying?<Volume2 size={16}/>:<VolumeX size={16}/>}<span>{!soundAvailable?"Sem áudio":soundPlaying?"Som on":soundEnabled?"Ativar som":"Som off"}</span><span className="sound-bars" aria-hidden="true"><i/><i/><i/><i/></span>
            </button>
            <button className="icon-control motion-control" onClick={toggleMotion} aria-label={motionPaused?"Ativar movimento contínuo":"Pausar movimento contínuo"} aria-pressed={motionPaused} title={motionPaused?"Ativar movimento":"Pausar movimento"}>{motionPaused?<Play size={15}/>:<Pause size={15}/>}</button>
            <button className="icon-control menu-control" onClick={()=>setDialog("menu")} aria-label="Abrir navegação"><Menu size={20}/></button>
          </div>
        </header>

        {!ready&&!graphicsFailed&&<div className="world-loading" role="status"><span>Formando as baleias</span><i/><small>BITMOOD / EXPLORE</small></div>}

        {active===1&&<nav className="vertical-rail" aria-label="Escolher pilar">{pillars.map((pillar,index)=><a href={`#${pillar.route}`} key={pillar.id} aria-label={pillar.nav} aria-current={pillarIndex===index?"step":undefined} onClick={event=>{event.preventDefault();journeyRef.current?.selectPillar(index);window.history.replaceState(null,"",`#${pillar.route}`);}}><span>{pillar.letter}</span><span className="rail-title">{pillar.nav}</span></a>)}</nav>}

        <div className="scene-copy-zone">
          {chapters.map((chapter,index)=>{
            if(chapter.id==="perspectivas")return <section key={chapter.id} className={`scene-copy pillar-slide ${index===active?"is-active":""}`} tabIndex={index===active?0:-1} aria-labelledby="title-perspectivas" aria-hidden={index!==active} inert={index!==active}><p className="scene-eyebrow">PILARES / {String(pillarIndex+1).padStart(2,"0")} DE 07</p><h2 tabIndex={-1} id="title-perspectivas">{pillars[pillarIndex].title[0]}<br/>{pillars[pillarIndex].title[1]}</h2><p className="scene-description">{pillars[pillarIndex].description}</p><div className="pillar-axis-controls"><button onClick={()=>journeyRef.current?.selectPillar(pillarIndex-1)} aria-label="Pilar anterior">↑ Anterior</button><span>Role para trocar o pilar</span><button onClick={()=>journeyRef.current?.selectPillar(pillarIndex+1)} aria-label="Próximo pilar">Próximo ↓</button></div></section>;
            if(chapter.id==="sobre") return <section key={chapter.id} className={`scene-copy about-scene ${index===active?"is-active":""}`} tabIndex={index===active?0:-1} aria-labelledby="title-sobre" aria-hidden={index!==active} inert={index!==active}><AboutStory embedded /></section>;
            return <section key={chapter.id} className={`scene-copy ${index===active?"is-active":""} ${chapter.id==="newsletter"?"newsletter-copy":""}`} tabIndex={index===active?0:-1} aria-labelledby={`title-${chapter.id}`} aria-hidden={index!==active} inert={index!==active}>
              <p className="scene-eyebrow"><span>{chapter.eyebrow}</span></p>
              {index===0?<h1 tabIndex={-1} id={`title-${chapter.id}`}>{chapter.title[0]}<br/>{chapter.title[1]}</h1>:<h2 tabIndex={-1} id={`title-${chapter.id}`}>{chapter.title[0]}<br/>{chapter.title[1]}</h2>}
              <p className="scene-description">{chapter.description}</p>

              {chapter.id==="canais"&&<div className="channels-list">{channels.filter((channel,index)=>channel.href||(!channels.some(item=>item.href)&&index===0)).map(channel=>channel.href?<a className="channel-action" href={channel.href} target="_blank" rel="noopener noreferrer" key={channel.label}><Play size={18}/><span>{channel.label}</span><ArrowUpRight size={18}/></a>:<button className="channel-action" key={channel.label} onClick={()=>{setLinkChoice(channel.label);setDialog("channels");}}><Play size={18}/><span>{channel.label}<small>Em breve</small></span><ArrowUpRight size={18}/></button>)}</div>}
              {index===0&&<button className="join-button hero-action" onClick={()=>navigate(1)}>Conheça os pilares <ArrowRight size={17}/></button>}
              {chapter.id==="newsletter"&&<><Newsletter/><button className="privacy-link" onClick={()=>setDialog("privacy")}>Sobre seu cadastro <ArrowUpRight size={13}/></button></>}
            </section>;
          })}
        </div>

        <div className="sculpture-caption" aria-hidden="true"><i/><span>{active===1?pillars[pillarIndex].sculpture:current.sculpture}</span></div>
        <footer className="scene-footer">
          <button className="scroll-prompt" onClick={()=>navigate(active-1)}><ChevronLeft size={16}/><span>{stationLabels[wrapScene(active-1,5)]}</span></button>
          <nav className="axis-stations" aria-label="Jornada horizontal">{chapters.map((chapter,index)=><button key={chapter.id} aria-current={active===index?"step":undefined} onClick={()=>navigate(index)}>{stationLabels[index]}</button>)}</nav>
          <button className="scroll-prompt" onClick={()=>navigate(active+1)}><span>{stationLabels[wrapScene(active+1,5)]}</span><ChevronRight size={19}/></button>
        </footer>
        <div className="journey-line" aria-hidden="true"><i/></div>
      </div>
    </main>

    <Dialog open={dialog!==null} onOpenChange={open=>{if(!open)setDialog(null);}}><DialogContent className={`bitmood-dialog ${dialog==="menu"?"navigation-dialog":""}`} showCloseButton={false}>
      <DialogClose className="dialog-close icon-control" aria-label="Fechar"><X size={20}/></DialogClose>
      <DialogHeader><span className="dialog-eyebrow">UNIVERSO BITMOOD</span><DialogTitle>{dialog==="menu"?"Escolha uma perspectiva.":dialog==="privacy"?"Seu e-mail, com propósito.":linkChoice}</DialogTitle><DialogDescription>{dialog==="menu"?"Explore as forças que ajudam a explicar o Bitcoin.":dialog==="privacy"?"Seu cadastro registra o e-mail, a data e o consentimento para a newsletter BITMOOD.":"Os links oficiais serão disponibilizados aqui. Entre na newsletter para acompanhar as próximas novidades."}</DialogDescription></DialogHeader>
      {dialog==="menu"?<nav className="dialog-chapters" aria-label="Todos os capítulos">{chapters.map((chapter,index)=><a href={`#${chapter.id}`} key={chapter.id} aria-current={index===active?"step":undefined} onClick={event=>{event.preventDefault();navigate(index);}}><span>{chapter.letter}</span><span>{chapter.nav}</span>{index===active?<Check size={16}/>:<ArrowUpRight size={15}/>}</a>)}</nav>:dialog==="privacy"?<p className="dialog-body">Ao enviar o formulário, você autoriza o uso do seu e-mail para receber os conteúdos da newsletter. Não pedimos dados financeiros ou informações de carteira. O som ambiente começa após sua primeira interação e pode ser desligado no controle Som.</p>:<button className="join-button" onClick={()=>navigate(newsletterChapter)}>Ir para a newsletter <ArrowRight size={17}/></button>}
    </DialogContent></Dialog>
  </div>;
}
