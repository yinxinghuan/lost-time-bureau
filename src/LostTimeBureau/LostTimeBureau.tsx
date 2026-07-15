import { useEffect, useMemo, useRef, useState } from 'react'
import { LineIcon } from './components/LineIcon'
import { useLostTimeBureau } from './hooks/useLostTimeBureau'
import { detectLocale, makeTranslator, type Locale } from './i18n'
import { caseFiles } from './data/cases'
import type { EvidenceId, LocalizedText } from './types'
import { sounds } from './utils/sounds'
import './LostTimeBureau.less'

const cluePositions: Record<EvidenceId, { left: string; top: string }> = {
  object: { left: '22%', top: '66%' },
  memory: { left: '73%', top: '34%' },
  echo: { left: '72%', top: '72%' },
}

const clueTitles = {
  zh: { object: '随身物品', memory: '他说的过去', echo: '会发生什么' },
  en: { object: 'WHAT THEY CARRY', memory: 'THEIR PAST', echo: 'WHAT MAY HAPPEN' },
} as const

function PortraitImage({ file, name }: { file: string; name: string }) {
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const src = `${import.meta.env.BASE_URL}portraits/${file}`

  useEffect(() => {
    setReady(false)
    setFailed(false)
    const timer = window.setTimeout(() => setReady(true), 1200)
    return () => window.clearTimeout(timer)
  }, [src])

  return (
    <div className={`ltb-person${ready ? ' is-ready' : ''}${failed ? ' is-fallback' : ''}`}>
      <div className="ltb-person__fallback" aria-hidden="true"><span>{name.slice(0, 1)}</span></div>
      {!failed && (
        <img
          src={src}
          alt={name}
          draggable={false}
          onLoad={() => setReady(true)}
          onError={() => { setFailed(true); setReady(true) }}
        />
      )}
      {!ready && <div className="ltb-person__curtain"><span /></div>}
    </div>
  )
}

