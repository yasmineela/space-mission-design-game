import React, { useState } from 'react'
import { useGame } from '../state/GameContext.jsx'
import { constructionStages, constructionPct, missionStages, missionPct } from '../state/game.js'

const level = (v) => (v < 25 ? 'bad' : v < 50 ? 'warn' : 'good')

// Persistent mission dashboard: five SEPARATE resources + health + communication + progress
export function MissionHUD() {
  const { state } = useGame()
  const [open, setOpen] = useState(() => typeof window === 'undefined' || window.innerWidth > 720) // starts collapsed on phones
  const m = state.mission
  const p = state.pet
  const stages = missionStages(state)
  const cur = stages.find((x) => x.state === 'current')
  const unread = (m.messages || []).filter((x) => !x.read).length
  const gauges = [
    ['⛽', 'Fuel', p.fuel, 'Propellant for the engine'],
    ['🔋', 'Energy', p.energy, 'Electricity for instruments'],
    ['🫁', 'Oxygen', m.oxygen, 'Breathable air in the cabin'],
    ['💧', 'Water', m.water ?? 100, 'Drinking and washing water'],
    ['❤️', 'Health', p.health, 'Condition of the spacecraft'],
  ]
  return (
    <div className="hud" aria-label="Mission dashboard">
      <div className="hud-top">
        <b>🛰️ {cur ? cur.label : 'Mission complete'}</b>
        <span className="hud-prog">🌍 <span className="hud-bar"><i style={{ width: m.progress + '%' }} /><b style={{ left: `calc(${m.progress}% - 9px)` }}>🚀</b></span> 🔴 <b>{m.progress}%</b></span>
        <span className={`pill ${m.comm === 'Online' ? 'good' : 'bad'}`}>📡 Comms: {m.comm}{unread ? ` · ✉️ ${unread}` : ''}</span>
        <button className="btn ghost small" onClick={() => setOpen(!open)} aria-label="toggle dashboard">{open ? '▾' : '▸'}</button>
      </div>
      {open && (
        <div className="hud-gauges">
          {gauges.map(([e, l, v, tip]) => (
            <div key={l} className={`hg ${level(v)}`} title={`${l}: ${tip}. ${l} is not interchangeable with other resources.`}>
              <span>{e} {l}</span><b>{Math.round(v)}%</b>
              <div className="bar"><i style={{ width: Math.max(0, Math.min(100, v)) + '%' }} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Timeline({ mission = false }) {
  const { state } = useGame()
  const stages = mission ? missionStages(state) : constructionStages(state)
  const pct = mission ? missionPct(state) : constructionPct(state)
  return (
    <div className="timeline-wrap" aria-label={mission ? 'Mission timeline' : 'Construction timeline'}>
      <div className="tl-head">
        <b>{mission ? 'MISSION: EARTH → MARS' : 'SPACECRAFT CONSTRUCTION'}: {pct}%</b>
        {!mission && <span className="enc">💬 {state.encourage}</span>}
        {mission && pct > 0 && <span className="enc">{pct >= 100 || state.mission.finished ? '🎉 Mission complete!' : pct >= 75 ? '💬 Almost there – Mars is close!' : pct >= 50 ? '💬 Halfway to Mars!' : pct >= 25 ? '💬 Great start, astronaut!' : '💬 Every mission starts with one step!'}</span>}
      </div>
      <div className="timeline">
        {stages.map((st, i) => (
          <React.Fragment key={st.key}>
            <div className={`tl-step ${st.state}`} title={st.label}>
              <div className="tl-dot">{st.done ? '✔' : i + 1}</div>
              <div className="tl-label">{st.label}{st.detail && !st.done ? <small> · {st.detail}</small> : null}</div>
            </div>
            {i < stages.length - 1 && <div className={`tl-line ${st.done ? 'done' : ''}`} />}
          </React.Fragment>
        ))}
      </div>
      <div className="bar thin"><i style={{ width: pct + '%', background: 'linear-gradient(90deg,var(--cyan),var(--green))' }} /></div>
      {mission && <MissionHUD />}
    </div>
  )
}
