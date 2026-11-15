import React from 'react'
import { useGame } from '../state/GameContext.jsx'
import Spacecraft from '../components/Spacecraft.jsx'
import Astronaut from '../components/Astronaut.jsx'
import { Bar } from '../components/ui.jsx'
import { useExpression } from '../components/Companion.jsx'
import { isReadyToLaunch, requiredFuel, weightOf, trainingCount, scienceCount, teamConfirmed, constructionStages, SCI_GOAL, FUEL_PRICE } from '../state/game.js'
import { COMPONENTS, ITEMS } from '../data/catalog.js'
import { TRAINING, CREW_BY_ID, SPECS } from '../data/crew.js'

export default function MissionControl() {
  const { state, dispatch } = useGame()
  const expr = useExpression()
  const p = state.pet
  const inst = (id) => state.installed.includes(id)
  const dmg = p.damaged
  const need = requiredFuel(state)
  const team = state.team
  const crew = state.crew.map((id) => CREW_BY_ID[id]).filter(Boolean)
  const go = (screen) => dispatch({ type: 'NAV', screen })

  if (state.mission.launched) {
    return (
      <div className="card center-card"><h2>🛰️ Mission Control</h2><p>{state.shipName} is on its way to Mars!</p>
        <button className="btn primary" onClick={() => go(state.mission.finished ? 'report' : state.mission.approach || state.mission.arrived ? 'mars' : 'interior')}>Return to my spacecraft</button></div>
    )
  }
  // each item is computed from the real game state and says what to do when it is not complete
  const items = [
    { id: 'parts', ok: state.installed.length === COMPONENTS.length && state.assembled, label: 'Required spacecraft components installed', detail: `${state.installed.length}/${COMPONENTS.length} parts${state.assembled ? ', assembled' : ''}`, todo: state.installed.length < COMPONENTS.length ? 'Buy and install every part in the Workshop (finish all 3 levels).' : 'Run FINAL ASSEMBLY in the Workshop.', go: 'workshop' },
    { id: 'fuel', ok: p.fuel >= need, label: 'Fuel requirements satisfied', detail: `${Math.round(p.fuel)} / ${need} units`, todo: `Buy fuel in Pet Interaction (💰 ${FUEL_PRICE} for +20). A heavier spacecraft needs more propellant.`, go: 'pet' },
    { id: 'energy', ok: inst('power') && p.energy >= 50, label: 'Energy system operational', detail: inst('power') ? `Power system installed · energy ${Math.round(p.energy)}%` : 'power system missing', todo: inst('power') ? 'Recharge in Pet Interaction – solar panels turn sunlight into electrical energy.' : 'Install the Basic Power System in the Workshop.', go: inst('power') ? 'pet' : 'workshop' },
    { id: 'life', ok: inst('life') && dmg !== 'life', label: 'Life-support system operational', detail: inst('life') ? (dmg === 'life' ? 'DAMAGED' : 'installed & working') : 'missing', todo: dmg === 'life' ? 'Repair the damaged Life-Support System in Pet Interaction.' : 'Install the Life-Support System in the Workshop (Level 2).', go: dmg === 'life' ? 'pet' : 'workshop' },
    { id: 'comm', ok: inst('antenna') && dmg !== 'antenna' && dmg !== 'adv_comm', label: 'Communication system operational', detail: inst('antenna') ? (dmg === 'antenna' || dmg === 'adv_comm' ? 'DAMAGED' : 'antenna online') : 'missing', todo: inst('antenna') ? 'Repair the damaged communication part in Pet Interaction.' : 'Install the Communication Antenna in the Workshop (Level 1).', go: inst('antenna') ? 'pet' : 'workshop' },
    { id: 'nav', ok: inst('nav') && dmg !== 'nav', label: 'Navigation system operational', detail: inst('nav') ? (dmg === 'nav' ? 'DAMAGED' : 'installed & working') : 'missing', todo: dmg === 'nav' ? 'Repair the damaged Navigation System in Pet Interaction.' : 'Install the Navigation System in the Workshop (Level 2).', go: dmg === 'nav' ? 'pet' : 'workshop' },
    { id: 'crew', ok: state.crewLocked, label: 'Astronaut crew selected', detail: crew.length ? crew.map((a) => a.name.split(' ')[0]).join(', ') : 'no crew yet', todo: 'Recruit 3 astronauts and confirm your crew.', go: 'crew' },
    { id: 'train', ok: trainingCount(state) === TRAINING.length, label: 'Astronaut training completed', detail: `${trainingCount(state)}/${TRAINING.length} modules`, todo: 'Finish all four training modules in the Training Academy.', go: 'training' },
    { id: 'health', ok: p.health >= 50 && !dmg, label: 'Spacecraft health good (no damaged parts)', detail: dmg ? `${ITEMS[dmg].name} is damaged` : `health ${Math.round(p.health)}%`, todo: 'Repair any damaged part in Pet Interaction.', go: 'pet' },
    { id: 'sci', ok: scienceCount(state) >= SCI_GOAL, label: `Science experience: ${SCI_GOAL} Academy challenges`, detail: `${Math.min(scienceCount(state), SCI_GOAL)}/${SCI_GOAL}`, todo: 'Earn credits and learn in the Science Academy.', go: 'academy' },
    ...(team ? [{ id: 'team', ok: teamConfirmed(state), label: 'Every team member confirmed', detail: `${team.members.filter((m) => team.confirms[m.id]).length}/${team.members.length} ready`, todo: 'Open the Team Launch Confirmation screen.', go: 'teamlaunch' }] : []),
  ]
  const ready = isReadyToLaunch(state)
  const open = items.filter((i) => !i.ok)
  return (
    <div className="mc2-screen">
      <div className="card mc-head">
        <div className="recruit-head"><span>🛰️ MISSION CONTROL · FINAL PREPARATION</span><small>DESTINATION: MARS 🔴</small></div>
        <div className="mc-grid">
          <div className="mc-ship"><Spacecraft installed={state.installed} expr={expr} color={state.shipColor} energy={p.energy} damaged={dmg} size={190} /><h3>{state.shipName}</h3></div>
          <div className="mc-info">
            <div className="mc-stats">
              <div className="mst"><small title="Mass is how much matter your spacecraft is made of. On Earth we usually call it its weight.">⚖️ Mass (weight on Earth)</small><b>{weightOf(state).toLocaleString()} kg</b></div>
              <div className="mst"><small>⛽ Fuel</small><Bar value={p.fuel} color="var(--orange)" /><b>{Math.round(p.fuel)}% (needs {need})</b></div>
              <div className="mst"><small>🔋 Electrical energy</small><Bar value={p.energy} color="var(--yellow)" /><b>{Math.round(p.energy)}%</b></div>
              <div className="mst"><small>❤️ Health</small><Bar value={p.health} color="var(--green)" /><b>{Math.round(p.health)}%</b></div>
              <div className="mst"><small>📡 Communication</small><b className={inst('antenna') ? 'okc' : 'badc2'}>{inst('antenna') ? 'Online' : 'No antenna'}</b></div>
              <div className="mst"><small>🎯 Destination</small><b>Mars 🔴</b></div>
            </div>
            <div className="notice learn-note">
              🎓 <b>Launch physics:</b> gravity pulls on every kilogram, so a heavier spacecraft needs a bigger push – and more propellant – to lift off and reach Mars. In this game you need about 1 fuel unit for every 160 kg: {weightOf(state).toLocaleString()} kg → <b>{need} fuel</b>{inst('adv_prop') ? ' (your Advanced Propulsion System gets more push from each bit of fuel, saving 15%)' : ''}. Lighter spacecraft need less fuel – that is why engineers fight for every kilogram!
            </div>
            <h4>🧑‍🚀 Crew</h4>
            <div className="mc-crew">
              <div className="mcm"><Astronaut avatar={state.profile.avatar} color={state.profile.color} size={54} /><span><b>{state.profile.name}</b><small>⭐ Mission Commander</small></span></div>
              {crew.map((a) => <div key={a.id} className="mcm"><Astronaut face={a.initials} color={a.color} size={54} /><span><b>{a.name}</b><small>{SPECS[a.skill].emoji} {SPECS[a.skill].name}</small></span></div>)}
              {team?.members.filter((m) => m.id !== 'me').map((m) => <div key={m.id} className="mcm"><Astronaut avatar={m.avatar} color={m.color} size={54} /><span><b>{m.name}</b><small>👫 Team member (simulated)</small></span></div>)}
              {crew.length === 0 && <p className="tiny">No astronauts recruited yet.</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>✅ Final checklist</h3>
        <p className="tiny">Each line checks your real spacecraft and game progress.</p>
        <div className="checklist">
          {items.map((c) => (
            <div key={c.id} className={`chk ${c.ok ? 'done' : 'current'}`}>
              <span className="chk-i">{c.ok ? '✅' : '❌'}</span>
              <div><b>{c.label}</b><small> · {c.detail}</small>{!c.ok && <small className="todo-line">➜ {c.todo}</small>}</div>
              {!c.ok && <button className="btn small secondary" onClick={() => go(c.go)}>Go</button>}
            </div>
          ))}
        </div>
        <p className="tip">A heavier spacecraft needs more propellant: yours needs about {need} fuel units to reach Mars. Fuel (engine) and electrical energy (instruments) are different resources.</p>
      </div>

      {team && (
        <div className="card">
          <h3>🤝 Team launch confirmation</h3>
          <p className="tiny">In Team Mission everyone confirms together (teammates are simulated).</p>
          <button className="btn primary" onClick={() => go('teamlaunch')}>Open Team Launch Confirmation →</button>
        </div>
      )}

      <div className="card launch-card">
        <h2>{ready ? '🚀 All systems GO!' : '⏳ Not ready yet'}</h2>
        {!ready && <p className="tiny">{open.length} item{open.length === 1 ? '' : 's'} left on the checklist.</p>}
        <button className="btn primary huge" disabled={!ready} onClick={() => dispatch({ type: 'LAUNCH' })}>🚀 LAUNCH TO MARS</button>
      </div>
    </div>
  )
}
