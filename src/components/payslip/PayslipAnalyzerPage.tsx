import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Send, Sparkles, FileText, X, AlertCircle,
  MessageSquare, RotateCcw, Settings2, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useSettings } from '@/hooks/useSettings'
import { useUIStore } from '@/store/uiStore'
import { useSalaryEngine } from '@/hooks/useSalaryEngine'
import type { SalaryResult } from '@/engine/salary'
import {
  analyzePayslip, chatAboutPayslip,
  DEFAULT_MISTRAL_MODEL, DEFAULT_SYSTEM_PROMPT,
  type ChatMessage,
} from '@/services/mistral'
import { useNavigate } from 'react-router-dom'

const MONTH_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function formatSalaryForMistral(result: SalaryResult, monthLabel: string): string {
  const fmt = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
  const lines: string[] = [
    `## Estimation Salairio — ${monthLabel}`,
    '',
    '### Brut',
    `- Salaire de base : ${fmt(result.grossBase)}`,
  ]
  if (result.ancienneteEuros > 0) lines.push(`- Prime ancienneté : ${fmt(result.ancienneteEuros)}`)
  if (result.fixedExtrasTotal > 0) lines.push(`- Primes fixes : ${fmt(result.fixedExtrasTotal)}`)
  if (result.oneOffBonusesTotal > 0) lines.push(`- Primes ponctuelles : ${fmt(result.oneOffBonusesTotal)}`)
  if (result.overtimePaidEuros > 0) lines.push(`- Heures supp payées : ${fmt(result.overtimePaidEuros)}`)
  lines.push(`- **Total brut : ${fmt(result.grossTotal)}**`)
  lines.push('')
  lines.push('### Déductions')
  lines.push(`- Cotisations salariales : −${fmt(result.cssEmployee)}`)
  lines.push(`- Mutuelle (part salariale) : −${fmt(result.mutuelleEmployee)}`)
  if (result.mealCostTotal > 0) lines.push(`- Repas (${result.mealCount} repas) : −${fmt(result.mealCostTotal)}`)
  lines.push(`- **Net imposable : ${fmt(result.netImposable)}**`)
  lines.push('')
  lines.push('### Net')
  if (result.pasRate > 0) lines.push(`- PAS (${result.pasRate.toFixed(1)} %) : −${fmt(result.pasAmount)}`)
  lines.push(`- **Net après impôt : ${fmt(result.netAfterTax)}**`)
  return lines.join('\n')
}

// ─── Rendu markdown minimaliste ───────────────────────────────────────────────
function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return (
            <p key={i} style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)', margin: '10px 0 2px' }}>
              {line.slice(3)}
            </p>
          )
        }
        if (line.startsWith('# ')) {
          return (
            <p key={i} style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--amber)', margin: '12px 0 4px' }}>
              {line.slice(2)}
            </p>
          )
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <p key={i} style={{ fontWeight: 600, color: 'var(--ink)', margin: '6px 0 0' }}>
              {line.slice(2, -2)}
            </p>
          )
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <p key={i} style={{ margin: '1px 0', paddingLeft: 12, color: 'var(--ink-2)', fontSize: '0.85rem' }}>
              {'· '}{renderInlineMarkdown(line.slice(2))}
            </p>
          )
        }
        if (line.trim() === '') return <div key={i} style={{ height: 4 }} />
        return (
          <p key={i} style={{ margin: '1px 0', color: 'var(--ink-2)', fontSize: '0.85rem', lineHeight: 1.6 }}>
            {renderInlineMarkdown(line)}
          </p>
        )
      })}
    </div>
  )
}

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: 'var(--ink)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

// ─── État d'une bulle de chat ─────────────────────────────────────────────────
interface BubbleProps {
  msg: ChatMessage
}

