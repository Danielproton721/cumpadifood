import { NextResponse } from "next/server"
import { isAuthed } from "@/lib/admin-auth"
import { kvConfigured } from "@/lib/kv"
import { getActiveGateway, setActiveGateway, type GatewayId } from "@/lib/gateways/active"

export const dynamic = "force-dynamic"

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }
  return NextResponse.json({ active: await getActiveGateway(), kv: kvConfigured() })
}

export async function POST(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }
  if (!kvConfigured()) {
    return NextResponse.json(
      { error: "KV (Upstash) não configurado — não dá pra salvar a escolha." },
      { status: 400 }
    )
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const id = body?.gateway as GatewayId
  if (id !== "pagou" && id !== "medusa") {
    return NextResponse.json({ error: "Gateway inválido." }, { status: 400 })
  }

  await setActiveGateway(id)
  return NextResponse.json({ ok: true, active: id })
}
