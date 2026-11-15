import React, { useState } from 'react'
import { useGame } from '../state/GameContext.jsx'
import ActivityRunner from '../components/Activity.jsx'
import { ACTIVITIES, CATEGORIES, TIERS } from '../data/academy.js'
import { LEARNING_LEVELS } from '../data/learn.js'

const TYPE_LABEL = { mcq: 'Question', match: 'Drag & Drop', slider: 'Interactive' }
export default function Academy() {
  const { state, dispatch } = useGame()
  const [cat, setCat] = useState('space')
  const [open, setOpen] = useState(null)
  const act = ACTIVITIES.find((a) => a.id === open)
  const totalDone = Object.keys(state.academy.done).length
  const back = () => { setOpen(null); dispatch({ type: 'CLEAR_FEEDBACK' }) }
  if (act) return <div className="academy"><ActivityRunner key={act.id} act={act} onBack={back} /></div>
  const list = ACTIVITIES.filter((a) => a.cat === cat)
  const maxLevel = Math.min(state.level, 3)
  return (
    <div className="academy">
      <div className="card">
        <h2>🔬 Science Academy</h2>
        <p>Answer challenges to earn credits for your spacecraft! <b>{totalDone}/{ACTIVITIES.length}</b> completed. Harder challenges unlock as you finish construction levels and pay more.</p>
        <div className="learn-path" aria-label="Learning path">
          {LEARNING_LEVELS.map((l) => {
            const all = ACTIVITIES.filter((a) => a.tier === l.tier), dn = all.filter((a) => state.academy.done[a.id]).length
            const lock = TIERS[l.tier].unlockLevel > maxLevel
            return (
              <div key={l.tier} className={`lp ${lock ? 'locked' : 'now'}`}>
                <b>{lock ? '🔒' : l.emoji} Level {l.n} · {l.name}</b>
                <span className="verb">{l.verb}</span>
                <p>{l.blurb}</p>
                <small>{lock ? `Unlocks when you finish construction level ${TIERS[l.tier].unlockLevel - 1}` : `${dn}/${all.length} done`}</small>
              </div>
            )
          })}
        </div>
        <div className="cat-tabs">
          {CATEGORIES.map((c) => {
            const items = ACTIVITIES.filter((a) => a.cat === c.id)
            const dn = items.filter((a) => state.academy.done[a.id]).length
            return <button key={c.id} className={`cat ${cat === c.id ? 'sel' : ''}`} style={{ '--c': c.color }} onClick={() => setCat(c.id)}><span>{c.emoji}</span><b>{c.name}</b><small>{dn}/{items.length}</small></button>
          })}
        </div>
        <div className="act-grid">
          {list.map((a) => {
            const t = TIERS[a.tier]
            const locked = t.unlockLevel > maxLevel
            const done = state.academy.done[a.id]
            return (
              <button key={a.id} className={`act ${done ? 'done' : ''} ${locked ? 'locked' : ''}`} disabled={locked} onClick={() => setOpen(a.id)}>
                <span className="act-icon">{locked ? '🔒' : done ? '✅' : a.type === 'mcq' ? '❓' : a.type === 'match' ? '🧩' : '🎚️'}</span>
                <b>{TYPE_LABEL[a.type]}</b>
                <small>{t.label} · 💰 {t.reward}</small>
                <small>{locked ? `Unlocks at Level ${t.unlockLevel}` : done ? 'Completed – practise again' : 'Tap to play'}</small>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