function ChatBubble({ msg }: BubbleProps) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 8,
      }}
    >
      <div style={{
        maxWidth: '85%',
        padding: '0.6rem 0.875rem',
        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        background: isUser
          ? 'rgba(214,138,60,0.15)'
          : 'var(--paper-3)',
        border: isUser
          ? '1px solid rgba(214,138,60,0.25)'
          : '1px solid var(--rule)',
        fontSize: '0.85rem',
        lineHeight: 1.55,
        color: 'var(--ink)',
      }}>
        {isUser ? msg.content : <MarkdownText text={msg.content} />}
      </div>
    </motion.div>
  )
}

// ─── Zone de dépôt fichier ────────────────────────────────────────────────────
interface DropZoneProps {
  onFile: (file: File) => void
  disabled?: boolean
}

function DropZone({ onFile, disabled }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); if (!disabled) setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? 'var(--amber)' : 'var(--rule)'}`,
        borderRadius: 14,
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        cursor: disabled ? 'default' : 'pointer',
        background: dragging ? 'rgba(214,138,60,0.04)' : 'transparent',
        transition: 'all 0.2s',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Upload size={28} color="var(--amber)" strokeWidth={1.5} />
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--ink)', fontWeight: 600 }}>
          Importer une fiche de paie
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--ink-3)' }}>
          JPEG, PNG ou PDF · max 5 Mo
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}

// ─── Conversion fichier → base64 JPEG (PDF converti via PDF.js) ───────────────
async function fileToJpegBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  if (file.type !== 'application/pdf') {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve((reader.result as string).split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    return { base64, mimeType: file.type }
  }

  // PDF → toutes les pages collées verticalement via PDF.js
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')
  GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url,
  ).toString()

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await getDocument({ data: arrayBuffer }).promise
  const SCALE = 2.0

  // Rendre chaque page dans un canvas temporaire
  const pageCanvases: HTMLCanvasElement[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: SCALE })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvasContext: canvas.getContext('2d')!, canvas, viewport }).promise
    pageCanvases.push(canvas)
  }

  // Fusionner verticalement dans un seul canvas
  const totalWidth = Math.max(...pageCanvases.map(c => c.width))
  const totalHeight = pageCanvases.reduce((sum, c) => sum + c.height, 0)
  const merged = document.createElement('canvas')
  merged.width = totalWidth
  merged.height = totalHeight
  const mctx = merged.getContext('2d')!
  let y = 0
  for (const c of pageCanvases) {
    mctx.drawImage(c, 0, y)
    y += c.height
  }

  const dataUrl = merged.toDataURL('image/jpeg', 0.92)
  return { base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / 1048576).toFixed(1)} Mo`
}

