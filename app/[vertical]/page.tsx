import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pillars } from "@/lib/bitmood/chapters";
import { PillarWorld } from "@/components/bitmood/pillar-world";
import { PillarNav } from "@/components/bitmood/pillar-nav";

type Props={params:Promise<{vertical:string}>};
export function generateStaticParams(){return pillars.map(pillar=>({vertical:pillar.route}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {vertical}=await params;const pillar=pillars.find(item=>item.route===vertical);
  if(!pillar)return {};
  return {title:`${pillar.nav} — BITMOOD`,description:pillar.description,alternates:{canonical:`https://bitmood.com.br/${pillar.route}`},openGraph:{title:`${pillar.nav} — BITMOOD`,description:pillar.description,url:`https://bitmood.com.br/${pillar.route}`,type:"website"}};
}
export default async function VerticalPage({params}:Props){
  const {vertical}=await params;const pillar=pillars.find(item=>item.route===vertical);if(!pillar)notFound();
  return <div className="pillar-page">
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <header className="pillar-header"><Link className="wordmark" href="/">BITMOOD.</Link><Link href="/#perspectivas">← Todos os pilares</Link></header>
    <PillarNav active={pillar.route} />
    <main>
      <section className="pillar-hero" aria-labelledby="pillar-title"><PillarWorld index={pillar.worldIndex} /><div className="pillar-hero-copy"><p className="scene-eyebrow">{pillar.eyebrow}</p><h1 id="pillar-title">{pillar.title[0]}<br/>{pillar.title[1]}</h1><p>{pillar.description}</p><a href="#conteudo">Conheça esta perspectiva ↓</a></div></section>
      <section id="conteudo" className="pillar-detail"><p className="scene-eyebrow">{pillar.nav}</p><h2>Uma perspectiva para aprofundar.</h2><p>Este espaço reunirá as próximas análises sobre {pillar.nav.toLocaleLowerCase("pt-BR")}. Por enquanto, acompanhe as novidades pela newsletter.</p><p className="scene-signals">{pillar.signals}</p><Link className="join-button" href="/#newsletter">Receber a newsletter →</Link></section>
    </main>
    <footer className="pillar-footer"><Link href="/">← Voltar à home</Link><span>BITMOOD / BITCOIN INTELLIGENCE</span></footer>
  </div>;
}
