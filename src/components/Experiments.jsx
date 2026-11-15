import React, { useRef, useState } from 'react'
import { useGame } from '../state/GameContext.jsx'
import { Modal } from './ui.jsx'
import FloatArena from './FloatArena.jsx'
import { crewHas } from '../state/game.js'
import { GRAVITY_QUIZ, MICRO_FACT, RESCUE_ITEMS, SOLAR_FACT, PLANET_TOPICS, PLANET_QUIZ, RESEARCH, NAV_ACTIVITY, LIFE_TOPICS } from '../data/mission.js'

const Bonus = ({ children }) => <p className="notice">🎮 GAMEPLAY BONUS (fictional): {children}</p>
const XpNote = ({ id, state }) => (state.mission.activities[id] ? <p className="tiny">⭐ Science XP already earned for this experiment – repeating it earns no extra XP or credits.</p> : <p className="tiny">⭐ Complete it once to earn science XP (no credits).</p>)

/* ---------------- EXPERIMENT 1: MICROGRAVITY ---------------- */
export function MicroExperiment({ onClose }) {
  const { state, dispatch } = useGame()
  const physics = crewHas(state, 'physics')
  const done = !!state.mission.activities.gravity
  const [pushes, setPushes] = useState(0)
  const [picked, setPicked] = useState(null)
  const [quizOk, setQuizOk] = useState(false)
  const [tries, setTries] = useState(0)
  const [round, setRound] = useState(0)
  const [result, setResult] = useState(null) // { caught, lost }
  const caught = useRef(0), lost = useRef(0)
  const allowed = physics ? 3 : 2
  const wrongIdx = GRAVITY_QUIZ.options.findIndex((o) => !o.ok)
  const finishRound = () => {
    if (caught.current + lost.current < RESCUE_ITEMS.length) return
    const ok = lost.current <= allowed
    setResult({ caught: caught.current, lost: lost.current, ok })
    if (ok && quizOk) dispatch({ type: 'ACTIVITY', id: 'gravity', score: Math.min(100, (tries === 0 ? 100 : 60) + (physics ? 0 : 0)), xp: 50, log: 'Microgravity experiment completed.' })
  }
  const pick = (i) => { setPicked(i); if (GRAVITY_QUIZ.options[i].ok) setQuizOk(true); else setTries((t) => t + 1) }
  const retry = () => { caught.current = 0; lost.current = 0; setResult(null); setRound(round + 1) }
  return (
    <Modal wide onClose={onClose}>
      <h2>🧪 Experiment 1: Microgravity</h2>
      <XpNote id="gravity" state={state} />
      <h4>Step 1 · Observe</h4>
      <p>Tap an object to give it a push. Watch what it does after you let go. (Push at least 4 times.)</p>
      <FloatArena key={'p' + round} items={['🧸', '🔧', '🍎', '📘']} mode="push" onPush={setPushes} height={200} />
      {pushes >= 4 && (
        <div>
          <h4>{GRAVITY_QUIZ.q}</h4>
          {physics && <Bonus>your physics specialist rules out one wrong answer.</Bonus>}
          <div className="opts">{GRAVITY_QUIZ.options.map((o, i) => <button key={i} disabled={quizOk || (physics && i === wrongIdx)} className={`opt o${i} ${picked === i ? (o.ok ? 'right' : 'wrong shake') : ''}`} onClick={() => pick(i)}><span className="letter">{['▲', '●', '■'][i]}</span>{o.t}</button>)}</div>
          {picked !== null && !GRAVITY_QUIZ.options[picked].ok && <p className="feedback wrongfb">Not quite! Watch the objects again – do they stop on their own?</p>}
          {quizOk && <div className="feedback ok">✅ {GRAVITY_QUIZ.why}</div>}
        </div>
      )}
      {quizOk && (
        <div>
          <h4>Step 2 · Cabin rescue game</h4>
          <p>Oh no, objects are drifting towards the edge of the cabin! Tap them to collect them before they float away. You can lose up to <b>{allowed}</b>{physics ? ' (physics bonus!)' : ''}.</p>
          {!result && <FloatArena key={'r' + round} items={RESCUE_ITEMS} mode="rescue" onCatch={(n) => { caught.current = n; finishRound() }} onLost={(l) => { lost.current = l; finishRound() }} height={240} />}
          {result && (
            <div className={`feedback ${result.ok ? 'ok celebrate' : 'wrongfb'}`}>
              {result.ok ? `🎉 Collected ${result.caught} of ${RESCUE_ITEMS.length}! Great reflexes.` : `Only ${result.caught} collected this time – ${result.lost} floated away.`}
              <p>💡 {MICRO_FACT}</p>
              {!result.ok && <button className="btn primary small" onClick={retry}>Try again</button>}
            </div>
          )}
        </div>
      )}
      {done && <p className="notice good">✅ Experiment complete – science XP awarded.</p>}
      <div className="row"><button className="btn ghost" onClick={onClose}>{done ? 'Done' : 'Close'}</button></div>
    </Modal>
  )
}

