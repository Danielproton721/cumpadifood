import Link from "next/link"
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, MinusCircle, KeyRound } from "lucide-react"
import { adminConfigured, isAuthed } from "@/lib/admin-auth"
import { getEnvStatus, type EnvItem } from "@/lib/env-status"
import { AdminLogin } from "../admin-login"
import { RefreshButton } from "./refresh-button"

export const dynamic = "force-dynamic"

function StatusBadge({ item }: { item: EnvItem }) {
  if (item.present) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" /> Configurada
      </span>
    )
  }
  if (item.level === "required") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
        <XCircle className="h-3.5 w-3.5" /> Faltando
      </span>
    )
  }
  if (item.level === "recommended") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
        <AlertTriangle className="h-3.5 w-3.5" /> Recomendada
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
      <MinusCircle className="h-3.5 w-3.5" /> Opcional
    </span>
  )
}

export default async function AdminConfigPage() {
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

  const groups = getEnvStatus()
  const all = groups.flatMap((g) => g.items)
  const missingRequired = all.filter((i) => !i.present && i.level === "required").length
  const missingRecommended = all.filter((i) => !i.present && i.level === "recommended").length
  const configured = all.filter((i) => i.present).length

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
              <KeyRound className="h-5 w-5" /> Configuração · Chaves
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Status das variáveis de ambiente. Mostra só se está preenchida — nunca o valor.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start">
            <RefreshButton />
            <Link
              href="/admin"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-bold text-foreground transition hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Link>
          </div>
        </div>

        {/* Resumo */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className={`rounded-xl border p-4 ${missingRequired > 0 ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"}`}>
            <div className={`text-2xl font-bold ${missingRequired > 0 ? "text-red-700" : "text-emerald-700"}`}>{missingRequired}</div>
            <div className={`text-xs font-semibold ${missingRequired > 0 ? "text-red-700" : "text-emerald-700"}`}>
              Obrigatória(s) faltando
            </div>
          </div>
          <div className={`rounded-xl border p-4 ${missingRecommended > 0 ? "border-amber-200 bg-amber-50" : "border-border bg-card"}`}>
            <div className={`text-2xl font-bold ${missingRecommended > 0 ? "text-amber-700" : "text-foreground"}`}>{missingRecommended}</div>
            <div className="text-xs font-semibold text-muted-foreground">Recomendada(s) faltando</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-2xl font-bold text-foreground">
              {configured}<span className="text-base text-muted-foreground">/{all.length}</span>
            </div>
            <div className="text-xs font-semibold text-muted-foreground">Configuradas</div>
          </div>
        </div>

        {missingRequired > 0 && (
          <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Há chave(s) obrigatória(s) faltando — parte da loja não funciona até configurá-la(s) na Vercel.</span>
          </div>
        )}

        {/* Grupos */}
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">{group.title}</h2>
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                {group.items.map((item, i) => (
                  <div
                    key={item.key}
                    className={`flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between ${
                      i > 0 ? "border-t border-border/60" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <code className="break-all font-mono text-sm font-semibold text-foreground">{item.key}</code>
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.impact}</p>
                      <p className="mt-1.5 rounded-md bg-muted px-2 py-1.5 text-xs text-foreground">
                        <span className="font-semibold">Na Vercel, coloque:</span> {item.howto}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <StatusBadge item={item} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          As variáveis são lidas do ambiente do deploy atual. Depois de adicionar/alterar uma na Vercel,
          faça um novo deploy pra este diagnóstico refletir.
        </p>
      </div>
    </div>
  )
}
