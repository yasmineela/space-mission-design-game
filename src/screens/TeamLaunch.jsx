import React, { useEffect, useRef, useState } from 'react'
import { useGame } from '../state/GameContext.jsx'
import Astronaut from '../components/Astronaut.jsx'
import Spacecraft from '../components/Spacecraft.jsx'
import { Confetti } from '../components/ui.jsx'
import { ActivityFeed } from './TeamLobby.jsx'
import { preflight, isReadyToLaunch, trainingCount, requiredFuel } from '../state/game.js'
import { COMPONENTS } from '../data/catalog.js'
import { TRAINING, CREW_BY_ID, SPECS } from '../data/crew.js'

export default function TeamLaunch() {
  const { state, dispatch } = useGame()
  const team = state.team
  const timers = useRef([])
  const [count, setCount] = useState(null)
  if (!team) return <div className="card center-card"><p>Team launch confirmation is only used in Team Mission.</p><button className="btn primary" onClick={() => dispatch({ type: 'NAV', screen: 'mission' })}>Mission Control</button></div>
  const pf = preflight(state)
  const fuel = pf.find((c) => c.id === 'fuel'), energy = pf.find((c) => c.id === 'energy')
  const systems = pf.every((c) => c.ok)
  const checks = [
    { id: 'built', ok: state.assembled && state.installed.length === COMPONENTS.length, label: 'Spacecraft construction completed', detail: `${state.installed.length}/${COMPONENTS.length} parts · ${state.assembled ? 'assembled' : 'final assembly needed'}`, go: 'workshop' },
    { id: 'fuel', ok: fuel.ok, label: 'Fuel requirements satisfied', detail: fuel.label, go: 'pet' },
    { id: 'energy', ok: energy.ok, label: 'Energy requirements satisfied', detail: energy.label, go: 'pet' },
    { id: 'crew', ok: state.crewLocked, label: 'Astronaut crew selected', detail: state.crew.length ? state.crew.map((id) => CREW_BY_ID[id]?.name.split(' ')[0]).join(', ') : 'no crew yet', go: 'crew' },
    { id: 'train', ok: trainingCount(state) === TRAINING.length, label: 'Astronaut training completed', detail: `${trainingCount(state)}/${TRAINING.length} modules`, go: 'training' },
    { id: 'sys', ok: systems, label: 'Mission systems checked', detail: systems ? 'health, power and fuel are all good' : 'a system needs attention', go: 'pet' },
  ]
  const allChecks = checks.every((c) => c.ok)
  const everyone = team.members.every((m) => team.confirms[m.id])
  const ready = isReadyToLaunch(state)

  // simulated teammates confirm one after another
  const askTeam = () => {
    team.members.filter((m) => m.id !== 'me' && !team.confirms[m.id]).forEach((m, i) => {
      timers.current.push(setTimeout(() => dispatch({ type: 'TEAM_CONFIRM', id: m.id, value: true }), 900 * (i + 1)))
    })
  }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  // all confirmations received -> countdown to launch
  useEffect(() => {
    if (!(ready && everyone)) { setCount(null); return }
    setCount(3)
    const id = setInterval(() => setCount((c) => (c === null ? null : c - 1)), 1000)
    return () => clearInterval(id)
  }, [ready, everyone])
  useEffect(() => { if (count === 0) dispatch({ type: 'LAUNCH' }) }, [count])

  return (
    <div className="team-launch">
      <div className="card tl-head">
        <div className="recruit-head"><span>🚀 TEAM LAUNCH CONFIRMATION</span><small>{team.emblem} {team.name.toUpperCase()}</small></div>
        <p>Every member of the team must confirm that they are ready. The spacecraft belongs to everyone, so nobody can launch it alone.</p>
        <p className="tiny">🧪 Prototype: teammates are simulated. In real multiplayer each person would tap their own button on their own device.</p>
      </div>
      <div className="tl-grid">
        <div className="card">
          <h3>✅ Pre-launch checklist</h3>
          {checks.map((c) => (
            <div key={c.id} className={`chk ${c.ok ? 'done' : 'current'}`}>
              <span className="chk-i">{c.ok ? '✅' : '❌'}</span>
              <div><b>{c.label}</b><small> · {c.detail}</small></div>
              {!c.ok && <button className="btn small secondary" onClick={() => dispatch({ type: 'NAV', screen: c.go })}>Fix</button>}
            </div>
          ))}
          <p className="tip">This spacecraft needs {requiredFuel(state)} fuel units to reach Mars.</p>
        </div>
        <div className="card">
          <h3>🧑‍🚀 Team readiness</h3>
          <div className="ready-grid">
            {team.members.map((m) => { const ok = team.confirms[m.id]; return (
              <div key={m.id} className={`ready-card ${ok ? 'ok' : ''}`}>
                <Astronaut avatar={m.avatar} color={m.color} size={64} float={ok} />
                <b>{m.name}{m.id === 'me' ? ' (you)' : ''}</b>
                <span>{ok ? '✔ Ready' : '⏳ Waiting…'}</span>
                {m.id === 'me' && <button className={`btn small ${ok ? 'ghost' : 'primary'}`} disabled={!allChecks && !ok} onClick={() => dispatch({ type: 'TEAM_CONFIRM', id: 'me' })}>{ok ? 'Undo' : "I'm ready!"}</button>}
              </div>) })}
          </div>
          <div className="row center"><button className="btn secondary" disabled={!allChecks || team.members.every((m) => m.id === 'me' || team.confirms[m.id])} onClick={askTeam}>🤖 Ask teammates to confirm</button></div>
          {!allChecks && <p className="tiny center">Fix the checklist first – nobody can confirm until the spacecraft is truly ready.</p>}
        </div>
      </div>

      {count !== null && count > 0 && (
        <div className="card launch-banner"><Confetti once /><h2>✅ All confirmations received!</h2><p className="count-small">Launch countdown begins in <b>{count}</b>…</p></div>
      )}

      <div className="card inside-ship">
        <h3>🛸 Together inside {state.shipName}</h3>
        <div className="inside-row">
          <Spacecraft installed={state.installed} expr={everyone ? 'excited' : 'happy'} color={state.shipColor} size={120} />
          <div className="crew-row">
            {team.members.map((m) => <div key={m.id} className="cr"><Astronaut avatar={m.avatar} color={m.color} size={64} float /><small>{m.name}</small></div>)}
            {state.crew.map((id) => CREW_BY_ID[id]).filter(Boolean).map((a) => <div key={a.id} className="cr"><Astronaut face={a.initials} color={a.color} size={64} float /><small>{a.name.split(' ')[0]}<br />{SPECS[a.skill].emoji}</small></div>)}
          </div>
        </div>
        <div className="row center"><button className="btn primary huge" disabled={!(ready && everyone)} onClick={() => dispatch({ type: 'LAUNCH' })}>🚀 LAUNCH NOW</button></div>
      </div>
      <div className="card"><ActivityFeed team={team} max={6} /></div>
    </div>
  )
}
