import React, { useEffect, useState } from 'react'
import { useGame } from '../state/GameContext.jsx'
import Astronaut from '../components/Astronaut.jsx'
import Spacecraft from '../components/Spacecraft.jsx'
import PetShip from '../components/PetShip.jsx'
import PetStats from '../components/PetStats.jsx'
import ChallengeModal from '../components/ChallengeModal.jsx'
import { MicroExperiment, SolarExperiment, PlanetExperiment, PlantLab, NavConsole, LifeInSpace } from '../components/Experiments.jsx'
import { Modal, Bar } from '../components/ui.jsx'
import { useExpression } from '../components/Companion.jsx'
import { CREW_BY_ID, SPECS } from '../data/crew.js'
import { CREW_TALK, COMMANDER_TALK, EXPERIMENTS, CHALLENGES } from '../data/mission.js'
import { crewHas, requiredFuel, experimentsDone, FUEL_PRICE, FUEL_AMOUNT } from '../state/game.js'
import { statsOf } from '../state/teamService.js'

const EARTH_PX = (p) => Math.round(96 - p * 0.62)
const MARS_PX = (p) => Math.round(18 + p * 0.7)

function CrewPanel({ who, onClose }) {
  const { state, dispatch } = useGame()
  const [i, setI] = useState(0)
  const [said, setSaid] = useState(null)
  let title, sub, body, lines, tid, face, bonus
  if (who.kind === 'commander') {
    title = state.profile.name; sub = '⭐ Mission Commander'; lines = COMMANDER_TALK; tid = 'cmdr'
    body = state.mode === 'team' ? 'You lead the team. In Team Mission, your crewmates vote on important decisions.' : 'You lead the mission and make the final decisions.'
    face = <Astronaut avatar={state.profile.avatar} color={state.profile.color} size={90} wave />
  } else if (who.kind === 'team') {
    const m = who.m, st = statsOf(state.team, m.id)
    title = m.name; sub = '👫 Team member (simulated)'; lines = [{ q: 'How is the team doing?', a: `We have earned ${st.earned} credits through science so far and ${state.installed.length} parts are installed. Teamwork!` }, { q: 'Any advice?', a: 'Watch fuel, energy, oxygen and water – they are four different resources!' }]; tid = m.id
    body = 'A scripted teammate who shares your spacecraft, bank and decisions. No real player is connected.'
    face = <Astronaut avatar={m.avatar} color={m.color} size={90} float />
  } else {
    const a = who.a, sp = SPECS[a.skill]
    title = a.name; sub = `${sp.emoji} ${sp.name} · ${a.nationality}`; lines = CREW_TALK[a.skill]; tid = a.id
    body = a.help
    bonus = `GAMEPLAY BONUS (fictional): ${sp.bonus} – one wrong option ruled out and +20% score. It is a game mechanic inspired by their real expertise, not a real ability.`
    face = <Astronaut face={a.initials} color={a.color} size={90} float />
  }
  const ask = () => { const l = lines[i % lines.length]; setSaid(l); setI(i + 1); dispatch({ type: 'TALK', id: tid }) }
  return (
    <Modal onClose={onClose}>
      <div className="ahead">{face}<div><h2>{title}</h2><small>{sub}</small></div></div>
      <p>{body}</p>
      {bonus && <p className="notice">🎮 {bonus}</p>}
      <button className="btn primary" onClick={ask}>💬 Ask a question</button>
      {said && <div className="bubble-row"><div className="said"><b>You:</b> {said.q}</div></div>}
      {said && <div className="bubble-row"><div className="said ans"><b>{title.split(' ')[0]}:</b> {said.a}</div></div>}
      <div className="row"><button className="btn ghost" onClick={onClose}>Close</button></div>
    </Modal>
  )
}

