import { useEffect, useMemo, useState } from 'react'
import { HoldVerdictButton } from './components/HoldVerdictButton'
import { LineIcon } from './components/LineIcon'
import { useLostTimeBureau } from './hooks/useLostTimeBureau'
import { detectLocale, makeTranslator, type Locale } from './i18n'
import { caseFiles } from './data/cases'
import type { EvidenceId, LocalizedText } from './types'
import { sounds } from './utils/sounds'
import './LostTimeBureau.less'

const iconByEvidence: Record<EvidenceId, 'object' | 'memory' | 'echo'> = {
  object: 'object',
  memory: 'memory',
  echo: 'echo',
}

function ResourceMeter({ label, value, tone }: { label: string; value: number; tone: 'stable' | 'human' }) {
  return (
    <div className={`ltb-meter ltb-meter--${tone}${value < 20 ? ' is-critical' : ''}`}>
      <div className="ltb-meter__head"><span>{label}</span><strong>{value}</strong></div>
      <div className="ltb-meter__track"><span style={{ width: `${value}%` }} /></div>
    </div>
  )
}

function CityScene() {
  return (
    <div className="ltb-city" aria-hidden="true">
      <div className="ltb-city__moon" />
      <div className="ltb-city__clock"><span /><i /></div>
      <div className="ltb-city__skyline ltb-city__skyline--back" />
      <div className="ltb-city__skyline ltb-city__skyline--front" />
      <div className="ltb-city__office">
        <span className="ltb-city__window ltb-city__window--1" />
        <span className="ltb-city__window ltb-city__window--2" />
        <span className="ltb-city__window ltb-city__window--lit" />
        <span className="ltb-city__window ltb-city__window--4" />
      </div>
      <div className="ltb-city__tramline" />
    </div>
  )
}

function VisitorPortrait({ file, name, split = false }: { file: string; name: string; split?: boolean }) {
  return (
    <div className={`ltb-portrait${split ? ' is-split' : ''}`} aria-label={name}>
      <div className="ltb-portrait__halo" />
      <div className="ltb-portrait__head">
        <span className="ltb-portrait__hair" />
        <span className="ltb-portrait__ear ltb-portrait__ear--left" />
        <span className="ltb-portrait__ear ltb-portrait__ear--right" />
        <span className="ltb-portrait__brow ltb-portrait__brow--left" />
        <span className="ltb-portrait__brow ltb-portrait__brow--right" />
        <span className="ltb-portrait__eye ltb-portrait__eye--left" />
        <span className="ltb-portrait__eye ltb-portrait__eye--right" />
        <span className="ltb-portrait__nose" />
        <span className="ltb-portrait__mouth" />
      </div>
      <div className="ltb-portrait__neck" />
      <div className="ltb-portrait__coat"><span className="ltb-portrait__collar" /><i /></div>
      <div className="ltb-portrait__badge">37</div>
      {split && <div className="ltb-portrait__split-line" />}
      <img
        className="ltb-portrait__image"
        src={`${import.meta.env.BASE_URL}portraits/${file}`}
        alt={name}
        draggable={false}
        onError={(event) => { event.currentTarget.style.display = 'none' }}
      />
    </div>
  )
}