export default function LostTimeBureau() {
  const [locale, setLocale] = useState<Locale>(() => detectLocale())
  const [muted, setMuted] = useState(() => sounds.isMuted())
  const [showReport, setShowReport] = useState(false)
  const playedOutcomeRef = useRef('')
  const t = useMemo(() => makeTranslator(locale), [locale])
  const game = useLostTimeBureau()
  const local = (value: LocalizedText) => value[locale]

  useEffect(() => {
    ;[caseFiles[game.caseIndex], caseFiles[game.caseIndex + 1]].filter(Boolean).forEach((file) => {
      const image = new Image()
      image.src = `${import.meta.env.BASE_URL}portraits/${file.portrait}`
    })
  }, [game.caseIndex])

  useEffect(() => {
    setShowReport(false)
    if (game.phase !== 'reveal') return
    const key = `${game.caseIndex}-${game.verdict}`
    if (playedOutcomeRef.current === key) return
    playedOutcomeRef.current = key
    sounds.outcome(game.lastSuccess)
  }, [game.caseIndex, game.lastSuccess, game.phase, game.verdict])

  const beginShift = () => { sounds.start(); game.start() }
  const openEvidence = (id: EvidenceId) => { sounds.instrument(); game.openEvidence(id) }
  const closeEvidence = () => { sounds.drawerClose(); game.closeEvidence() }
  const submitVerdict = (choice: 'stay' | 'return') => { sounds.verdict(choice); game.submitVerdict(choice) }
  const nextVisitor = () => { sounds.archive(); game.archive() }

  const toggleMuted = () => {
    const next = !muted
    sounds.setMuted(next)
    setMuted(next)
  }

  const switchLocale = () => {
    const next = locale === 'zh' ? 'en' : 'zh'
    localStorage.setItem('game_locale', next)
    setLocale(next)
  }

  const reason = game.protocolDecision
    ? local(game.protocolDecision.reason).replace(/^关键证据：/, '').replace(/^Key evidence:\s*/i, '')
    : ''
  const selectedIndex = game.selected ? game.currentCase.evidence.findIndex((item) => item.id === game.selected!.id) : -1
  const ending = game.stability <= 0
    ? t('ending.history')
    : game.humanity <= 0
      ? t('ending.people')
      : Math.abs(game.stability - game.humanity) <= 18
        ? t('ending.balance')
        : game.stability > game.humanity ? t('ending.order') : t('ending.mercy')

  return (
    <main className={`ltb ltb--${game.phase}${locale === 'en' ? ' ltb--en' : ''}`} lang={locale === 'zh' ? 'zh-CN' : 'en'}>
      {game.phase === 'start' && (
        <section className="ltb-start">
          <div className="ltb-start__hero">
            <img src={`${import.meta.env.BASE_URL}poster.png`} alt={t('start.posterAlt')} draggable={false} />
            <div className="ltb-start__shade" />
            <button className="ltb-lang" type="button" onClick={switchLocale} aria-label={t('language')}>{locale === 'zh' ? 'EN' : '中'}</button>
          </div>
          <div className="ltb-start__panel">
            <span>{t('start.eyebrow')}</span>
            <h1>{t('title')}</h1>
            <p>{t('start.simpleCopy')}</p>
            <button className="ltb-primary" type="button" onPointerDown={beginShift}>{t('start.simpleButton')}</button>
            {game.bestScore > 0 && <small>{t('best')} {game.bestScore}</small>}
          </div>
        </section>
      )}

      {game.phase === 'case' && (
        <section className="ltb-play">
          <header className="ltb-hud">
            <strong>{String(game.caseIndex + 1).padStart(2, '0')} <span>/ {String(game.totalCases).padStart(2, '0')}</span></strong>
            <div className={`ltb-time${game.seconds <= 5 ? ' is-low' : ''}`}><LineIcon name="clock" /><b>{game.seconds}</b></div>
            <button className="ltb-icon-button" type="button" onClick={game.pause} aria-label={t('pause')}><LineIcon name="pause" /></button>
          </header>

          <div className="ltb-stage">
            <PortraitImage key={game.currentCase.id} file={game.currentCase.portrait} name={local(game.currentCase.name)} />
            <div className="ltb-stage__name"><strong>{local(game.currentCase.name)}</strong></div>
            {game.currentCase.evidence.map((item, index) => (
              <button
                className={`ltb-clue${game.inspected.has(item.id) ? ' is-seen' : ''}`}
                type="button"
                key={item.id}
                style={cluePositions[item.id]}
                onClick={() => openEvidence(item.id)}
                aria-label={`${t('clue')} ${index + 1}`}
              >
                <LineIcon name={game.inspected.has(item.id) ? 'check' : 'search'} />
                <span>{index + 1}</span>
              </button>
            ))}
          </div>

          <blockquote className="ltb-dialogue">{local(game.currentCase.quote)}</blockquote>

          <div className="ltb-actions">
            <p>{t('clueProgress').replace('{n}', String(game.inspected.size))}</p>
            <div>
              <button className="ltb-choice ltb-choice--stay" type="button" onPointerDown={() => submitVerdict('stay')}>{t('staySimple')}</button>
              <button className="ltb-choice ltb-choice--return" type="button" onPointerDown={() => submitVerdict('return')}>{t('returnSimple')}</button>
            </div>
          </div>
        </section>
      )}

      {game.phase === 'case' && game.selected && (
        <div className="ltb-sheet-wrap" role="presentation" onClick={closeEvidence}>
          <article className="ltb-sheet" role="dialog" aria-modal="true" aria-labelledby="clue-title" onClick={(event) => event.stopPropagation()}>
            <div className="ltb-sheet__top">
              <span>{t('clue')} {selectedIndex + 1} / 3</span>
              <button type="button" onClick={closeEvidence} aria-label={t('close')}><LineIcon name="close" /></button>
            </div>
            <h2 id="clue-title">{clueTitles[locale][game.selected.id]}</h2>
            <strong className="ltb-sheet__value">{local(game.selected.value)}</strong>
            <p>{local(game.selected.detail)}</p>
            <small><LineIcon name="pause" /> {t('timePaused')}</small>
            <button className="ltb-sheet__done" type="button" onClick={closeEvidence}>{t('clueDone')}</button>
          </article>
        </div>
      )}

      {game.phase === 'reveal' && game.verdict && game.result && (
        <section className={`ltb-reveal ${game.lastSuccess ? 'is-right' : 'is-wrong'}${showReport ? ' is-report' : ''}`}>
          <div className="ltb-reveal__scene">
            <PortraitImage file={game.currentCase.portrait} name={local(game.currentCase.name)} />
            <div className="ltb-reveal__choice">{t('youChose')} {game.verdict === 'stay' ? t('staySimple') : t('returnSimple')}</div>
            <div className="ltb-stamp"><LineIcon name={game.lastSuccess ? 'check' : 'cross'} /><strong>{game.lastSuccess ? t('right') : t('wrong')}</strong></div>
          </div>

          {!showReport ? (
            <div className="ltb-reveal__bar">
              <p>{game.lastSuccess ? t('rightHint') : t('wrongHint')}</p>
              <button type="button" onClick={() => setShowReport(true)}>{t('why')}</button>
            </div>
          ) : (
            <article className="ltb-report">
              <div><span>{t('whyTitle')}</span><p>{reason}</p></div>
              <div><span>{t('laterTitle')}</span><p>{local(game.result.summary)}</p></div>
              <button type="button" onClick={nextVisitor}>{game.caseIndex + 1 >= game.totalCases ? t('seeResult') : t('next')}</button>
            </article>
          )}
        </section>
      )}

      {game.phase === 'result' && (
        <section className="ltb-result">
          <span>{t('daybreak')}</span>
          <h2>{game.correctCount}<small> / {game.totalCases}</small></h2>
          <strong>{t('rightCount')}</strong>
          <p>{ending}</p>
          <div className="ltb-result__scores"><span>{t('score')} <b>{game.totalScore}</b></span><span>{t('best')} <b>{Math.max(game.bestScore, game.totalScore)}</b></span></div>
          <button className="ltb-primary" type="button" onPointerDown={beginShift}>{t('again')}</button>
        </section>
      )}

      {game.phase === 'case' && game.paused && (
        <div className="ltb-pause" role="dialog" aria-modal="true" aria-label={t('pause')}>
          <div className="ltb-pause__panel">
            <h2>{t('paused')}</h2>
            <button className="ltb-primary" type="button" onClick={game.resume}>{t('continue')}</button>
            <button type="button" onClick={toggleMuted}><LineIcon name="sound" />{muted ? t('soundOn') : t('soundOff')}</button>
            <button type="button" onClick={beginShift}>{t('restart')}</button>
          </div>
        </div>
      )}
    </main>
  )
}