function CommPanel({ onClose }) {
  const { state, dispatch } = useGame()
  const m = state.mission
  const [open, setOpen] = useState((m.messages || []).find((x) => !x.read)?.id ?? null)
  const msgs = m.messages || []
  useEffect(() => { if (open !== null) dispatch({ type: 'MSG_READ', id: open }) }, [])
  const sel = (id) => { setOpen(open === id ? null : id); dispatch({ type: 'MSG_READ', id }) }
  return (
    <Modal wide onClose={onClose}>
      <h2>📡 Communication with Mission Control</h2>
      <p className={`pill ${m.comm === 'Online' ? 'good' : 'bad'}`}>Link: {m.comm}</p>
      <p className="tiny">Messages are scripted for this prototype – no real communication service is used. Real radio signals can take minutes to reach Earth from Mars.</p>
      <div className="msg-list">
        {msgs.length === 0 && <p className="tiny">No messages yet.</p>}
        {msgs.map((x) => (
          <div key={x.id} className={`msg ${x.kind} ${x.read ? '' : 'unread'}`}>
            <button className="msg-head" onClick={() => sel(x.id)}><span>{x.kind === 'alert' ? '⚠️' : x.kind === 'crew' ? '🧑‍🚀' : '🛰️'}</span><b>{x.from}</b><em>{x.text.slice(0, 54)}{x.text.length > 54 ? '…' : ''}</em>{!x.read && <i className="dot" />}</button>
            {open === x.id && (
              <div className="msg-body">
                <p>{x.from === 'Mission Control' ? 'Mission Control: ' : ''}{x.text}</p>
                {x.replied ? <p className="tiny">✅ You replied · Mission Control: “{x.replied}”</p> : x.actions.length > 0 && <div className="chips">{x.actions.map((ac) => <button key={ac.label} className="chip" onClick={() => dispatch({ type: 'MSG_REPLY', id: x.id, reply: ac.reply })}>{ac.label}</button>)}</div>}
                {x.kind === 'alert' && <p className="tiny">Open the alert from the cabin to handle it.</p>}
              </div>
            )}
          </div>))}
      </div>
      <div className="row"><button className="btn ghost" onClick={onClose}>Close</button></div>
    </Modal>
  )
}

function CockpitPanel({ onClose, onExp }) {
  const { state, dispatch } = useGame()
  const m = state.mission, p = state.pet
  const [tab, setTab] = useState('nav')
  const perLeg = Math.max(3, Math.round(requiredFuel(state) / 10))
  const legs = Math.round((100 - m.progress) / 10)
  const need = legs * perLeg
  const fb = state.feedback
  const systems = [
    ['🔥', 'Engine & propulsion', state.installed.includes('adv_prop') ? 'Advanced + basic engines' : 'Basic engine', 'ok'],
    ['⛽', 'Fuel tank', `${Math.round(p.fuel)}% · needs about ${need} more units to arrive`, p.fuel >= need ? 'ok' : 'warn'],
    ['🔋', 'Power (energy)', `${Math.round(p.energy)}% · solar panels ${state.installed.includes('solar') ? 'installed' : 'missing'}`, p.energy >= 30 ? 'ok' : 'warn'],
    ['🫁', 'Life support', `Oxygen ${Math.round(m.oxygen)}% · Water ${Math.round(m.water ?? 100)}%`, m.oxygen >= 40 ? 'ok' : 'warn'],
    ['📡', 'Communication', m.comm, m.comm === 'Online' ? 'ok' : 'bad'],
    ['🧭', 'Navigation', m.navStatus, m.navStatus === 'On course' ? 'ok' : 'warn'],
  ]
  return (
    <Modal wide onClose={onClose}>
      <h2>🕹️ Cockpit</h2>
      <div className="chips"><button className={`chip big ${tab === 'nav' ? 'sel' : ''}`} onClick={() => setTab('nav')}>🧭 Navigation</button><button className={`chip big ${tab === 'ctl' ? 'sel' : ''}`} onClick={() => setTab('ctl')}>🎛️ Spacecraft controls</button></div>
      {tab === 'nav' && (
        <div>
          <svg viewBox="0 0 400 110" className="gsvg"><line x1="40" y1="60" x2="360" y2="60" stroke="#4b5aa8" strokeDasharray="5 5" strokeWidth="3" /><circle cx="40" cy="60" r="14" fill="#35d0ff" /><text x="40" y="92" textAnchor="middle" fontSize="11" fill="#cfd6ff">Earth</text><circle cx="360" cy="60" r="10" fill="#ff6b3d" /><text x="360" y="92" textAnchor="middle" fontSize="11" fill="#cfd6ff">Mars</text><text x={40 + 3.2 * m.progress} y="52" textAnchor="middle" fontSize="22" style={{ transform: 'rotate(90deg)', transformOrigin: `${40 + 3.2 * m.progress}px 52px` }}>🚀</text></svg>
          <p>Journey progress: <b>{m.progress}%</b> · Navigation: <b>{m.navStatus}</b></p>
          <p className="tiny">Each “Travel onward” moves the spacecraft one stage forward (the real trip takes many months – here it is shortened into stages).</p>
          <button className="btn secondary small" onClick={() => onExp('nav')}>🗺️ Navigation planning activity (bonus XP)</button>
        </div>
      )}
      {tab === 'ctl' && <div className="sys-grid">{systems.map(([e, n, v, st]) => <div key={n} className={`sys ${st}`}><span>{e}</span><div><b>{n}</b><small>{v}</small></div></div>)}</div>}
      <div className="row center">
        <button className="btn primary huge" disabled={!!m.pending || m.progress >= 100} onClick={() => dispatch({ type: 'TRAVEL' })}>{m.progress >= 100 ? 'Mars reached!' : '🚀 Travel onward (+10%)'}</button>
      </div>
      {fb && <div className="feedback poor">{fb.text}</div>}
      <p className="tip">Fuel (for the engine) and electrical energy (for instruments) are different resources. So are oxygen and water.</p>
      <div className="row"><button className="btn ghost" onClick={onClose}>Close</button></div>
    </Modal>
  )
}

