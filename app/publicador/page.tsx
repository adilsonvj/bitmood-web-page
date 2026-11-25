import type { Metadata } from "next";
import { PublicadorPage, metadadosPublicador } from "@/components/bitmood/publicador-page";

export const metadata: Metadata = metadadosPublicador("inicio");

export default function Publicador() {
  return <PublicadorPage pagina="inicio" />;
}
