import React, { useState } from 'react'
import { useGame } from '../state/GameContext.jsx'
import Spacecraft from '../components/Spacecraft.jsx'
import { PartArt } from '../components/ui.jsx'
import { ITEMS, LEVELS, compsOfLevel, COMPONENTS } from '../data/catalog.js'
import { stepIndex, stepsOf } from '../state/game.js'

export default function Book() {
  const { state, dispatch } = useGame()
  const unlocked = (n) => n === 1 || state.levelsDone.includes(n - 1)
  const [n, setN] = useState(Math.min(state.level, 3))
  const lv = LEVELS[n - 1]
  const stepList = stepsOf(state, n)
  const idx = stepIndex(state, n)
  const done = state.levelsDone.includes(n)
  const target = COMPONENTS.filter((c) => c.level <= n).map((c) => c.id)
  return (
    <div className="book">
      <div className="book-tabs">
        {LEVELS.map((l) => <button key={l.n} disabled={!unlocked(l.n)} className={`btab ${n === l.n ? 'sel' : ''}`} onClick={() => setN(l.n)}>{unlocked(l.n) ? '📘' : '🔒'} Level {l.n}</button>)}
      </div>
      <div className={`book-header lvl${n}`}><span>📘 ASTRONAUT ENGINEERING HANDBOOK</span><b>VOLUME {n} · {lv.tag}</b></div>
      <div className={`card book-page lvl${n}`}>
        <div className="book-cover">
          <small>{lv.tag}</small>
          <h2>{lv.title}</h2>
          <p>{lv.intro}</p>
          <div className="cover-ship"><Spacecraft installed={target} expr="proud" color={state.shipColor} size={240} bob={false} /></div>
          <p className="tiny center">🎯 Your spacecraft at the end of Level {n}</p>
          <div className="book-progress"><i style={{ width: (idx / lv.steps.length) * 100 + '%' }} /></div>
          <div className="pill-row"><span className="pill">{lv.steps.length} steps</span><span className="pill">{idx}/{lv.steps.length} complete</span><span className="pill">Reward 💰 {lv.reward}</span></div>
        </div>
        <div className="book-steps">
          <h3>🧰 Construction guide</h3>
          {stepList.map((st, i) => {
            const it = ITEMS[st.target]
            const isDone = i < idx
            const isCur = i === idx && !done && n === state.level
            const reveal = n === 1 || isDone
            return (
              <div key={st.target} className={`bstep ${isDone ? 'done' : isCur ? 'cur' : ''}`}>
                <div className="bnum">{isDone ? '✔' : i + 1}</div>
                <PartArt id={st.target} size={58} mystery={!reveal} />
                <div className="bbody">
                  <small>STEP {i + 1}</small>
                  {n === 1 && <><b>{st.text}</b><p>{it.name}: {it.purpose}</p><p className="tiny">{it.desc}</p></>}
                  {n === 2 && <><p className="mission-text">{st.text}</p>{isDone && <p className="revealed">✅ You chose: <b>{it.name}</b> – {it.purpose}</p>}</>}
                  {n === 3 && <><p className="mission-text">{st.text}</p>{isDone && <p className="revealed">✅ Best choice: <b>{it.name}</b> – {it.desc}</p>}</>}
                </div>
                <div className="bstatus">
                  {isDone ? <span className="pill good">Installed</span> : isCur ? <button className="btn small primary" onClick={() => dispatch({ type: 'NAV', screen: 'workshop' })}>Open parts list →</button> : <span className="pill">{n > state.level || (n === state.level && i > idx) ? 'Later' : ''}</span>}
                </div>
              </div>
            )
          })}
          {done && n < 3 && <p className="notice good">🎉 Level {n} complete! Level {n + 1} book unlocked.</p>}
        </div>
      </div>
    </div>
  )
}