function LabPanel({ onClose, onExp }) {
  const { state } = useGame()
  const m = state.mission
  const items = [
    ['gravity', '🧪', 'Microgravity', 'Observe floating objects and rescue them in the cabin game', true],
    ['solar', '☀️', 'Solar energy', 'Aim a solar panel and learn how it makes electricity', true],
    ['planet', '🔭', 'Observing Mars', 'Study Mars through the telescope', true],
    ['research', '🌱', 'Plant growth (bonus)', 'How does light affect seeds in space?', false],
  ]
  return (
    <Modal wide onClose={onClose}>
      <h2>🔬 Science laboratory</h2>
      <p>Complete the 3 required experiments to earn science XP and continue past the halfway point. Repeating an experiment earns no extra XP and no credits. Science XP so far: <b>⭐ {m.sciXp || 0}</b></p>
      <div className="lab-grid">
        {items.map(([id, e, n, d, req]) => (
          <button key={id} className={`lab-card ${m.activities[id] ? 'done' : ''}`} onClick={() => onExp(id)}>
            <span>{m.activities[id] ? '✅' : e}</span><b>{n}{req ? '' : ''}</b><small>{d}</small><small>{m.activities[id] ? 'Completed' : req ? 'Required' : 'Optional'}</small>
          </button>))}
      </div>
      {crewHas(state, 'biology') && <p className="tiny">🎮 Your biology specialist gives a gameplay bonus in the plant experiment.</p>}
      <div className="row"><button className="btn ghost" onClick={onClose}>Close</button></div>
    </Modal>
  )
}

function WindowPanel({ onClose }) {
  const { state } = useGame()
  const p = state.mission.progress
  return (
    <Modal wide onClose={onClose}>
      <h2>🪟 Looking outside</h2>
      <div className="big-window">
        <div className="win-stars" />
        <div className="earth-view" style={{ width: EARTH_PX(p) * 2, height: EARTH_PX(p) * 2, left: '8%', top: '20%', position: 'absolute' }} />
        <div className="mars-view" style={{ width: MARS_PX(p) * 2.2, height: MARS_PX(p) * 2.2, right: '10%', top: '26%', position: 'absolute' }} />
        {state.installed.includes('solar') && <svg className="outside-solar" viewBox="0 0 120 60"><rect x="4" y="8" width="52" height="44" rx="4" fill="#2d5bff" stroke="#9db8ff" /><rect x="64" y="8" width="52" height="44" rx="4" fill="#2d5bff" stroke="#9db8ff" /><path d="M30 8v44M90 8v44M4 30h52M64 30h52" stroke="#9db8ff" opacity=".7" /></svg>}
      </div>
      <p>🌍 Earth looks {p < 10 ? 'big and bright' : p < 60 ? 'smaller and smaller' : 'like a small blue dot'}. 🔴 Mars is {p < 40 ? 'still just a tiny red dot' : p < 80 ? 'growing bigger' : 'looking big and bright'}. Our spacecraft's solar panels{state.installed.includes('solar') ? ' (visible at the edge)' : ''} catch sunlight.</p>
      <p className="tiny">There is no “up” or “down” out here – and the stars do not twinkle, because there is no air to make them flicker.</p>
      <div className="row"><button className="btn ghost" onClick={onClose}>Close</button></div>
    </Modal>
  )
}

