export const DEFAULT_MISTRAL_MODEL = 'mistral-small-latest'

export const DEFAULT_SYSTEM_PROMPT = `Tu es un assistant expert en fiches de paie françaises.
Tu aides à comprendre les différences entre un salaire estimé et le salaire réel figurant sur une fiche de paie.

Règles :
- Réponds toujours en français.
- Sois précis, concis et pédagogue.
- Quand tu analyses une fiche de paie, explique ligne par ligne ce que tu vois.
- Quand tu compares avec une estimation Salairio, identifie et explique chaque écart (montant, taux, libellé).
- Si tu n'es pas sûr d'un point, dis-le clairement.
- Ne fabrique jamais de chiffres — base-toi uniquement sur ce qui t'est fourni.`

export interface MistralMessage {
  role: 'user' | 'assistant' | 'system'
  content: string | MistralImageContent[]
}

export interface MistralImageContent {
  type: 'text' | 'image_url'
  text?: string
  image_url?: { url: string }
}

export interface PayslipAnalysisResult {
  analysis: string
  extractedLines?: PayslipLine[]
}

export interface PayslipLine {
  libelle: string
  base?: string
  taux?: string
  montant?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

async function callMistral(
  apiKey: string,
  model: string,
  messages: MistralMessage[],
  systemPrompt: string,
): Promise<string> {
  const allMessages: MistralMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ]

  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: allMessages,
      temperature: 0.2,
      max_tokens: 2048,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = (err as { message?: string }).message ?? `HTTP ${res.status}`
    throw new Error(`Mistral API : ${msg}`)
  }

  const data = await res.json() as {
    choices: { message: { content: string } }[]
  }
  return data.choices[0]?.message?.content ?? ''
}

export async function analyzePayslip(
  apiKey: string,
  model: string,
  systemPrompt: string,
  fileBase64: string,
  mimeType: string,
  salarioCalcMarkdown?: string,
): Promise<PayslipAnalysisResult> {
  const userContent: MistralImageContent[] = [
    {
      type: 'image_url',
      image_url: { url: `data:${mimeType};base64,${fileBase64}` },
    },
    {
      type: 'text',
      text: salarioCalcMarkdown
        ? `Voici ma fiche de paie. Analyse-la ligne par ligne et compare avec mon estimation Salairio ci-dessous.\n\n**Estimation Salairio :**\n${salarioCalcMarkdown}\n\nIdentifie et explique chaque différence entre la fiche réelle et l'estimation.`
        : 'Analyse cette fiche de paie ligne par ligne. Extrais tous les libellés, bases, taux et montants, et explique ce que chaque ligne représente.',
    },
  ]

  const text = await callMistral(apiKey, model, [{ role: 'user', content: userContent }], systemPrompt)
  return { analysis: text }
}

export async function chatAboutPayslip(
  apiKey: string,
  model: string,
  systemPrompt: string,
  history: ChatMessage[],
  question: string,
  analysisContext?: string,
): Promise<string> {
  const messages: MistralMessage[] = []

  if (analysisContext) {
    messages.push({
      role: 'user',
      content: `[Contexte de la fiche analysée]\n${analysisContext}`,
    })
    messages.push({
      role: 'assistant',
      content: "J'ai bien pris en compte l'analyse de ta fiche de paie. Pose-moi tes questions.",
    })
  }

  for (const msg of history) {
    messages.push({ role: msg.role, content: msg.content })
  }

  messages.push({ role: 'user', content: question })

  return callMistral(apiKey, model, messages, systemPrompt)
}
