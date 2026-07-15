import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { caseFiles, resolveVerdict } from '../data/cases'
import type { EvidenceId, Phase, Verdict, VerdictResult } from '../types'

const CASE_SECONDS = 24

export interface ArchivedRuling {
  caseId: string
  verdict: Verdict
  result: VerdictResult
  inspected: number
  seconds: number
}

export function useLostTimeBureau() {
  const [phase, setPhase] = useState<Phase>('start')
  const [paused, setPaused] = useState(false)
  const [caseIndex, setCaseIndex] = useState(0)
  const [seconds, setSeconds] = useState(CASE_SECONDS)
  const [stability, setStability] = useState(60)
  const [humanity, setHumanity] = useState(60)
  const [calibrations, setCalibrations] = useState(3)
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceId | null>(null)
  const [inspected, setInspected] = useState<Set<EvidenceId>>(() => new Set())
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [result, setResult] = useState<VerdictResult | null>(null)
  const [flags, setFlags] = useState<Set<string>>(() => new Set())
  const [history, setHistory] = useState<ArchivedRuling[]>([])
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(() => Number(localStorage.getItem('lost-time-bureau-best') || 0))
  const startedAtRef = useRef(0)
  const pausedAtRef = useRef(0)

  const currentCase = caseFiles[caseIndex]

  const prepareCase = useCallback((index: number) => {
    setCaseIndex(index)
    setSeconds(CASE_SECONDS)
    setSelectedEvidence(null)
    setInspected(new Set())
    setVerdict(null)
    setResult(null)
    startedAtRef.current = performance.now()
    pausedAtRef.current = 0
  }, [])

  const start = useCallback(() => {
    setPhase('case')
    setPaused(false)
    setStability(60)
    setHumanity(60)
    setCalibrations(3)
    setFlags(new Set())
    setHistory([])
    setScore(0)
    prepareCase(0)
  }, [prepareCase])

  const openEvidence = useCallback((id: EvidenceId) => {
    if (!currentCase) return
    setInspected((current) => {
      if (current.has(id)) return current
      if (current.size >= 2) {
        if (calibrations <= 0) return current
        setCalibrations((value) => Math.max(0, value - 1))
      }
      return new Set(current).add(id)
    })
    if (inspected.size >= 2 && !inspected.has(id) && calibrations <= 0) return
    setSelectedEvidence(id)
    pausedAtRef.current = performance.now()
  }, [calibrations, currentCase, inspected])

  const closeEvidence = useCallback(() => {
    if (pausedAtRef.current) {
      startedAtRef.current += performance.now() - pausedAtRef.current
      pausedAtRef.current = 0
    }
    setSelectedEvidence(null)
  }, [])

  const pause = useCallback(() => {
    if (phase !== 'case' || selectedEvidence) return
    pausedAtRef.current = performance.now()
    setPaused(true)
  }, [phase, selectedEvidence])

  const resume = useCallback(() => {
    if (pausedAtRef.current) {
      startedAtRef.current += performance.now() - pausedAtRef.current
      pausedAtRef.current = 0
    }
    setPaused(false)
  }, [])

  const submitVerdict = useCallback((choice: Verdict) => {
    if (!currentCase || phase !== 'case') return
    const resolved = resolveVerdict(currentCase, choice, flags)
    setVerdict(choice)
    setResult(resolved)
    setStability((value) => Math.max(0, Math.min(100, value + resolved.stabilityDelta)))
    setHumanity((value) => Math.max(0, Math.min(100, value + resolved.humanityDelta)))
    if (resolved.flag) setFlags((current) => new Set(current).add(resolved.flag!))
    const caseScore = 100 + (inspected.size === 3 ? 25 : 0) + (seconds >= 8 ? 20 : 0) + 35
    setScore((value) => value + caseScore)
    setHistory((current) => [...current, { caseId: currentCase.id, verdict: choice, result: resolved, inspected: inspected.size, seconds }])
    setPhase('reveal')
    setSelectedEvidence(null)
  }, [currentCase, flags, inspected.size, phase, seconds])

  const archive = useCallback(() => {
    const exhausted = stability <= 0 || humanity <= 0
    const complete = caseIndex >= caseFiles.length - 1
    if (exhausted || complete) {
      setPhase('result')
      return
    }
    const next = caseIndex + 1
    if (next === 3 || next === 5) setCalibrations((value) => Math.min(3, value + 1))
    prepareCase(next)
    setPhase('case')
  }, [caseIndex, humanity, prepareCase, stability])

  useEffect(() => {
    if (phase !== 'case' || selectedEvidence || paused) return
    let raf = 0
    const tick = (now: number) => {
      const next = Math.max(0, CASE_SECONDS - Math.floor((now - startedAtRef.current) / 1000))
      setSeconds(next)
      if (next > 0) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [caseIndex, paused, phase, selectedEvidence])

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && phase === 'case' && !selectedEvidence && !paused) pause()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [pause, paused, phase, selectedEvidence])

  useEffect(() => {
    if (phase === 'case' && seconds === 0) submitVerdict('return')
  }, [phase, seconds, submitVerdict])

  const selected = useMemo(
    () => currentCase?.evidence.find((item) => item.id === selectedEvidence) ?? null,
    [currentCase, selectedEvidence],
  )

  const totalScore = score + Math.min(stability, humanity) * 10

  useEffect(() => {
    if (phase !== 'result' || totalScore <= bestScore) return
    setBestScore(totalScore)
    localStorage.setItem('lost-time-bureau-best', String(totalScore))
  }, [bestScore, phase, totalScore])

  return {
    phase,
    paused,
    caseIndex,
    totalCases: caseFiles.length,
    currentCase,
    seconds,
    stability,
    humanity,
    calibrations,
    selected,
    inspected,
    verdict,
    result,
    flags,
    history,
    score,
    totalScore,
    bestScore,
    start,
    openEvidence,
    closeEvidence,
    pause,
    resume,
    submitVerdict,
    archive,
  }
}
