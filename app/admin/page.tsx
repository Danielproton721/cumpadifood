import { adminConfigured, isAuthed } from "@/lib/admin-auth"
import { kvConfigured, listRecentOrders, type AdminOrder } from "@/lib/order-store"
import { AdminLogin } from "./admin-login"
import { LogoutButton } from "./logout-button"

export const dynamic = "force-dynamic"

const brl = (v: number) => `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`

const STATUS: Record<AdminOrder["status"], { label: string; cls: string }> = {
  pago: { label: "Pago", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  aguardando: { label: "Aguardando", cls: "bg-amber-100 text-amber-700 border-amber-200" },
  abandonado: { label: "Abandonado", cls: "bg-red-100 text-red-700 border-red-200" },
}

export default async function AdminPage() {
  if (!adminConfigured()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-2">
          <h1 className="text-lg font-bold text-foreground">Painel não configurado</h1>
          <p className="text-sm text-muted-foreground">
            Defina a variável <code className="font-mono">ADMIN_PASSWORD</code> na Vercel pra liberar o acesso.
          </p>
        </div>
      </div>
    )
  }

  if (!(await isAuthed())) {
    return <AdminLogin />
  }

  const orders = kvConfigured() ? await listRecentOrders(100) : []
  const total = orders.length
  const pagos = orders.filter((o) => o.status === "pago").length
  const abandonados = orders.filter((o) => o.status === "abandonado").length

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">Pedidos · CumpadiFood</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {total} pedido(s) · {pagos} pago(s) · {abandonados} abandonado(s)
            </p>
          </div>
          <LogoutButton />
        </div>

        {!kvConfigured() && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            KV (Upstash) não configurado — sem dados de pedidos.
          </div>
        )}

        {orders.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Nenhum pedido ainda.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Data</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Itens</th>
                  <th className="px-4 py-3 font-semibold text-right">Total</th>
                  <th className="px-4 py-3 font-semibold">Comprovante</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const st = STATUS[o.status]
                  const when = o.createdAt
                    ? new Date(o.createdAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
                    : "—"
                  return (
                    <tr key={o.txid} className="border-b border-border/60 last:border-0 align-top">
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">{when}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-bold ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">{o.customer?.name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{o.customer?.phone || ""}</div>
                        <div className="text-xs text-muted-foreground">{o.customer?.email || ""}</div>
                        {o.address && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {o.address.street}, {o.address.number}
                            {o.address.complement ? ` — ${o.address.complement}` : ""} · {o.address.neighborhood} ·{" "}
                            {o.address.city}-{o.address.stateUF} · CEP {o.address.cep}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <ul className="space-y-0.5 text-xs text-muted-foreground">
                          {(o.items || []).map((it, i) => (
                            <li key={i}>
                              <span className="font-semibold text-foreground">{it.quantity}×</span> {it.name}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-foreground whitespace-nowrap">{brl(o.total)}</td>
                      <td className="px-4 py-3">
                        {o.proofUrl ? (
                          <a
                            href={o.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary font-semibold hover:underline whitespace-nowrap"
                          >
                            Ver comprovante
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