/* ---------------- EXPERIMENT 2: SOLAR ENERGY ---------------- */
export function SolarExperiment({ onClose }) {
  const { state, dispatch } = useGame()
  const eng = crewHas(state, 'engineering')
  const [a, setA] = useState(20)
  const sun = 120
  const power = Math.max(0, Math.round(Math.cos(((a - sun) * Math.PI) / 180) * 100))
  const ok = power >= 95
  const m = state.mission
  const left = 3 - (m.solarCharges || 0)
  const charge = () => {
    dispatch({ type: 'SOLAR_CHARGE' })
    dispatch({ type: 'ACTIVITY', id: 'solar', score: 100, xp: 50, log: 'Solar energy experiment completed.' })
  }
  return (
    <Modal wide onClose={onClose}>
      <h2>☀️ Experiment 2: Solar energy</h2>
      <XpNote id="solar" state={state} />
      <p>Turn the solar panel so it faces the Sun (light is coming from the upper right), then charge the batteries.</p>
      {eng && <Bonus>your engineering specialist marks the best angle on the dial.</Bonus>}
      <div className="gadget">
        <svg viewBox="0 0 300 160" className="gsvg">
          <g transform="rotate(-30 150 130)"><circle cx="150" cy="22" r="14" fill="#ffd166" /><path d="M150 40v40" stroke="#ffd166" strokeDasharray="4 5" strokeWidth="3" /></g>
          <g transform={`rotate(${a - 90} 150 120)`}><rect x="110" y="114" width="80" height="12" rx="4" fill="#2d5bff" stroke="#9db8ff" strokeWidth="2" /></g>
          <rect x="140" y="124" width="20" height="26" fill="#9aa0b8" rx="4" />
        </svg>
        <div className="meter"><div className="meter-fill" style={{ width: power + '%', background: ok ? 'var(--green)' : 'var(--yellow)' }} /><span>⚡ Electrical energy collected: {power}%</span></div>
      </div>
      <input className="slider" type="range" min="0" max="180" value={a} onChange={(e) => setA(+e.target.value)} aria-label="panel angle" />
      {eng && <p className="tiny center">🎯 Best angle: about {sun}°</p>}
      <div className="row center"><button className="btn primary" disabled={!ok || left <= 0} onClick={charge}>⚡ Charge batteries (+15 energy) · {left} charge{left === 1 ? '' : 's'} left</button></div>
      <p className="tip">{SOLAR_FACT}</p>
      {state.feedback && <p className="feedback wrongfb">{state.feedback.text}</p>}
      <div className="row"><button className="btn ghost" onClick={onClose}>{m.activities.solar ? 'Done' : 'Close'}</button></div>
    </Modal>
  )
}

