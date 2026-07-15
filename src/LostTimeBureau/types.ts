export type Phase = 'start' | 'case' | 'reveal' | 'result'
export type Verdict = 'stay' | 'return'
export type EvidenceId = 'object' | 'memory' | 'echo'

export interface Evidence {
  id: EvidenceId
  labelKey: string
  valueKey: string
  detailKey: string
}

export interface VerdictResult {
  stabilityDelta: number
  humanityDelta: number
  title: LocalizedText
  summary: LocalizedText
  timelinePast: LocalizedText
  timelineFuture: LocalizedText
  flag?: string
}

export interface LocalizedText {
  zh: string
  en: string
}

export interface CaseFile {
  id: string
  name: LocalizedText
  meta: LocalizedText
  quote: LocalizedText
  portrait: string
  evidence: Array<{
    id: EvidenceId
    label: LocalizedText
    value: LocalizedText
    detail: LocalizedText
  }>
  verdicts: Record<Verdict, VerdictResult>
  echoFlag?: string
  echoText?: LocalizedText
}