function PetPanel({ onClose }) {
  const { state, dispatch } = useGame()
  return (
    <Modal onClose={onClose}>
      <h2>💜 {state.shipName}</h2>
      <div className="pet-ship-wrap" style={{ minHeight: 0, paddingTop: 0 }}><PetShip size={200} /></div>
      <PetStats state={state} compact />
      <div className="row center wrap">
        <button className="btn secondary" onClick={() => dispatch({ type: 'TAP' })}>👋 Pet me</button>
        <button className="btn secondary" disabled={state.pet.fuel >= 100} onClick={() => dispatch({ type: 'REFUEL' })}>⛽ +{FUEL_AMOUNT} fuel (💰 {FUEL_PRICE})</button>
        <button className="btn primary" onClick={() => dispatch({ type: 'NAV', screen: 'pet' })}>Full pet screen →</button>
      </div>
      {state.feedback?.kind === 'poor' && <p className="feedback poor">{state.feedback.text}</p>}
      <div className="row"><button className="btn ghost" onClick={onClose}>Close</button></div>
    </Modal>
  )
}

const FLOATERS = [['🍱', 12, 30, 0], ['🔧', 80, 22, -3], ['🧸', 20, 66, -6], ['🔬', 64, 70, -9], ['🥤', 46, 14, -2]]

