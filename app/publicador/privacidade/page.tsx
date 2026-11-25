import type { Metadata } from "next";
import { PublicadorPage, metadadosPublicador } from "@/components/bitmood/publicador-page";

export const metadata: Metadata = metadadosPublicador("privacidade");

export default function PublicadorPrivacidade() {
  return <PublicadorPage pagina="privacidade" />;
}
