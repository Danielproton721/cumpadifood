// Cliente Redis (Upstash REST) sem dependência externa — fala direto com a REST
// API via fetch. Se UPSTASH_REDIS_REST_URL/TOKEN não estiverem configurados,
// kvConfigured() = false e o checkout continua funcionando sem KV (best effort).

// Aceita os dois padrões de nome: o do Upstash (UPSTASH_REDIS_REST_*) e o que a
// integração de Storage da Vercel costuma injetar (KV_REST_API_*).
const REST_URL = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL)?.replace(/\/$/, "")
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN

export function kvConfigured(): boolean {
  return Boolean(REST_URL && REST_TOKEN)
}

// Executa um comando Redis no formato de array (["SET", key, value, ...]).
async function command(args: (string | number)[]): Promise<unknown> {
  if (!REST_URL || !REST_TOKEN) throw new Error("KV (Upstash) não configurado.")
  const res = await fetch(REST_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${REST_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  })
  const data = (await res.json().catch(() => null)) as { result?: unknown; error?: string } | null
  if (!res.ok) {
    throw new Error(`KV erro ${res.status}: ${data?.error ?? JSON.stringify(data)}`)
  }
  return data?.result ?? null
}

export async function kvSetJSON(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  await command(["SET", key, JSON.stringify(value), "EX", ttlSeconds])
}

export async function kvGetJSON<T = unknown>(key: string): Promise<T | null> {
  const raw = (await command(["GET", key])) as string | null
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function kvDel(key: string): Promise<void> {
  await command(["DEL", key])
}

// Lock distribuído: retorna true só pra QUEM conseguiu criar a chave (SET NX).
// É o que garante e-mail único por pedido (front OU webhook, nunca os dois).
export async function kvClaimOnce(key: string, ttlSeconds: number): Promise<boolean> {
  const result = await command(["SET", key, "1", "NX", "EX", ttlSeconds])
  return result === "OK"
}
