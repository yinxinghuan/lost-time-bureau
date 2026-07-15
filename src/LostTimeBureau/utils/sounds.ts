let context: AudioContext | null = null
let muted = localStorage.getItem('lost-time-bureau-muted') === '1'

function ctx() {
  if (muted) return null
  context ??= new AudioContext()
  if (context.state === 'suspended') void context.resume()
  return context
}

function tone(from: number, to: number, duration: number, volume = 0.06, type: OscillatorType = 'sine') {
  const audio = ctx()
  if (!audio) return
  const now = audio.currentTime
  const oscillator = audio.createOscillator()
  const gain = audio.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(from, now)
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, to), now + duration)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  oscillator.connect(gain).connect(audio.destination)
  oscillator.start(now)
  oscillator.stop(now + duration + 0.02)
}

export const sounds = {
  instrument: () => tone(540, 680, 0.075, 0.055, 'sine'),
  drawerClose: () => tone(480, 350, 0.07, 0.045, 'sine'),
  verdict: (kind: 'stay' | 'return') => {
    tone(85, 70, 0.1, 0.09, 'sine')
    window.setTimeout(() => tone(kind === 'stay' ? 392 : 523, kind === 'stay' ? 523 : 349, 0.18, 0.075, 'triangle'), 70)
  },
  outcome: (success: boolean) => {
    if (success) {
      tone(440, 554, 0.09, 0.07, 'triangle')
      window.setTimeout(() => tone(554, 740, 0.13, 0.075, 'triangle'), 90)
    } else {
      tone(210, 145, 0.22, 0.08, 'sawtooth')
    }
    navigator.vibrate?.(success ? [18, 35, 24] : [55])
  },
  archive: () => tone(330, 660, 0.16, 0.06, 'triangle'),
  start: () => tone(220, 440, 0.14, 0.06, 'sine'),
  isMuted: () => muted,
  setMuted: (value: boolean) => {
    muted = value
    localStorage.setItem('lost-time-bureau-muted', value ? '1' : '0')
    if (value) void context?.suspend()
  },
}
