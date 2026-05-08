export const DEFAULT_MISTRAL_MODEL = 'mistral-small-latest'

export const DEFAULT_SYSTEM_PROMPT = `Tu es un expert RH spécialisé en fiches de paie françaises. Tu réponds en français, de façon courte et directe.

FORMAT OBLIGATOIRE pour toute analyse comparative :

**RÉSUMÉ** (2 lignes max)
Brut fiche : X € | Net fiche : X € → Écart net vs Salairio : ±X €

**ÉCARTS** (tableau OBLIGATOIRE avec toutes les lignes suivantes, même si écart = 0)
| Poste | Fiche | Salairio | Écart | Cause probable |
|---|---|---|---|---|
Lignes à toujours inclure : Salaire de base, Primes (total Segur + autres), Cotisations salariales, Mutuelle salariale, Repas, Net avant impôt, PAS, Net après impôt.
Si l'estimation indique "mois partiel" ET fournit des heures Salairio : ajouter en tête une ligne "Heures de base (h)" et comparer avec la colonne Unité/Base de la fiche.
Si une ligne est absente de la fiche : mettre "—" dans la colonne Fiche.

**VERDICT** (1 ligne)
✅ Cohérent / ⚠️ Écart mineur à vérifier / ❌ Écart significatif — [raison en 5 mots]

STRUCTURE DES FICHES DE PAIE PUBLIQUE FRANÇAISE (colonnes) :
- Libellé | Unité/Base | Taux | À retenir (salarié) | À payer (salarié) | Montant (employeur)
- "Unité/Base" = nombre d'heures ou base de calcul — CE N'EST PAS UN MONTANT
- Le montant d'une ligne = colonne "À payer" (salarié) ou "À retenir" si c'est une retenue
- Salaire de base : montant = Unité/Base × Taux (ex: 151,67h × 15,1645 = 2 300 €)
- Toute ligne contenant "SEGUR" = prime, sans exception (Segur I, Segur II, Segur III… sont toutes des primes) — additionner TOUTES les lignes Segur entre elles, ne pas en oublier une seule

VÉRIFICATION ARITHMÉTIQUE OBLIGATOIRE (à faire avant de remplir le tableau) :
1. Calcule : brut fiche − net avant impôt fiche = total déductions fiche
2. Compare ce total avec la somme des lignes de déduction visibles (cotisations + mutuelle + repas + autres retenues)
3. Si l'écart > 1 € : il existe une ligne cachée ou mal lue — la signaler explicitement dans le tableau avec son montant estimé
4. Vérifie de même côté Salairio : brut Salairio − net Salairio avant impôt doit coller avec la somme des déductions transmises

RÈGLES STRICTES :
- Jamais de liste "ligne par ligne" si une comparaison est disponible
- Ne jamais confondre la colonne "Unité/Base" (heures/base) avec un montant en euros
- Mois partiel : si l'estimation Salairio indique "MOIS PARTIEL", comparer le brut proratisé attendu (fourni) avec ce que montre réellement la fiche. Deux cas possibles : (1) la fiche affiche directement le brut proratisé → comparer normalement ; (2) la fiche affiche le brut plein mois + une ligne de déduction "absence entrée/sortie" → additionner salaire de base et déduction pour retrouver le net effectif, signaler ce mécanisme sans conclure à une erreur
- Si une valeur est illisible sur la fiche : indique "?" sans inventer
- Zéro blabla introductif — commence directement par RÉSUMÉ`

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
        ? `Fiche de paie ci-jointe. Compare avec l'estimation Salairio.\n\n${salarioCalcMarkdown}\n\nSuis le format imposé (RÉSUMÉ / ÉCARTS / VERDICT). Si le brut fiche est inférieur au brut Salairio, vérifie d'abord si c'est un mois partiel (prorata jours).`
        : `Fiche de paie ci-jointe. Pas d'estimation disponible.\nRéponds avec : RÉSUMÉ (brut / net / charges), LIGNES CLÉS (tableau des montants principaux), NOTE (1 ligne si quelque chose semble anormal).`,
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
