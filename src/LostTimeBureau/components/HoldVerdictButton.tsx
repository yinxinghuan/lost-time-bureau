import { useEffect, useRef, useState } from 'react'
import type { Verdict } from '../types'

interface Props {
  verdict: Verdict
  label: string
  holdLabel: string
  previewLabel: string
  onCommit: (verdict: Verdict) => void
}

export function HoldVerdictButton({ verdict, label, holdLabel, previewLabel, onCommit }: Props) {
  const [progress, setProgress] = useState(0)
  const [previewing, setPreviewing] = useState(false)
  const rafRef = useRef(0)
  const startRef = useRef(0)
  const committedRef = useRef(false)

  const cancel = () => {
    cancelAnimationFrame(rafRef.current)
    setProgress(0)
    setPreviewing(false)
    startRef.current = 0
    committedRef.current = false
  }

  const begin = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (startRef.current) return
    event.currentTarget.setPointerCapture(event.pointerId)
    startRef.current = performance.now()
    committedRef.current = false
    const frame = (now: number) => {
      const elapsed = now - startRef.current
      setProgress(Math.min(1, elapsed / 650))
      if (elapsed >= 360) setPreviewing(true)
      if (elapsed >= 650) {
        committedRef.current = true
        navigator.vibrate?.(20)
        onCommit(verdict)
        cancel()
        return
      }
      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)
  }

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  return (
    <button
      className={`ltb-verdict ltb-verdict--${verdict}${progress > 0 ? ' is-pressing' : ''}`}
      type="button"
      onPointerDown={begin}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onLostPointerCapture={() => { if (!committedRef.current) cancel() }}
    >
      <span className="ltb-verdict__fill" style={{ transform: `scaleX(${progress})` }} />
      {previewing && <span className="ltb-verdict__preview">{previewLabel}</span>}
      <span className="ltb-verdict__label">{label}</span>
      <span className="ltb-verdict__hint">{previewing ? holdLabel : holdLabel}</span>
    </button>
  )
}
