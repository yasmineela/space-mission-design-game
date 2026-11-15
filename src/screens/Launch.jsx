import React, { useEffect, useRef, useState } from 'react'
import { useGame } from '../state/GameContext.jsx'
import Spacecraft from '../components/Spacecraft.jsx'
import Astronaut from '../components/Astronaut.jsx'
import { CREW_BY_ID, SPECS } from '../data/crew.js'

export default function Launch() {
  const { state, dispatch } = useGame()
  const [t, setT] = useState(10)
  const [phase, setPhase] = useState('count') // count -> ignite -> lift -> space
  const [log, setLog] = useState(['Mission Control: All systems are ready.'])
  const timers = useRef([])
  const add = (m) => setLog((l) => [...l, m])
  useEffect(() => {
    const iv = setInterval(() => {
      setT((x) => {
        const n = x - 1
        if (n === 7) add('Mission Control: 10... 9... 8... 7...')
        if (n === 5) add('Mission Control: Fuel and power systems are go.')
        if (n === 3) { setPhase('ignite'); add('Mission Control: Engine ignition confirmed!') }
        if (n === 0) { setPhase('lift'); add('Mission Control: Liftoff! We have liftoff!'); timers.current.push(setTimeout(() => add('Mission Control: Spacecraft has successfully left Earth\u2019s atmosphere!'), 2600)); timers.current.push(setTimeout(() => setPhase('space'), 4200)); timers.current.push(setTimeout(() => add('Mission Control: Congratulations, astronaut! Your Mars mission has officially begun!'), 4400)) }
        if (n <= 0) clearInterval(iv)
        return Math.max(0, n)
      })
    }, 900)
    return () => { clearInterval(iv); timers.current.forEach(clearTimeout) }
  }, [])
  const skip = () => { setT(0); setPhase('space'); setLog(['Mission Control: Spacecraft has successfully left Earth\u2019s atmosphere!', 'Mission Control: Congratulations, astronaut! Your Mars mission has officially begun!']) }
  return (
    <div className={`launch phase-${phase}`}>
      <div className="sky" />
      <div className="launch-stars" />
      <div className="camera">
        <div className="earth-curve" />
        <div className="ground" />
        <div className="pad" />
        <div className={`rocket ${phase}`}>
          <Spacecraft installed={state.installed} expr={phase === 'count' ? 'worried' : 'excited'} color={state.shipColor} size={200} bob={false} flame={phase === 'ignite' || phase === 'lift' || phase === 'space'} />
        </div>
        {(phase === 'ignite' || phase === 'lift') && <div className="smoke"><i /><i /><i /><i /><i /><i /></div>}
      </div>
      <div className="launch-stages" aria-label="Launch progress">
        {['Earth launch', 'Leaving Earth\u2019s atmosphere', 'Entering space'].map((l, i) => { const at = phase === 'count' ? 0 : phase === 'ignite' ? 0 : phase === 'lift' ? 1 : 2; const done = phase === 'space' ? true : i < at; const cur = i === at && phase !== 'space'; return <span key={l} className={`ls ${done ? 'done' : cur ? 'cur' : ''}`}>{done ? '✔' : i + 1} {l}</span> })}
      </div>
      <div className="count-box">{phase === 'space' ? '' : phase === 'lift' ? 'LIFTOFF!' : t}</div>
      <div className="onboard" aria-label="Crew on board">
        <small>ON BOARD</small>
        <div className="ob-list">
          <div className="ob"><Astronaut avatar={state.profile.avatar} color={state.profile.color} size={44} /><span><b>{state.profile.name}</b><small>⭐ Commander</small></span></div>
          {state.crew.map((id) => CREW_BY_ID[id]).filter(Boolean).map((a) => <div key={a.id} className="ob"><Astronaut face={a.initials} color={a.color} size={44} /><span><b>{a.name.split(' ')[0]}</b><small>{SPECS[a.skill].emoji} {SPECS[a.skill].name}</small></span></div>)}
          {state.team?.members.filter((m) => m.id !== 'me').map((m) => <div key={m.id} className="ob"><Astronaut avatar={m.avatar} color={m.color} size={44} /><span><b>{m.name}</b><small>Team</small></span></div>)}
        </div>
      </div>
      <div className="mc-log">{log.slice(-3).map((m, i) => <p key={m + i}>🎙️ {m}</p>)}</div>
      <div className="launch-actions">
        {phase === 'space' ? <button className="btn primary huge" onClick={() => dispatch({ type: 'LAUNCHED' })}>👩‍🚀 ENTER MY SPACECRAFT</button> : <button className="btn ghost small" onClick={skip}>Skip countdown</button>}
      </div>
    </div>
  )
}
