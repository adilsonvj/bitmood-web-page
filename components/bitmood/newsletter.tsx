"use client";
import { FormEvent, useRef, useState } from "react";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Newsletter() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    const data = new FormData(event.currentTarget);
    setStatus("loading"); setMessage("");
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), company: data.get("company") }) });
      const result = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) { setStatus("error"); setMessage(result.message || "Não foi possível registrar seu e-mail. Tente novamente."); return; }
      setStatus("success"); setMessage("Inscrição registrada. Você está na lista para receber as próximas edições."); formRef.current?.reset();
    } catch {
      setStatus("error"); setMessage("Não conseguimos conectar. Confira sua conexão e tente novamente.");
    }
  }
  return <form onSubmit={submit} ref={formRef} className="newsletter-form">
    <label htmlFor="newsletter-email">Seu e-mail</label>
    <div className="email-row"><Input id="newsletter-email" name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" required maxLength={254} disabled={status === "loading"} className="email-input" aria-describedby="newsletter-consent newsletter-status" /><button className="join-button" type="submit" disabled={status === "loading"}>{status === "loading" ? <><LoaderCircle className="spin" size={18} /> Registrando</> : status === "success" ? <><Check size={18} /> Inscrito</> : <>Quero receber <ArrowUpRight size={19} /></>}</button></div>
    <div className="form-trap" aria-hidden="true"><label>Empresa<input name="company" type="text" tabIndex={-1} autoComplete="off" /></label></div>
    <p id="newsletter-consent" className="form-consent">Ao se inscrever, você concorda em receber a newsletter BITMOOD. Seu e-mail será usado para esse envio.</p>
    <p id="newsletter-status" className="form-status" role="status" aria-live="polite">{message}</p>
  </form>;
}

