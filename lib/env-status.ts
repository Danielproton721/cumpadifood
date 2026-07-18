// Diagnóstico de configuração do /admin.
//
// SEGURANÇA: só reporta a PRESENÇA de cada variável (true/false) — NUNCA o
// valor. Roda exclusivamente no servidor (chamado pelo server component
// app/admin/config/page.tsx). Nenhum segredo é enviado ao browser.

export type EnvLevel = "required" | "recommended" | "optional"

export type EnvItem = {
  key: string
  level: EnvLevel
  present: boolean
  impact: string
}

export type EnvGroup = {
  title: string
  items: EnvItem[]
}

const has = (v?: string) => Boolean(v && v.trim())

export function getEnvStatus(): EnvGroup[] {
  const e = process.env

  // KV: aceita os dois pares de nomes (Upstash direto ou o alias da Vercel).
  const kvOk =
    (has(e.UPSTASH_REDIS_REST_URL) && has(e.UPSTASH_REDIS_REST_TOKEN)) ||
    (has(e.KV_REST_API_URL) && has(e.KV_REST_API_TOKEN))

  return [
    {
      title: "Pagamento",
      items: [
        {
          key: "PAGOUAI_SECRET_KEY",
          level: "required",
          present: has(e.PAGOUAI_SECRET_KEY),
          impact: "Sem ela o checkout não gera PIX nem cartão (gateway Pagou.ai).",
        },
        {
          key: "NEXT_PUBLIC_PAGOUAI_PUBLIC_KEY",
          level: "recommended",
          present: has(e.NEXT_PUBLIC_PAGOUAI_PUBLIC_KEY),
          impact: "Sem ela o pagamento por CARTÃO não funciona (o PIX funciona só com a secret).",
        },
        {
          key: "MEDUSAPAY_SECRET_KEY",
          level: "optional",
          present: has(e.MEDUSAPAY_SECRET_KEY),
          impact: "Só necessária se você ativar o gateway MedusaPay no seletor.",
        },
        {
          key: "CENTURION_API_KEY",
          level: "optional",
          present: has(e.CENTURION_API_KEY),
          impact: "Só necessária se você ativar o gateway CenturionPay no seletor.",
        },
      ],
    },
    {
      title: "Banco de dados (KV / Upstash)",
      items: [
        {
          key: "UPSTASH_REDIS_REST_URL + _TOKEN (ou KV_REST_API_*)",
          level: "recommended",
          present: kvOk,
          impact: "Sem KV: pedidos, contador de online, seletor de gateway e e-mail de aba fechada param.",
        },
        {
          key: "PAGOUAI_WEBHOOK_SECRET",
          level: "recommended",
          present: has(e.PAGOUAI_WEBHOOK_SECRET),
          impact: "Protege o webhook da Pagou (só aceita chamadas com o segredo). Recomendado.",
        },
      ],
    },
    {
      title: "E-mail (Resend)",
      items: [
        {
          key: "RESEND_API_KEY",
          level: "recommended",
          present: has(e.RESEND_API_KEY),
          impact: "Sem ela, o e-mail de confirmação não é enviado (a venda não trava).",
        },
        {
          key: "RESEND_FROM_EMAIL",
          level: "recommended",
          present: has(e.RESEND_FROM_EMAIL),
          impact: "Remetente verificado; sem domínio verificado o Resend só envia em modo teste.",
        },
        {
          key: "RESEND_REPLY_TO",
          level: "optional",
          present: has(e.RESEND_REPLY_TO),
          impact: "Endereço de resposta do e-mail (opcional).",
        },
        {
          key: "STORE_EMAIL",
          level: "optional",
          present: has(e.STORE_EMAIL),
          impact: "Recebe uma cópia de cada venda no seu e-mail (opcional).",
        },
      ],
    },
    {
      title: "Site / Painel",
      items: [
        {
          key: "NEXT_PUBLIC_APP_URL",
          level: "recommended",
          present: has(e.NEXT_PUBLIC_APP_URL),
          impact: "URL pública da loja (logo do e-mail e webhook dos gateways novos).",
        },
        {
          key: "ADMIN_PASSWORD",
          level: "required",
          present: has(e.ADMIN_PASSWORD),
          impact: "Senha do painel. Se você está vendo esta tela, já está configurada.",
        },
      ],
    },
    {
      title: "Extras (opcionais)",
      items: [
        {
          key: "QSTASH_TOKEN + QSTASH_URL",
          level: "optional",
          present: has(e.QSTASH_TOKEN) && has(e.QSTASH_URL),
          impact: "E-mail de carrinho abandonado. Sem eles, não é agendado (resto funciona).",
        },
        {
          key: "BLOB_READ_WRITE_TOKEN",
          level: "optional",
          present: has(e.BLOB_READ_WRITE_TOKEN),
          impact: "Upload do comprovante de PIX. Sem ele, o upload é pulado.",
        },
        {
          key: "NOTIFY_URL_OVERRIDE",
          level: "optional",
          present: has(e.NOTIFY_URL_OVERRIDE),
          impact: "Relay: esconde o domínio da loja do gateway Pagou.",
        },
        {
          key: "RELAY_SECRET",
          level: "optional",
          present: has(e.RELAY_SECRET),
          impact: "Segredo do relay de webhook (valida a origem).",
        },
      ],
    },
  ]
}