/* ---------------- EXPERIMENT 3: PLANETARY OBSERVATION ---------------- */
export function PlanetExperiment({ onClose }) {
  const { state, dispatch } = useGame()
  const research = crewHas(state, 'research')
  const [seen, setSeen] = useState([])
  const [open, setOpen] = useState(null)
  const [picked, setPicked] = useState(null)
  const [done, setDone] = useState(!!state.mission.activities.planet)
  const wrong = PLANET_QUIZ.options.findIndex((o) => !o.ok)
  const look = (t) => { setOpen(t); setSeen((s) => (s.includes(t.id) ? s : [...s, t.id])) }
  const answer = (i) => { setPicked(i); if (PLANET_QUIZ.options[i].ok) { setDone(true); dispatch({ type: 'ACTIVITY', id: 'planet', score: 100, xp: 50, log: 'Planetary observation of Mars completed.' }) } }
  const prog = Math.min(100, state.mission.progress)
  return (
    <Modal wide onClose={onClose}>
      <h2>🔭 Experiment 3: Observing Mars</h2>
      <XpNote id="planet" state={state} />
      <p>Mars is still far away, but our telescope can already see it. Tap each circle to learn about the planet.</p>
      <div className="telescope">
        <div className="scope-mars" style={{ width: 100 + prog * 0.8, height: 100 + prog * 0.8 }} />
        {PLANET_TOPICS.map((t, i) => <button key={t.id} className={`scope-dot ${seen.includes(t.id) ? 'seen' : ''}`} style={{ '--a': i * 90 + 45 }} onClick={() => look(t)} aria-label={t.name}>{t.emoji}</button>)}
      </div>
      {open && <div className="feedback ok"><b>{open.emoji} {open.name}:</b> {open.fact}</div>}
      <p className="tiny">Observed: {seen.length}/{PLANET_TOPICS.length}</p>
      {seen.length === PLANET_TOPICS.length && !done && (
        <div>
          <h4>{PLANET_QUIZ.q}</h4>
          {research && <Bonus>your research specialist rules out one wrong answer.</Bonus>}
          <div className="opts">{PLANET_QUIZ.options.map((o, i) => <button key={i} disabled={research && i === wrong} className={`opt o${i} ${picked === i ? (o.ok ? 'right' : 'wrong shake') : ''}`} onClick={() => answer(i)}><span className="letter">{['▲', '●', '■'][i]}</span>{o.t}</button>)}</div>
          {picked !== null && !PLANET_QUIZ.options[picked].ok && <p className="feedback wrongfb">Think about what you just read – try again!</p>}
        </div>
      )}
      {done && <div className="feedback ok">✅ {PLANET_QUIZ.why}</div>}
      <div className="row"><button className="btn ghost" onClick={onClose}>{done ? 'Done' : 'Close'}</button></div>
    </Modal>
  )
}

/* ---------------- Optional extra experiments (kept from the first version) ---------------- */
export function PlantLab({ onClose }) {
  const { state, dispatch } = useGame()
  const bonus = crewHas(state, 'biology')
  const [data, setData] = useState([])
  const [picked, setPicked] = useState(null)
  const done = !!state.mission.activities.research
  const run = (lvl) => { if (!data.find((d) => d.id === lvl.id)) setData([...data, { ...lvl, mm: bonus ? Math.round(lvl.mm * 1.2) : lvl.mm }]) }
  const best = data.length ? [...data].sort((a, b) => b.mm - a.mm)[0] : null
  const answer = (l) => { setPicked(l.id); if (l.id === best.id) dispatch({ type: 'ACTIVITY', id: 'research', score: 100, xp: 30, data: data.map((d) => `${d.label}: ${d.mm} mm`), log: 'Plant growth experiment completed.' }) }
  return (
    <Modal wide onClose={onClose}>
      <h2>🌱 Bonus experiment: {RESEARCH.title}</h2>
      <p>{RESEARCH.intro}</p>
      {bonus && <Bonus>your biology specialist improves experiment results by +20%!</Bonus>}
      <div className="chips">{RESEARCH.levels.map((l) => <button key={l.id} className="chip big" disabled={done || data.some((d) => d.id === l.id)} onClick={() => run(l)}>{l.label}</button>)}</div>
      <table className="datatable"><thead><tr><th>Setting</th><th>Growth after 3 days</th><th>Notes</th></tr></thead>
        <tbody>{data.length === 0 ? <tr><td colSpan="3">Run a test to collect data…</td></tr> : data.map((d) => <tr key={d.id}><td>{d.label}</td><td>{'🌱'.repeat(Math.max(1, Math.round(d.mm / 3)))} {d.mm} mm</td><td>{d.note}</td></tr>)}</tbody></table>
      {data.length === 3 && !done && (
        <div><h4>{RESEARCH.question}</h4><div className="chips">{RESEARCH.levels.map((l) => <button key={l.id} className={`chip big ${picked === l.id ? (l.id === best.id ? 'sel' : 'badc') : ''}`} onClick={() => answer(l)}>{l.label}</button>)}</div>
          {picked && picked !== best.id && <p className="feedback wrongfb">Look at the numbers again – which one is biggest?</p>}</div>
      )}
      {done && <div className="feedback ok">✅ Data collected! Too little light slows growth, but too much can stress plants. Medium light was best.</div>}
      <div className="row"><button className="btn ghost" onClick={onClose}>{done ? 'Done' : 'Close'}</button></div>
    </Modal>
  )
}

