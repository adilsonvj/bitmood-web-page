import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pillars } from "@/lib/bitmood/chapters";
import Home from "@/app/page";

type Props={params:Promise<{vertical:string}>};
export function generateStaticParams(){return pillars.map(pillar=>({vertical:pillar.route}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {vertical}=await params;const pillar=pillars.find(item=>item.route===vertical);
  if(!pillar)return {};
  return {title:`${pillar.nav} — BITMOOD`,description:pillar.description,alternates:{canonical:`https://bitmood.com.br/${pillar.route}`},openGraph:{title:`${pillar.nav} — BITMOOD`,description:pillar.description,url:`https://bitmood.com.br/${pillar.route}`,type:"website"}};
}
export default async function VerticalPage({params}:Props){
  const {vertical}=await params;const pillar=pillars.find(item=>item.route===vertical);if(!pillar)notFound();
  return <Home initialPillar={pillars.indexOf(pillar)} />;
}
