import { z } from "zod";
import { getRawDb } from "@/db";

const submission = z.object({
  email: z.string().trim().toLowerCase().max(254).email(),
  company: z.string().max(500).optional().default(""),
});

function response(message: string, status = 200) {
  return Response.json({ message }, { status, headers: { "Cache-Control": "no-store" } });
}

async function readBody(request: Request) {
  if (!request.body) throw new Error("Empty request");
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let length = 0;
  let body = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 4096) { await reader.cancel(); throw new Error("Request too large"); }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
    return JSON.parse(body);
  } finally { reader.releaseLock(); }
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return response("Envie o cadastro pelo formulário do site.", 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return response("Formato de cadastro inválido.", 415);
  let parsed: z.SafeParseReturnType<unknown, z.infer<typeof submission>>;
  try { parsed = submission.safeParse(await readBody(request)); }
  catch { return response("Confira seu e-mail e tente novamente.", 400); }
  if (!parsed.success) return response("Informe um endereço de e-mail válido.", 400);
  if (parsed.data.company) return response("Inscrição registrada.");
  try {
    await getRawDb().prepare(
      "INSERT INTO newsletter_subscribers (id, email, created_at, consent_version) VALUES (?, ?, ?, ?) ON CONFLICT(email) DO NOTHING"
    ).bind(crypto.randomUUID(), parsed.data.email, Date.now(), "2026-09-06").run();
    return response("Inscrição registrada.");
  } catch {
    return response("O cadastro está temporariamente indisponível. Tente novamente em instantes.", 503);
  }
}
