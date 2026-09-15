import copy from "@/conteudo/paginas/inicio.json";
import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: copy.titulo_navegador,
  description: copy.descricao_busca,
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" className="dark"><body>{children}</body></html>;
}
