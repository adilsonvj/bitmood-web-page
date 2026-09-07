import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "BITMOOD — Bitcoin Intelligence",
  description: "Veja além do preço. Explore as sete perspectivas do BITMOOD e conecte dados, comportamento e contexto para compreender o Bitcoin.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" className="dark"><body>{children}</body></html>;
}