export default function Interior() {
  const { state, dispatch } = useGame()
  const expr = useExpression()
  const m = state.mission
  const [panel, setPanel] = useState(null)
  const [showCh, setShowCh] = useState(null)
  useEffect(() => { if (m.pending) setShowCh(m.pending) }, [m.pending])
  const crew = state.crew.map((id) => CREW_BY_ID[id]).filter(Boolean)
  const mates = state.team ? state.team.members.filter((x) => x.id !== 'me') : []
  const unread = (m.messages || []).filter((x) => !x.read).length
  const p = m.progress
  const exp = (id) => setPanel({ exp: id })
  const hasAnt = state.installed.includes('adv_comm') || state.installed.includes('antenna')
  const people = [
    { key: 'cmdr', who: { kind: 'commander' }, node: <Astronaut avatar={state.profile.avatar} color={state.profile.color} size={70} wave />, label: `${state.profile.name} ⭐` },
    ...crew.map((a) => ({ key: a.id, who: { kind: 'crew', a }, node: <Astronaut face={a.initials} color={a.color} size={70} float />, label: a.name.split(' ')[0] })),
    ...mates.map((t) => ({ key: t.id, who: { kind: 'team', m: t }, node: <Astronaut avatar={t.avatar} color={t.color} size={70} float />, label: t.name })),
  ]
  const spots = [
    { id: 'cockpit', e: '🕹️', l: 'Cockpit' }, { id: 'lab', e: '🔬', l: 'Science lab' }, { id: 'comm', e: '📡', l: `Communication${unread ? ` (${unread})` : ''}` },
    { id: 'storage', e: '🗄️', l: 'Storage' }, { id: 'window', e: '🪟', l: 'Window' }, { id: 'pet', e: '💜', l: state.shipName },
  ]
  const close = () => setPanel(null)
  return (
    <div className="interior2">
      <section className="cabin-scene" aria-label="Spacecraft cabin">
        <div className="cab-wall" />
        <div className="cab-title">COCKPIT & CABIN · {state.shipName.toUpperCase()}</div>

        <button className="cab-window w1" onClick={() => setPanel({ k: 'window' })} aria-label="Window">
          <div className="win-stars" /><div className="earth-view" style={{ width: EARTH_PX(p), height: EARTH_PX(p) }} /><span className="wlabel">🌍 Earth</span>
          {state.installed.includes('solar') && <svg className="outside-solar" viewBox="0 0 120 60"><rect x="4" y="8" width="52" height="44" rx="4" fill="#2d5bff" stroke="#9db8ff" /><rect x="64" y="8" width="52" height="44" rx="4" fill="#2d5bff" stroke="#9db8ff" /></svg>}
        </button>
        <button className="cab-window w2" onClick={() => setPanel({ k: 'window' })} aria-label="Window">
          <div className="win-stars" /><div className="mars-view" style={{ width: MARS_PX(p), height: MARS_PX(p) }} /><span className="wlabel">🔴 Mars</span>
          {hasAnt && <span className="outside-dish">📡</span>}
        </button>

        <button className="hotspot lab" onClick={() => setPanel({ k: 'lab' })}><span className="hs-ic">🔬</span><b>Science lab</b><i className="bench">🧪 🔭 🌱</i></button>
        <button className="hotspot comm" onClick={() => setPanel({ k: 'comm' })}><span className="hs-ic">📡</span><b>Communication</b><div className="comm-screen"><span>MISSION CONTROL</span><i className={m.comm === 'Online' ? 'on' : 'off'} /></div>{unread > 0 && <em className="badge">{unread}</em>}</button>
        <button className="hotspot storage" onClick={() => setPanel({ k: 'storage' })}><span className="hs-ic">🗄️</span><b>Storage</b></button>

        <button className="hotspot cockpit" onClick={() => setPanel({ k: 'cockpit' })}>
          <b>🕹️ Cockpit</b>
          <div className="console-row"><div className="holo"><Spacecraft installed={state.installed} expr={expr} color={state.shipColor} size={64} bob={false} /></div>
            <div className="lights">{state.installed.map((id) => <i key={id} />)}</div></div>
        </button>

        <div className="seat-pair" aria-hidden="true"><span className="pilot-seat" /><span className="pilot-seat" /></div>
        <div className="cab-people">
          {people.map((pe, i) => (
            <button key={pe.key} className={`cab-person pos${i % 8}`} style={{ animationDelay: `${-i * 1.7}s` }} onClick={() => setPanel({ k: 'crew', who: pe.who })} title={pe.label}>{pe.node}<small>{pe.label}</small></button>
          ))}
        </div>
        <button className="cab-pet" onClick={() => setPanel({ k: 'pet' })} aria-label="Space Buddy companion"><Spacecraft installed={state.installed} expr={expr} color={state.shipColor} energy={state.pet.energy} size={86} damaged={state.pet.damaged} /></button>

        <div className="floaters" aria-hidden="true">{FLOATERS.map(([e, x, y, d]) => <i key={e} style={{ left: x + '%', top: y + '%', animationDelay: d + 's' }}>{e}</i>)}</div>
      </section>

      <div className="spot-row">{spots.map((s) => <button key={s.id} className="btn secondary small" onClick={() => setPanel({ k: s.id })}>{s.e} {s.l}</button>)}</div>

      <section className="card mission-actions">
        <div className="row between wrap">
          <h3>🕹️ Mission actions</h3>
          <span className="pill">Experiments {experimentsDone(state)}/{EXPERIMENTS.length} · Challenges {Object.keys(m.challenges).filter((x) => x !== 'calc').length}/{CHALLENGES.length} · ⭐ {m.sciXp || 0} XP</span>
        </div>
        {m.pending && <button className="btn danger huge" onClick={() => setShowCh(m.pending)}>⚠️ Open the alert!</button>}
        {!m.pending && m.progress < 100 && <button className="btn primary huge" onClick={() => dispatch({ type: 'TRAVEL' })}>🚀 Travel onward (+10%)</button>}
        {m.progress >= 100 && !m.pending && <button className="btn primary huge pulse" onClick={() => dispatch({ type: 'ARRIVE' })}>🔴 Approach Mars!</button>}
        {state.feedback && <div className="feedback poor">{state.feedback.text}</div>}
        <div className="act-buttons">
          <button className="btn small" disabled={state.pet.fuel >= 100} onClick={() => dispatch({ type: 'REFUEL' })}>⛽ Buy +{FUEL_AMOUNT} fuel (💰 {FUEL_PRICE})</button>
          <button className="btn small" disabled={m.emergencyUsed || state.pet.fuel >= 8} onClick={() => dispatch({ type: 'EMERGENCY_FUEL' })}>🆘 Emergency fuel (once, when nearly empty)</button>
          <button className="btn small" onClick={() => setPanel({ exp: 'solar' })}>☀️ Solar array</button>
        </div>
        <h4>📋 Mission log</h4>
        <div className="log">{m.log.slice(0, 6).map((l, i) => <div key={i}><b>{l.t}</b> {l.text}</div>)}</div>
      </section>

      {panel?.k === 'cockpit' && <CockpitPanel onClose={close} onExp={exp} />}
      {panel?.k === 'lab' && <LabPanel onClose={close} onExp={exp} />}
      {panel?.k === 'comm' && <CommPanel onClose={close} />}
      {panel?.k === 'storage' && <LifeInSpace onClose={close} />}
      {panel?.k === 'window' && <WindowPanel onClose={close} />}
      {panel?.k === 'pet' && <PetPanel onClose={close} />}
      {panel?.k === 'crew' && <CrewPanel who={panel.who} onClose={close} />}
      {panel?.exp === 'gravity' && <MicroExperiment onClose={close} />}
      {panel?.exp === 'solar' && <SolarExperiment onClose={close} />}
      {panel?.exp === 'planet' && <PlanetExperiment onClose={close} />}
      {panel?.exp === 'research' && <PlantLab onClose={close} />}
      {panel?.exp === 'nav' && <NavConsole onClose={close} />}
      {showCh && <ChallengeModal key={showCh} id={showCh} onClose={() => setShowCh(null)} />}
    </div>
  )
}
