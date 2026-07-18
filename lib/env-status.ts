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
  // Instrução exata do que colocar como VALOR desta variável na Vercel.
  howto: string
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
          howto: "Cole a Secret Key do painel da Pagou.ai (Configurações → API/Chaves). Server-side, nunca exponha.",
        },
        {
          key: "NEXT_PUBLIC_PAGOUAI_PUBLIC_KEY",
          level: "recommended",
          present: has(e.NEXT_PUBLIC_PAGOUAI_PUBLIC_KEY),
          impact: "Sem ela o pagamento por CARTÃO não funciona (o PIX funciona só com a secret).",
          howto: "Cole a Public Key da Pagou.ai (começa com pk_live_ em produção ou pk_test_ em teste).",
        },
        {
          key: "MEDUSAPAY_SECRET_KEY",
          level: "optional",
          present: has(e.MEDUSAPAY_SECRET_KEY),
          impact: "Só necessária se você ativar o gateway MedusaPay no seletor.",
          howto: "Cole a Secret Key da MedusaPay (Settings → API Credentials; começa com sk_live_ ou sk_test_).",
        },
        {
          key: "CENTURION_API_KEY",
          level: "optional",
          present: has(e.CENTURION_API_KEY),
          impact: "Só necessária se você ativar o gateway CenturionPay no seletor.",
          howto: "Cole a API Key do painel da CenturionPay (a chave enviada no header x-api-key).",
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
          howto: "Provisione um Upstash Redis (upstash.com → Redis → Details → REST API) e cole a REST URL numa var e o REST Token na outra. Duas variáveis.",
        },
        {
          key: "PAGOUAI_WEBHOOK_SECRET",
          level: "recommended",
          present: has(e.PAGOUAI_WEBHOOK_SECRET),
          impact: "Protege o webhook da Pagou (só aceita chamadas com o segredo). Recomendado.",
          howto: "Invente uma senha aleatória forte (ex.: 32 caracteres). Use o MESMO valor aqui e na URL do webhook cadastrada na Pagou.ai (?secret=...).",
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
          howto: "Cole a API Key do painel do Resend (resend.com → API Keys → Create). Começa com re_.",
        },
        {
          key: "RESEND_FROM_EMAIL",
          level: "recommended",
          present: has(e.RESEND_FROM_EMAIL),
          impact: "Remetente verificado; sem domínio verificado o Resend só envia em modo teste.",
          howto: 'Formato "Nome <email@seudominio.com>". Ex.: CumpadiFood <pedidos@cumpadifood.com>. O domínio precisa estar verificado no Resend.',
        },
        {
          key: "RESEND_REPLY_TO",
          level: "optional",
          present: has(e.RESEND_REPLY_TO),
          impact: "Endereço de resposta do e-mail (opcional).",
          howto: "Um e-mail pra onde vão as respostas dos clientes. Ex.: suporte@cumpadifood.com.",
        },
        {
          key: "STORE_EMAIL",
          level: "optional",
          present: has(e.STORE_EMAIL),
          impact: "Recebe uma cópia de cada venda no seu e-mail (opcional).",
          howto: "Seu e-mail (ou o da loja) que recebe um aviso a cada pedido novo. Ex.: dono@gmail.com.",
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
          howto: "O endereço público da loja, SEM barra no final. Ex.: https://cumpadifood.com.",
        },
        {
          key: "ADMIN_PASSWORD",
          level: "required",
          present: has(e.ADMIN_PASSWORD),
          impact: "Senha do painel. Se você está vendo esta tela, já está configurada.",
          howto: "A senha que você digita pra entrar neste painel. Escolha uma forte.",
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
          howto: "No console do Upstash → QStash → aba .env da sua região: copie o QSTASH_TOKEN e a QSTASH_URL (ex.: https://qstash-us-east-1.upstash.io). Duas variáveis.",
        },
        {
          key: "BLOB_READ_WRITE_TOKEN",
          level: "optional",
          present: has(e.BLOB_READ_WRITE_TOKEN),
          impact: "Upload do comprovante de PIX. Sem ele, o upload é pulado.",
          howto: "Criado automaticamente ao adicionar um Blob Store na Vercel (Storage → Create → Blob). Não precisa digitar o valor à mão.",
        },
        {
          key: "NOTIFY_URL_OVERRIDE",
          level: "optional",
          present: has(e.NOTIFY_URL_OVERRIDE),
          impact: "Relay: esconde o domínio da loja do gateway Pagou.",
          howto: "A URL do relay que recebe o webhook no seu lugar. Ex.: https://www.fionobres.shop/api/webhooks/payment/<sua-chave>.",
        },
        {
          key: "RELAY_SECRET",
          level: "optional",
          present: has(e.RELAY_SECRET),
          impact: "Segredo do relay de webhook (valida a origem).",
          howto: "O mesmo segredo configurado no painel do relay pra esta loja.",
        },
      ],
    },
  ]
}
