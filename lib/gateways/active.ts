// Qual gateway de pagamento está ativo agora (escolhido no /admin).
// Guardado no KV (Upstash) pra valer pra todos na hora, sem novo deploy.
// Sem KV configurado, cai no padrão (Pagou.ai) — o fluxo atual nunca quebra.

import { kvConfigured, kvGetJSON, kvSetJSON } from "@/lib/kv"

export type GatewayId = "pagou" | "medusa"

export const GATEWAYS: { id: GatewayId; label: string }[] = [
  { id: "pagou", label: "Pagou.ai" },
  { id: "medusa", label: "MedusaPay" },
]

const KEY = "active-gateway"
const DEFAULT: GatewayId = "pagou"
// ~1 ano: na prática permanente; só muda quando o admin troca.
const TTL = 60 * 60 * 24 * 365

function isGatewayId(v: unknown): v is GatewayId {
  return v === "pagou" || v === "medusa"
}

export async function getActiveGateway(): Promise<GatewayId> {
  if (!kvConfigured()) return DEFAULT
  try {
    const v = await kvGetJSON<GatewayId>(KEY)
    return isGatewayId(v) ? v : DEFAULT
  } catch {
    return DEFAULT
  }
}

export async function setActiveGateway(id: GatewayId): Promise<void> {
  await kvSetJSON(KEY, id, TTL)
}