export default function LostTimeBureau() {
  const [locale, setLocale] = useState<Locale>(() => detectLocale())
  const [muted, setMuted] = useState(() => sounds.isMuted())
  const [canArchive, setCanArchive] = useState(false)
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
    if (game.phase !== 'reveal') {
      setCanArchive(false)
      return
    }
    const timer = window.setTimeout(() => setCanArchive(true), 1400)
    return () => window.clearTimeout(timer)
  }, [game.phase, game.caseIndex])

  const beginShift = () => { sounds.start(); game.start() }
  const openEvidence = (id: EvidenceId) => { sounds.instrument(); game.openEvidence(id) }
  const closeEvidence = () => { sounds.drawerClose(); game.closeEvidence() }
  const submitVerdict = (choice: 'stay' | 'return') => { sounds.verdict(choice); game.submitVerdict(choice) }
  const archive = () => { sounds.archive(); game.archive() }
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

  return (
    <section className={`ltb ltb--${game.phase}`} lang={locale === 'zh' ? 'zh-CN' : 'en'}>
      <div className="ltb__grain" aria-hidden="true" />

      {game.phase === 'start' && (
        <div className="ltb-start">
          <CityScene />
          <header className="ltb-start__header">
            <span className="ltb-start__bureau">{t('bureau')}</span>
            <button className="ltb-lang" type="button" onClick={switchLocale} aria-label="Switch language">
              {locale === 'zh' ? 'EN' : '中'}
            </button>
          </header>
          <div className="ltb-start__titleplate">
            <span className="ltb-start__index">TEMPORAL RECORDS / 07</span>
            <h1>{t('title')}</h1>
            <p>{t('subtitle')}</p>
          </div>
          <div className="ltb-start__console">
            <div className="ltb-start__status"><i /><span>{t('date')}</span></div>
            <p>{game.bestScore > 0 ? (locale === 'zh' ? `历史最佳总评 ${game.bestScore} · 今夜有 7 份未归档身份` : `BEST TOTAL ${game.bestScore} · 7 identities await review`) : t('startHint')}</p>
            <button className="ltb-primary" type="button" onPointerDown={beginShift}>
              <LineIcon name="archive" />
              <span>{t('start')}</span>
            </button>
          </div>
        </div>
      )}

      {game.phase === 'case' && (
        <div className="ltb-case">
          <header className="ltb-hud">
            <div className="ltb-hud__bureau"><LineIcon name="archive" /><span>{locale === 'zh' ? `档案 ${String(game.caseIndex + 1).padStart(2, '0')} / ${String(game.totalCases).padStart(2, '0')} · 校准 ${game.calibrations}` : `FILE ${String(game.caseIndex + 1).padStart(2, '0')} / ${String(game.totalCases).padStart(2, '0')} · CAL ${game.calibrations}`}</span></div>
            <div className="ltb-hud__right">
              <button className="ltb-icon-button" type="button" onClick={game.pause} aria-label={locale === 'zh' ? '暂停' : 'Pause'}><LineIcon name="pause" /></button>
              <div className={`ltb-timer${game.seconds <= 5 ? ' is-low' : ''}`}>
                <LineIcon name="clock" /><span>{t('timer')}</span><strong>{game.seconds}</strong>
              </div>
            </div>
          </header>
          <div className="ltb-resources">
            <ResourceMeter label={t('stability')} value={game.stability} tone="stable" />
            <ResourceMeter label={t('humanity')} value={game.humanity} tone="human" />
          </div>

          {game.currentCase.echoFlag && game.flags.has(game.currentCase.echoFlag) && game.currentCase.echoText && (
            <div className="ltb-echo-note">{local(game.currentCase.echoText)}</div>
          )}

          <div className="ltb-window">
            <div className="ltb-window__glass" />
            <VisitorPortrait file={game.currentCase.portrait} name={local(game.currentCase.name)} />
            <div className="ltb-window__id">
              <strong>{local(game.currentCase.name)}</strong>
              <span>{local(game.currentCase.meta)}</span>
            </div>
          </div>

          <blockquote className="ltb-quote">{local(game.currentCase.quote)}</blockquote>

          <div className="ltb-instruments">
            {game.currentCase.evidence.map((item) => {
              const read = game.inspected.has(item.id)
              const locked = game.inspected.size >= 2 && !read && game.calibrations <= 0
              return (
                <button
                  className={`ltb-instrument${read ? ' is-read' : ''}${locked ? ' is-locked' : ''}`}
                  type="button"
                  key={item.id}
                  disabled={locked}
                  onClick={() => openEvidence(item.id)}
                >
                  <span className="ltb-instrument__dial"><LineIcon name={iconByEvidence[item.id]} /><i /></span>
                  <strong>{local(item.label)}</strong>
                  <small>{read ? t('inspected') : locked ? (locale === 'zh' ? '校准用尽' : 'NO CAL') : t('inspect')}</small>
                </button>
              )
            })}
          </div>

          <div className="ltb-rulings">
            <HoldVerdictButton verdict="stay" label={t('stay')} holdLabel={t('hold')} previewLabel={t('stayPreview')} onCommit={submitVerdict} />
            <HoldVerdictButton verdict="return" label={t('return')} holdLabel={t('hold')} previewLabel={t('returnPreview')} onCommit={submitVerdict} />
          </div>
        </div>
      )}

      {game.phase === 'case' && game.selected && (
        <div className="ltb-drawer-wrap" role="presentation" onClick={closeEvidence}>
          <article className="ltb-drawer" role="dialog" aria-modal="true" aria-labelledby="evidence-title" onClick={(event) => event.stopPropagation()}>
            <div className="ltb-drawer__handle" />
            <header>
              <div><span>{t('evidenceTitle')}</span><strong id="evidence-title">{local(game.selected.label)}</strong></div>
              <button type="button" onClick={closeEvidence} aria-label={t('close')}><LineIcon name="close" /></button>
            </header>
            <div className="ltb-drawer__reading">
              <span>ATOMIC CLOCK VERIFIED</span>
              <strong>{local(game.selected.value)}</strong>
            </div>
            <p>{local(game.selected.detail)}</p>
            <small>{t('evidenceSource')}</small>
            <button className="ltb-drawer__close" type="button" onClick={closeEvidence}>{t('close')}</button>
          </article>
        </div>
      )}

      {game.phase === 'reveal' && game.verdict && game.result && (
        <div className={`ltb-reveal ltb-reveal--${game.verdict}`}>
          <header className="ltb-reveal__header"><span>{t('consequence')}</span><strong>{local(game.result.title)}</strong></header>
          <div className="ltb-timeline">
            <div className="ltb-timeline__era ltb-timeline__era--past"><span>PAST LINE</span><strong>{local(game.result.timelinePast)}</strong></div>
            <VisitorPortrait file={game.currentCase.portrait} name={local(game.currentCase.name)} split />
            <div className="ltb-timeline__era ltb-timeline__era--future"><span>PRESENT LINE</span><strong>{local(game.result.timelineFuture)}</strong></div>
            <div className="ltb-timeline__rail"><i /><i /><i /></div>
          </div>
          <p className="ltb-reveal__summary">{local(game.result.summary)}</p>
          <div className="ltb-reveal__deltas">
            <span className={game.result.stabilityDelta > 0 ? 'is-positive' : 'is-negative'}>{t('stability')} {game.result.stabilityDelta > 0 ? '+' : ''}{game.result.stabilityDelta}</span>
            <span className={game.result.humanityDelta > 0 ? 'is-positive' : 'is-negative'}>{t('humanity')} {game.result.humanityDelta > 0 ? '+' : ''}{game.result.humanityDelta}</span>
          </div>
          <button className="ltb-primary ltb-reveal__archive" type="button" disabled={!canArchive} onClick={archive}><LineIcon name="archive" /><span>{canArchive ? t('archive') : (locale === 'zh' ? '时间线稳定中…' : 'TIMELINE SETTLING…')}</span></button>
        </div>
      )}

      {game.phase === 'result' && game.verdict && (
        <div className="ltb-result">
          <div className="ltb-result__seal"><span>PSB</span><i /></div>
          <span className="ltb-result__eyebrow">MIDNIGHT ARCHIVE / PROTOTYPE 01</span>
          <h2>{t('resultTitle')}</h2>
          <p>{t('resultSubtitle')}</p>
          <div className="ltb-result__version">{game.stability <= 0 ? (locale === 'zh' ? '结局：历史解体' : 'ENDING: HISTORY COLLAPSE') : game.humanity <= 0 ? (locale === 'zh' ? '结局：机构接管' : 'ENDING: BUREAU TAKEOVER') : game.stability - game.humanity > 24 ? (locale === 'zh' ? '城市版本：封闭线' : 'CITY VERSION: CLOSED LINE') : game.humanity - game.stability > 24 ? (locale === 'zh' ? '城市版本：漂移线' : 'CITY VERSION: DRIFT LINE') : (locale === 'zh' ? '城市版本：共存线' : 'CITY VERSION: COEXISTENCE LINE')}</div>
          <div className="ltb-result__meters">
            <ResourceMeter label={t('stability')} value={game.stability} tone="stable" />
            <ResourceMeter label={t('humanity')} value={game.humanity} tone="human" />
          </div>
          <small>{locale === 'zh' ? `已处理 ${game.history.length} / ${game.totalCases} 份档案 · 总评 ${game.totalScore}` : `${game.history.length} / ${game.totalCases} files processed · Total ${game.totalScore}`}</small>
          <button className="ltb-primary" type="button" onPointerDown={beginShift}><LineIcon name="archive" /><span>{t('retry')}</span></button>
        </div>
      )}

      {game.phase === 'case' && game.paused && (
        <div className="ltb-pause" role="dialog" aria-modal="true" aria-label={locale === 'zh' ? '暂停菜单' : 'Pause menu'}>
          <div className="ltb-pause__panel">
            <span>MIDNIGHT ARCHIVE</span>
            <h2>{locale === 'zh' ? '值班暂停' : 'SHIFT PAUSED'}</h2>
            <button className="ltb-primary" type="button" onClick={game.resume}>{locale === 'zh' ? '继续核验' : 'RESUME REVIEW'}</button>
            <button className="ltb-pause__secondary" type="button" onClick={toggleMuted}><LineIcon name="sound" />{muted ? (locale === 'zh' ? '开启声音' : 'SOUND ON') : (locale === 'zh' ? '关闭声音' : 'MUTE')}</button>
            <button className="ltb-pause__secondary" type="button" onClick={beginShift}>{locale === 'zh' ? '重新值班' : 'RESTART SHIFT'}</button>
          </div>
        </div>
      )}
    </section>
  )
}