// ═══════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════
export function PayslipAnalyzerPage() {
  const { settings } = useSettings()
  const navigate = useNavigate()
  const { selectedYear, selectedMonth, goToPrevMonth, goToNextMonth } = useUIStore()

  const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`
  const monthLabel = `${MONTH_LABELS[selectedMonth - 1]} ${selectedYear}`
  const { result: salaryResult } = useSalaryEngine(monthKey)

  const apiKey = settings?.mistralApiKey ?? ''
  const model = settings?.mistralModel ?? DEFAULT_MISTRAL_MODEL
  const systemPrompt = settings?.mistralSystemPrompt ?? DEFAULT_SYSTEM_PROMPT

  // Fichier sélectionné
  const [file, setFile] = useState<File | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)

  // Résultat analyse
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)

  // Chat
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [question, setQuestion] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const handleFile = useCallback((f: File) => {
    if (f.size > 5 * 1024 * 1024) {
      setAnalyzeError('Le fichier dépasse 5 Mo.')
      return
    }
    setFile(f)
    setAnalysis(null)
    setAnalyzeError(null)
    setChatHistory([])

    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f)
      setFilePreviewUrl(url)
    } else {
      setFilePreviewUrl(null)
    }
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!file || !apiKey) return
    setAnalyzing(true)
    setAnalyzeError(null)
    setAnalysis(null)

    try {
      const { base64, mimeType } = await fileToJpegBase64(file)
      const salarioCalcMarkdown = salaryResult
        ? formatSalaryForMistral(salaryResult, monthLabel)
        : undefined
      const result = await analyzePayslip(apiKey, model, systemPrompt, base64, mimeType, salarioCalcMarkdown)
      setAnalysis(result.analysis)
      setChatHistory([])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erreur inconnue'
      setAnalyzeError(msg)
    } finally {
      setAnalyzing(false)
    }
  }, [file, apiKey, model, systemPrompt])

  const handleSendQuestion = useCallback(async () => {
    const q = question.trim()
    if (!q || chatLoading || !apiKey) return
    setQuestion('')
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: q }]
    setChatHistory(newHistory)
    setChatLoading(true)
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)

    try {
      const answer = await chatAboutPayslip(
        apiKey, model, systemPrompt,
        chatHistory, q,
        analysis ?? undefined,
      )
      setChatHistory(prev => [...prev, { role: 'assistant', content: answer }])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erreur réseau'
      setChatHistory(prev => [...prev, { role: 'assistant', content: `❌ ${msg}` }])
    } finally {
      setChatLoading(false)
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [question, chatHistory, chatLoading, apiKey, model, systemPrompt, analysis])

  const handleReset = () => {
    setFile(null)
    setFilePreviewUrl(null)
    setAnalysis(null)
    setAnalyzeError(null)
    setChatHistory([])
    setQuestion('')
  }

  const hasApiKey = Boolean(apiKey)

  return (
    <div style={{ paddingBottom: '5rem' }}>
      <PageHeader
        title="Analyse IA"
        subtitle="Comparer fiche réelle et estimation Salairio"
        action={
          <button
            type="button"
            onClick={() => navigate('/settings')}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '0.3rem 0.65rem', borderRadius: 7,
              border: '1px solid var(--rule)',
              background: 'transparent',
              color: 'var(--ink-3)', fontSize: '0.72rem',
              cursor: 'pointer',
            }}
          >
            <Settings2 size={12} />
            Clé API
          </button>
        }
      />

      <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 720, margin: '0 auto' }}>

        {/* ── Sélecteur de mois ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.65rem 1rem',
          background: 'var(--paper-3)',
          border: '1px solid var(--rule)',
          borderRadius: 12,
        }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--ink-3)' }}>Mois de référence Salairio</p>
            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink)', fontFamily: "'DM Mono', monospace" }}>
              {monthLabel}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {salaryResult && (
              <span style={{ fontSize: '0.72rem', color: 'var(--amber)', fontFamily: "'DM Mono', monospace", marginRight: 8 }}>
                {salaryResult.netAfterTax.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </span>
            )}
            <button type="button" onClick={goToPrevMonth} style={{ background: 'none', border: '1px solid var(--rule)', borderRadius: 6, padding: '0.3rem', cursor: 'pointer', color: 'var(--ink-3)', display: 'flex' }}>
              <ChevronLeft size={14} />
            </button>
            <button type="button" onClick={goToNextMonth} style={{ background: 'none', border: '1px solid var(--rule)', borderRadius: 6, padding: '0.3rem', cursor: 'pointer', color: 'var(--ink-3)', display: 'flex' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* ── Avertissement clé manquante ── */}
        {!hasApiKey && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '0.875rem',
              background: 'rgba(214,138,60,0.07)',
              border: '1px solid rgba(214,138,60,0.22)',
              borderRadius: 12,
            }}
          >
            <AlertCircle size={16} color="var(--amber)" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)' }}>
                Clé API Mistral manquante
              </p>
              <p style={{ margin: '4px 0 8px', fontSize: '0.78rem', color: 'var(--ink-3)', lineHeight: 1.5 }}>
                Configure ta clé API dans les Réglages → section "Analyse IA" pour utiliser cette fonctionnalité.
              </p>
              <button
                type="button"
                onClick={() => navigate('/settings')}
                style={{
                  padding: '0.35rem 0.75rem', borderRadius: 7,
                  background: 'rgba(214,138,60,0.12)',
                  border: '1px solid rgba(214,138,60,0.3)',
                  color: 'var(--amber)', fontSize: '0.78rem', fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Aller dans les réglages
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Zone import fichier ── */}
        {!file && (
          <DropZone onFile={handleFile} disabled={!hasApiKey} />
        )}

        {/* ── Fichier sélectionné ── */}
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              borderRadius: 14,
              border: '1px solid var(--rule)',
              overflow: 'hidden',
              background: 'var(--paper-3)',
            }}
          >
            {/* Preview image */}
            {filePreviewUrl && (
              <img
                src={filePreviewUrl}
                alt="Aperçu fiche de paie"
                style={{ width: '100%', maxHeight: 280, objectFit: 'contain', background: '#fff', display: 'block' }}
              />
            )}

            {/* Méta + actions */}
            <div style={{ padding: '0.875rem', display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileText size={20} color="var(--amber)" strokeWidth={1.5} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--ink-3)' }}>
                  {formatBytes(file.size)}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {!analysis && (
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '0.45rem 0.875rem', borderRadius: 8,
                      background: analyzing ? 'var(--paper-3)' : 'rgba(214,138,60,0.15)',
                      border: '1px solid rgba(214,138,60,0.3)',
                      color: analyzing ? 'var(--ink-3)' : 'var(--amber)',
                      fontWeight: 600, fontSize: '0.82rem',
                      cursor: analyzing ? 'default' : 'pointer',
                    }}
                  >
                    <Sparkles size={14} />
                    {analyzing ? 'Analyse…' : 'Analyser'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  title="Changer de fichier"
                  style={{
                    display: 'flex', alignItems: 'center', padding: '0.45rem',
                    borderRadius: 8, border: '1px solid var(--rule)',
                    background: 'transparent', color: 'var(--ink-3)', cursor: 'pointer',
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Spinner analyse ── */}
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '1rem',
              background: 'var(--paper-3)',
              border: '1px solid var(--rule)',
              borderRadius: 12,
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles size={18} color="var(--amber)" />
            </motion.div>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)' }}>
                Mistral analyse ta fiche…
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--ink-3)' }}>
                Extraction et comparaison en cours, quelques secondes.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Erreur analyse ── */}
        {analyzeError && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex', gap: 10,
              padding: '0.875rem', borderRadius: 12,
              background: 'rgba(200,112,103,0.07)',
              border: '1px solid rgba(200,112,103,0.25)',
            }}
          >
            <AlertCircle size={16} color="var(--rose)" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: 'var(--rose)' }}>Erreur</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--ink-3)', lineHeight: 1.5 }}>
                {analyzeError}
              </p>
              <button
                type="button"
                onClick={handleAnalyze}
                style={{
                  marginTop: 8, display: 'flex', alignItems: 'center', gap: 5,
                  padding: '0.3rem 0.65rem', borderRadius: 6,
                  border: '1px solid rgba(200,112,103,0.35)',
                  background: 'transparent',
                  color: 'var(--rose)', fontSize: '0.75rem', cursor: 'pointer',
                }}
              >
                <RotateCcw size={12} /> Réessayer
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Résultat de l'analyse ── */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '1rem',
                background: 'var(--paper-3)',
                border: '1px solid var(--rule)',
                borderRadius: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: '0.875rem' }}>
                <Sparkles size={15} color="var(--amber)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Analyse Mistral
                </span>
              </div>
              <MarkdownText text={analysis} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Section chat (disponible dès qu'il y a une analyse ou une clé) ── */}
        {(analysis || chatHistory.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              border: '1px solid var(--rule)',
              borderRadius: 14,
              overflow: 'hidden',
              background: 'var(--paper)',
            }}
          >
            {/* Header chat */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '0.75rem 1rem',
              borderBottom: '1px solid var(--rule)',
              background: 'var(--paper-3)',
            }}>
              <MessageSquare size={14} color="var(--ink-3)" />
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--ink-2)' }}>
                Poser une question
              </span>
              {chatHistory.length > 0 && (
                <button
                  type="button"
                  onClick={() => setChatHistory([])}
                  title="Effacer la conversation"
                  style={{
                    marginLeft: 'auto', display: 'flex', alignItems: 'center',
                    gap: 4, padding: '0.2rem 0.45rem', borderRadius: 5,
                    border: '1px solid var(--rule)', background: 'transparent',
                    color: 'var(--ink-4)', fontSize: '0.65rem', cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={10} /> Effacer
                </button>
              )}
            </div>

            {/* Messages */}
            {chatHistory.length > 0 && (
              <div style={{ padding: '0.875rem 1rem', maxHeight: 420, overflowY: 'auto' }}>
                {chatHistory.map((msg, i) => (
                  <ChatBubble key={i} msg={msg} />
                ))}
                {chatLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ display: 'flex', gap: 4, padding: '0.5rem 0' }}
                  >
                    {[0, 1, 2].map(j => (
                      <motion.div
                        key={j}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay: j * 0.15 }}
                        style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--amber)', opacity: 0.7 }}
                      />
                    ))}
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}

            {/* Champ saisie */}
            <div style={{
              display: 'flex', gap: 8,
              padding: '0.75rem 1rem',
              borderTop: chatHistory.length > 0 ? '1px solid var(--rule)' : undefined,
            }}>
              <input
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendQuestion() } }}
                placeholder="Ex: Pourquoi mon ancienneté est différente ?"
                disabled={chatLoading || !hasApiKey}
                style={{
                  flex: 1,
                  padding: '0.55rem 0.75rem',
                  borderRadius: 9,
                  border: '1px solid var(--rule)',
                  background: 'var(--paper-3)',
                  color: 'var(--ink)',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={handleSendQuestion}
                disabled={!question.trim() || chatLoading || !hasApiKey}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 40, height: 40, borderRadius: 9,
                  background: question.trim() && !chatLoading ? 'rgba(214,138,60,0.18)' : 'var(--paper-3)',
                  border: '1px solid rgba(214,138,60,0.3)',
                  color: question.trim() && !chatLoading ? 'var(--amber)' : 'var(--ink-4)',
                  cursor: question.trim() && !chatLoading ? 'pointer' : 'default',
                  flexShrink: 0,
                }}
                aria-label="Envoyer"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Chat accessible même sans fichier (questions générales) ── */}
        {!analysis && chatHistory.length === 0 && hasApiKey && file && !analyzing && (
          <div style={{
            padding: '0.875rem', borderRadius: 12,
            border: '1px dashed var(--rule)',
            fontSize: '0.78rem', color: 'var(--ink-3)', textAlign: 'center',
          }}>
            Lance l'analyse pour débloquer le chat et poser des questions précises.
          </div>
        )}

        {/* ── Message de bienvenue si clé présente et pas encore de fichier ── */}
        {hasApiKey && !file && (
          <div style={{
            padding: '1rem',
            borderRadius: 12,
            border: '1px solid var(--rule)',
            background: 'var(--paper-3)',
          }}>
            <p style={{ margin: '0 0 6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>
              Comment ça marche ?
            </p>
            <ol style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                'Importe ta fiche de paie (photo ou PDF).',
                'Mistral extrait toutes les lignes et les compare avec ton estimation.',
                'Lis l\'analyse, puis pose des questions si quelque chose est flou.',
              ].map((step, i) => (
                <li key={i} style={{ fontSize: '0.78rem', color: 'var(--ink-3)', lineHeight: 1.5 }}>
                  {step}
                </li>
              ))}
            </ol>
            <p style={{ margin: '10px 0 0', fontSize: '0.72rem', color: 'var(--ink-4)' }}>
              ~0,003 € par analyse · Mistral ne stocke pas ta fiche de paie
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
