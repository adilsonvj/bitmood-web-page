import { pillars } from "@/lib/bitmood/chapters";

export function PillarNav({active}:{active?:string}) {
  return <nav className="vertical-rail" aria-label="As sete perspectivas BITMOOD">
    {pillars.map(pillar=><a key={pillar.id} href={`/${pillar.route}`} aria-label={pillar.nav} aria-current={active===pillar.route?"page":undefined}><span>{pillar.letter}</span><span className="rail-title">{pillar.nav}</span></a>)}
  </nav>;
}
