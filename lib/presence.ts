// Presença "ao vivo": cada visitante manda um heartbeat com um id de sessão.
// Guardamos num sorted set (score = timestamp). "Online" = quem deu sinal nos
// últimos WINDOW_MS. Usa um KV DEDICADO (lib/presence-kv.ts) se configurado,
// senão cai no KV padrão. Sem nenhum, vira no-op (conta 0).

import { presenceConfigured, presenceZAdd, presenceZCard, presenceZRemRangeByScore } from "./presence-kv"

const KEY = "presence:online"
// Janela de presença: considera online quem pingou nos últimos 60s.
const WINDOW_MS = 60_000

export async function recordHeartbeat(id: string, nowMs: number): Promise<void> {
  if (!presenceConfigured() || !id) return
  await presenceZAdd(KEY, nowMs, id)
  // Limpa quem ficou sem pingar (saiu da loja / fechou a aba).
  await presenceZRemRangeByScore(KEY, 0, nowMs - WINDOW_MS)
}

export async function countOnline(nowMs: number): Promise<number> {
  if (!presenceConfigured()) return 0
  await presenceZRemRangeByScore(KEY, 0, nowMs - WINDOW_MS)
  return presenceZCard(KEY)
}
