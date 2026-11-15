import React, { useState } from 'react'
import { useGame } from '../state/GameContext.jsx'
import { Choice } from '../components/Activity.jsx'
import FloatArena from '../components/FloatArena.jsx'
import Astronaut from '../components/Astronaut.jsx'
import { Confetti } from '../components/ui.jsx'
import { TRAINING, TRAINING_MODULES, TRAINING_HINTS, MICRO_QUIZ, XP_PER_MODULE, CERT_XP, CREW_BY_ID, SPECS } from '../data/crew.js'
import { rankOf, certified } from '../state/game.js'

const PRAISE = ['Great flying, Commander!', 'Nice work – you are thinking like a real astronaut!', 'Mission Control is impressed!', 'Excellent! Another module complete.']

// Round-by-round quiz used by Operations, Emergency and Science training
function Quiz({ id, onDone }) {
  const data = TRAINING_MODULES[id]
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState(null)
  const [ok, setOk] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const r = data.rounds[i]
  const pick = (k) => { setPicked(k); const good = k === r.answer; setOk(good); if (!good) setMistakes((m) => m + 1) }
  const next = () => { if (i + 1 >= data.rounds.length) onDone(mistakes); else { setI(i + 1); setPicked(null); setOk(false) } }
  return (
    <div>
      <p className="notice">{data.intro}</p>
      <div className="step-progress"><i style={{ width: ((i + (ok ? 1 : 0)) / data.rounds.length) * 100 + '%' }} /></div>
      <p className="tiny">Step {i + 1} of {data.rounds.length}</p>
      {r.gauge && (
        <div className="gauges">{r.gauge.map(([n, v]) => <div key={n} className={`g ${v < 20 ? 'danger' : ''}`}><small>{n}</small><div className="bar"><i style={{ width: v + '%', background: v < 20 ? 'var(--red)' : 'var(--cyan)' }} /></div><b>{v}%</b></div>)}</div>
      )}
      <Choice key={i} q={r.q} options={r.options} onPick={pick} picked={picked} correct={ok} disabledSet={ok ? r.options.map((_, x) => x) : []} />
      {picked !== null && !ok && <p className="feedback wrongfb">Not quite – “{r.options[picked]}” is not it. Every astronaut learns by trying again!<br />🧭 <b>Coach clue:</b> {(TRAINING_HINTS[id] || [])[i] || 'Read the question again and think about what keeps the crew safe.'}</p>}
      {ok && <div className="feedback ok celebrate">✅ {r.why}<div className="row"><button className="btn primary small" onClick={next}>{i + 1 >= data.rounds.length ? 'Finish training' : 'Next step →'}</button></div></div>}
    </div>
  )
}

function Micro({ onDone }) {
  const [pushes, setPushes] = useState(0)
  const [picked, setPicked] = useState(null)
  const [ok, setOk] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const pick = (i) => { setPicked(i); const good = MICRO_QUIZ.options[i].ok; setOk(good); if (!good) setMistakes((m) => m + 1) }
  return (
    <div>
      <p className="notice">Inside an orbiting spacecraft everything floats! Tap the objects to push them and watch what they do. (Push at least 4 times.)</p>
      <div className="step-progress"><i style={{ width: (ok ? 100 : pushes >= 4 ? 66 : (pushes / 4) * 50) + '%' }} /></div>
      <FloatArena items={['🧸', '🔧', '🍎', '📘', '🖊️']} mode="push" onPush={setPushes} height={240} />
      {pushes >= 4 && (
        <div>
          <h4>{MICRO_QUIZ.q}</h4>
          <div className="opts">{MICRO_QUIZ.options.map((o, i) => <button key={i} disabled={ok} className={`opt o${i} ${picked === i ? (o.ok ? 'right' : 'wrong shake') : ''}`} onClick={() => pick(i)}><span className="letter">{['▲', '●', '■'][i]}</span>{o.t}</button>)}</div>
          {picked !== null && <div className={`feedback ${ok ? 'ok celebrate' : 'wrongfb'}`}>{MICRO_QUIZ.options[picked].why}{ok && <button className="btn primary small" onClick={() => onDone(mistakes)}>Finish training</button>}</div>}
        </div>
      )}
    </div>
  )
}