export function NavConsole({ onClose }) {
  const { state, dispatch } = useGame()
  const [picked, setPicked] = useState(null)
  const [tries, setTries] = useState(0)
  const done = !!state.mission.activities.nav
  const helper = crewHas(state, 'navigation')
  const wrongIdx = NAV_ACTIVITY.options.findIndex((o) => !o.ok)
  const pick = (i) => { setPicked(i); if (NAV_ACTIVITY.options[i].ok) dispatch({ type: 'ACTIVITY', id: 'nav', score: tries === 0 ? 100 : 60, xp: 30, log: 'Navigation planning completed.' }); else setTries(tries + 1) }
  return (
    <Modal wide onClose={onClose}>
      <h2>🧭 Navigation planning</h2>
      <svg viewBox="0 0 400 140" className="gsvg"><circle cx="200" cy="70" r="14" fill="#ffd166" /><ellipse cx="200" cy="70" rx="90" ry="45" fill="none" stroke="#4b5aa8" strokeDasharray="4 4" /><ellipse cx="200" cy="70" rx="160" ry="62" fill="none" stroke="#4b5aa8" strokeDasharray="4 4" />
        <circle cx="110" cy="70" r="8" fill="#35d0ff" /><text x="110" y="95" fontSize="11" textAnchor="middle" fill="#cfd6ff">Earth</text>
        <circle cx="330" cy="86" r="8" fill="#ff6b3d" /><text x="330" y="110" fontSize="11" textAnchor="middle" fill="#cfd6ff">Mars (moving →)</text></svg>
      <h4>{NAV_ACTIVITY.q}</h4>
      {helper && <Bonus>your navigator rules out one wrong option.</Bonus>}
      <div className="opts">{NAV_ACTIVITY.options.map((o, i) => <button key={i} disabled={done || (helper && i === wrongIdx)} className={`opt o${i} ${picked === i ? (o.ok ? 'right' : 'wrong shake') : ''}`} onClick={() => pick(i)}><span className="letter">{['▲', '●', '■', '◆'][i]}</span>{o.t}</button>)}</div>
      {picked !== null && <div className={`feedback ${NAV_ACTIVITY.options[picked].ok ? 'ok' : 'wrongfb'}`}>{NAV_ACTIVITY.options[picked].why}</div>}
      <div className="row"><button className="btn ghost" onClick={onClose}>{done ? 'Done' : 'Close'}</button></div>
    </Modal>
  )
}

/* ---------------- Life in space: short interactive topics ---------------- */
export function LifeInSpace({ onClose }) {
  const { state, dispatch } = useGame()
  const [open, setOpen] = useState(null)
  const [picked, setPicked] = useState(null)
  const doneMap = state.mission.lifeDone || {}
  const t = LIFE_TOPICS.find((x) => x.id === open)
  const count = LIFE_TOPICS.filter((x) => doneMap[x.id]).length
  return (
    <Modal wide onClose={onClose}>
      <h2>🗄️ Life in space · equipment storage</h2>
      <p>Open a locker to learn how astronauts live in microgravity. ({count}/{LIFE_TOPICS.length} explored)</p>
      {!t && (
        <div className="locker-grid">{LIFE_TOPICS.map((x) => <button key={x.id} className={`locker ${doneMap[x.id] ? 'done' : ''}`} onClick={() => { setOpen(x.id); setPicked(null) }}><span>{doneMap[x.id] ? '✅' : x.emoji}</span><b>{x.title}</b></button>)}</div>
      )}
      {t && (
        <div>
          <h3>{t.emoji} {t.title}</h3>
          <h4>{t.q}</h4>
          <div className="opts">{t.options.map((o, i) => <button key={i} disabled={picked === t.answer} className={`opt o${i} ${picked === i ? (i === t.answer ? 'right' : 'wrong shake') : ''}`} onClick={() => { setPicked(i); if (i === t.answer) dispatch({ type: 'LIFE_TOPIC', id: t.id }) }}><span className="letter">{['▲', '●', '■'][i]}</span>{o}</button>)}</div>
          {picked !== null && picked !== t.answer && <p className="feedback wrongfb">Not quite – think about what happens when nothing pulls things down.</p>}
          {picked === t.answer && <div className="feedback ok">✅ {t.fact}<button className="btn small primary" onClick={() => setOpen(null)}>Back to lockers</button></div>}
        </div>
      )}
      <p className="tip">Everything floats in an orbiting spacecraft because it and the crew are continuously falling around Earth together.</p>
      <div className="row"><button className="btn ghost" onClick={onClose}>Close</button></div>
    </Modal>
  )
}