export default function Training() {
  const { state, dispatch } = useGame()
  const [open, setOpen] = useState(null)
  const [done, setDone] = useState(null) // { id, xp, praise }
  const locked = !state.crewLocked
  const unlocked = (idx) => !locked && TRAINING.slice(0, idx).every((t) => state.training[t.id])
  const cur = TRAINING.find((t) => t.id === open)
  const certd = certified(state)
  const rank = rankOf(state.xp)
  const finish = (id, mistakes) => {
    if (state.training[id]) { setOpen(null); return } // practice run: no extra XP
    const xp = XP_PER_MODULE + (mistakes === 0 ? 25 : 0)
    dispatch({ type: 'TRAIN_DONE', id, mistakes })
    setDone({ id, xp, praise: PRAISE[TRAINING.findIndex((t) => t.id === id) % PRAISE.length] })
    setOpen(null)
  }
  const count = TRAINING.filter((t) => state.training[t.id]).length
  return (
    <div className="training">
      <div className="card academy-head">
        <div className="recruit-head"><span>🎓 ASTRONAUT TRAINING ACADEMY</span><small>{count}/{TRAINING.length} MODULES · {state.xp} XP</small></div>
        <div className="row between wrap">
          <div><h2>Commander {state.profile.name}</h2><p className="rank">Rank: <b>{rank}</b></p></div>
          <Astronaut avatar={state.profile.avatar} color={state.profile.color} size={80} wave float />
        </div>
        <div className="xp-bar"><i style={{ width: Math.min(100, (state.xp / CERT_XP) * 100) + '%' }} /><span>{state.xp} / {CERT_XP} XP to become a Certified Mission Commander</span></div>
        {locked && <p className="notice warn">🔒 Recruit and confirm your crew first. <button className="btn small primary" onClick={() => dispatch({ type: 'NAV', screen: 'crew' })}>Recruitment centre</button></p>}
        {!locked && state.crew.length > 0 && <div className="crew-chips">Your crew: {state.crew.map((id) => CREW_BY_ID[id]).filter(Boolean).map((a) => <span key={a.id} className="spec-chip" style={{ '--c': SPECS[a.skill].color }}>{SPECS[a.skill].emoji} {a.name}</span>)}</div>}
      </div>

      {certd && (
        <div className="card cert-badge"><Confetti once />
          <div className="cert-medal">🎖️</div>
          <div><small>TRAINING RECORD COMPLETE</small><h2>CERTIFIED MISSION COMMANDER</h2><p>{state.profile.name} has completed all four training modules and is cleared for launch!</p>
            <button className="btn primary" onClick={() => dispatch({ type: 'NAV', screen: 'mission' })}>Go to Mission Control →</button></div>
        </div>
      )}

      {done && !cur && (
        <div className="feedback ok celebrate xp-pop">🌟 <b>{done.praise}</b> +{done.xp} XP{done.xp > XP_PER_MODULE ? ' (flawless bonus!)' : ''}
          {!certd && TRAINING[TRAINING.findIndex((t) => t.id === done.id) + 1] && <> · Next unlocked: <b>{TRAINING[TRAINING.findIndex((t) => t.id === done.id) + 1].name}</b></>}</div>
      )}

      {!cur && (
        <div className="train-grid">
          {TRAINING.map((t, idx) => {
            const isDone = !!state.training[t.id]
            const open_ = unlocked(idx)
            const rec = state.trainingRecord?.[t.id]
            return (
              <button key={t.id} className={`tile train-tile ${isDone ? 'done' : ''} ${!open_ && !isDone ? 'lockedtile' : ''}`} style={{ '--c': ['#35d0ff', '#8b5cf6', '#ff5c7a', '#35e08f'][idx] }} disabled={!open_ && !isDone} onClick={() => { setDone(null); setOpen(t.id) }}>
                <span className="tile-e"><i>{isDone ? '✅' : open_ ? t.emoji : '🔒'}</i></span>
                <b>{idx + 1}. {t.name}</b><small>{t.blurb}</small>
                <div className="step-progress mini"><i style={{ width: isDone ? '100%' : '0%' }} /></div>
                <small>{isDone ? `Completed · +${rec?.xp ?? XP_PER_MODULE} XP (tap to practise)` : open_ ? 'Ready – tap to start' : 'Locked – finish the previous module'}</small>
              </button>
            )
          })}
        </div>
      )}

      {cur && (
        <div className="card">
          <button className="btn ghost small" onClick={() => setOpen(null)}>← All training modules</button>
          <h3>{cur.emoji} {cur.name}</h3>
          {state.training[cur.id] && <p className="notice good">Already completed – practising again earns no extra XP.</p>}
          {cur.id === 'micro' ? <Micro onDone={(m) => finish(cur.id, m)} /> : <Quiz key={cur.id} id={cur.id} onDone={(m) => finish(cur.id, m)} />}
        </div>
      )}

      {count > 0 && !cur && (
        <div className="card">
          <h4>📒 Training record</h4>
          <table className="datatable"><tbody>
            {TRAINING.map((t) => <tr key={t.id}><td>{t.emoji} {t.name}</td><td>{state.training[t.id] ? `✅ ${state.trainingRecord?.[t.id]?.xp ?? XP_PER_MODULE} XP · ${(state.trainingRecord?.[t.id]?.mistakes ?? 0)} mistakes` : '⏳ not yet'}</td></tr>)}
          </tbody></table>
        </div>
      )}
    </div>
  )
}
