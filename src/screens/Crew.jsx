import React, { useState } from 'react'
import { useGame } from '../state/GameContext.jsx'
import Astronaut from '../components/Astronaut.jsx'
import Spacecraft from '../components/Spacecraft.jsx'
import { Modal } from '../components/ui.jsx'
import { ASTRONAUTS, CREW_BY_ID, CREW_SLOTS, SPECS, SPEC_IDS } from '../data/crew.js'
import { crewKey, crewComment } from '../state/teamService.js'
import { ActivityFeed } from './TeamLobby.jsx'

function Compare({ a, b, onClose }) {
  const rows = [
    ['Specialization', (x) => <><span className="spec-chip" style={{ '--c': SPECS[x.skill].color }}>{SPECS[x.skill].emoji} {SPECS[x.skill].name}</span></>],
    ['Professional background', (x) => x.background],
    ['Nationality', (x) => x.nationality],
    ['Real achievements', (x) => <ul>{x.achievements.map((t) => <li key={t}>{t}</li>)}</ul>],
    ['Why this skill matters', (x) => SPECS[x.skill].explain],
    ['How they could help', (x) => x.help],
    ['🎮 GAMEPLAY BONUS (fictional)', (x) => <b>{SPECS[x.skill].bonus}: one wrong option ruled out and +20% score</b>],
  ]
  return (
    <Modal wide onClose={onClose} className="compare-modal">
      <h2>⚖️ Compare astronauts</h2>
      <div className="cmp">
        <div className="cmp-head" />
        {[a, b].map((x) => <div key={x.id} className="cmp-head"><Astronaut face={x.initials} color={x.color} size={70} /><b>{x.name}</b></div>)}
        {rows.map(([label, f]) => (
          <React.Fragment key={label}>
            <div className="cmp-label">{label}</div>
            <div className="cmp-cell">{f(a)}</div>
            <div className="cmp-cell">{f(b)}</div>
          </React.Fragment>
        ))}
      </div>
      <p className="tiny">{a.skill === b.skill ? 'These two astronauts share a specialization – choosing both would cover the same needs twice.' : 'Different specializations help with different problems on the way to Mars. With only three seats, decide which needs matter most to you.'}</p>
      <div className="row center"><button className="btn primary" onClick={onClose}>Close comparison</button></div>
    </Modal>
  )
}

export default function Crew() {
  const { state, dispatch } = useGame()
  const [filter, setFilter] = useState('all')
  const [cmp, setCmp] = useState([])
  const [show, setShow] = useState(false)
  const locked = !state.assembled
  const chosen = state.crew.map((id) => CREW_BY_ID[id]).filter(Boolean)
  const covered = (skill) => chosen.find((a) => a.skill === skill)
  const coveredCount = SPEC_IDS.filter((s) => covered(s)).length
  const list = ASTRONAUTS.filter((a) => filter === 'all' || a.skill === filter)
  const frozen = state.crewLocked
  const toggleCmp = (id) => setCmp((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id].slice(-2)))
  const cmpPair = cmp.length === 2 ? cmp.map((id) => CREW_BY_ID[id]) : null
  const team = state.team
  const reviewed = !team || team.crewReview === crewKey(state.crew)
  const needs = SPEC_IDS.map((id) => ({ id }))

  return (
    <div className="crew">
      <div className="card recruit-card">
        <div className="recruit-head"><span>🛰️ ASTRONAUT RECRUITMENT CENTRE</span><small>EARTH → MARS MISSION · COMMAND + {CREW_SLOTS} CREW SEATS</small></div>
        <div className="scan-line" />
        <p>Welcome, Commander! Recruit <b>{CREW_SLOTS}</b> real astronauts to join you. Read their biographies and compare their expertise – choose the crew your mission <i>needs</i>, not just the ones you like the look of.</p>
        <p className="notice">ℹ️ <b>Science fact:</b> no human has ever travelled to Mars. These astronauts are <b>real</b> and their achievements are real (in Earth orbit, or – for Neil Armstrong – on the Moon). The <b>GAMEPLAY BONUSES</b> are fictional game mechanics inspired by their expertise, not real abilities, and the astronauts do not endorse this game.</p>
        {locked && <p className="notice warn">🔒 Finish building and assembling your spacecraft first. You can read about the astronauts while you wait!<br /><button className="btn small primary" onClick={() => dispatch({ type: 'NAV', screen: 'workshop' })}>Go to workshop</button></p>}
      </div>

      <div className="crew-top">
        <div className="card req-panel">
          <h3>📋 CREW REQUIREMENTS</h3>
          <p className="req-lead">Your mission requires a crew that can conduct scientific experiments, operate spacecraft systems and respond to emergencies. During the journey you may meet these challenges:</p>
          <div className="req-list">
            {SPEC_IDS.map((id) => { const sp = SPECS[id]; const a = covered(id); return (
              <div key={id} className={`req ${a ? 'ok' : ''}`}>
                <span className="req-ic" style={{ background: sp.color }}>{sp.emoji}</span>
                <div><b>{sp.need}</b><small>{sp.needText}</small><em>{a ? `✅ Covered by ${a.name}` : `Needs: ${sp.name}`}</em></div>
              </div>) })}
          </div>
          <p className="tiny">With only {CREW_SLOTS} seats you cannot cover everything, and no astronaut guarantees success – good decisions still matter. Mission needs covered: <b>{coveredCount}/{SPEC_IDS.length}</b></p>
        </div>

        <div className="card crew-panel">
          <h3>🚀 YOUR SPACECRAFT CREW</h3>
          <div className="crew-bay">
            <div className="bay-ship"><Spacecraft installed={state.installed} expr={chosen.length === CREW_SLOTS ? 'proud' : 'happy'} color={state.shipColor} size={110} bob={false} /></div>
            <div className="bay-seats">
              <div className="seats four">
                <div className="seat on cmdr"><Astronaut avatar={state.profile.avatar} color={state.profile.color} size={70} wave /><b>{state.profile.name}</b><small>⭐ Mission Commander</small></div>
                {Array.from({ length: CREW_SLOTS }, (_, i) => { const a = chosen[i]; return (
                  <div key={i} className={`seat ${a ? 'on' : ''}`}>
                    {a ? <><Astronaut face={a.initials} color={a.color} size={70} float /><b>{a.name.split(' ')[0]}</b><small>{SPECS[a.skill].emoji} {SPECS[a.skill].name}</small>
                      {!frozen && <button className="btn small ghost" onClick={() => dispatch({ type: 'TOGGLE_CREW', id: a.id })}>Remove</button>}</>
                      : <><span className="seat-empty">＋</span><small>Empty seat {i + 1}</small></>}
                  </div>) })}
              </div>
            </div>
          </div>
          <div className="row between wrap">
            <span>{frozen ? '✅ Crew confirmed' : `${chosen.length}/${CREW_SLOTS} recruited`}</span>
            {frozen
              ? <span className="row"><button className="btn ghost small" disabled={state.mission.launched} onClick={() => dispatch({ type: 'UNLOCK_CREW' })}>✏️ Change crew</button><button className="btn primary" onClick={() => dispatch({ type: 'NAV', screen: 'training' })}>Go to training →</button></span>
              : <button className="btn primary" disabled={locked || chosen.length !== CREW_SLOTS || !reviewed} onClick={() => dispatch({ type: 'CONFIRM_CREW' })}>Confirm my crew</button>}
          </div>
          {frozen && <p className="tiny">You can swap astronauts until launch. Training progress is kept.</p>}
          {team && (
            <div className="team-review">
              <h4>👫 TEAM CREW REVIEW <small>(shared crew – everyone sees the same selection)</small></h4>
              {chosen.length === CREW_SLOTS ? <>
                {team.members.filter((m) => m.id !== 'me').map((m) => (
                  <div key={m.id} className="bubble-row"><Astronaut avatar={m.avatar} color={m.color} size={36} /><div className="said"><b>{m.name}:</b> {team.crewReview === crewKey(state.crew) ? crewComment(m, chosen, SPECS, needs) : '…waiting to look at the crew.'}</div></div>))}
                {!frozen && <button className="btn secondary small" disabled={reviewed} onClick={() => dispatch({ type: 'TEAM_REVIEW_CREW' })}>{reviewed ? '✔ Team reviewed this crew' : '🔍 Ask the team to review the crew'}</button>}
              </> : <p className="tiny">Recruit {CREW_SLOTS} astronauts, then ask your team to review the crew's strengths before confirming.</p>}
              {state.feedback && <p className="feedback wrongfb">{state.feedback.text}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="card filter-bar">
        <div className="chips">
          <button className={`chip ${filter === 'all' ? 'sel' : ''}`} onClick={() => setFilter('all')}>All specializations</button>
          {SPEC_IDS.map((id) => <button key={id} className={`chip ${filter === id ? 'sel' : ''}`} onClick={() => setFilter(id)}>{SPECS[id].emoji} {SPECS[id].name}</button>)}
        </div>
        {filter !== 'all' && <p className="spec-explain"><b>{SPECS[filter].emoji} {SPECS[filter].name}:</b> {SPECS[filter].explain}</p>}
        <div className="row between wrap"><small>Tap “Compare” on two astronauts to see them side by side.</small>
          <button className="btn small secondary" disabled={!cmpPair} onClick={() => setShow(true)}>⚖️ Compare {cmp.length}/2</button></div>
      </div>

      <div className="astro-grid">
        {list.map((a) => {
          const on = state.crew.includes(a.id)
          const full = state.crew.length >= CREW_SLOTS && !on
          const sp = SPECS[a.skill]
          return (
            <div key={a.id} className={`card acard ${on ? 'selected' : ''}`}>
              <div className="badge-top"><span>ID · {a.id.toUpperCase().slice(0, 4)}-{a.initials}</span><i /></div>
              <div className="ahead"><Astronaut face={a.initials} color={a.color} size={86} float={on} />
                <div><h3>{a.name}</h3><small>{a.nationality}</small><p className="role">{a.background}</p>
                  <span className="spec-chip" style={{ '--c': sp.color }}>{sp.emoji} {sp.name}</span> <span className="pill illu">🎨 Illustration</span></div></div>
              <p className="bio">{a.bio}</p>
              <h5>Real-life achievements</h5>
              <ul>{a.achievements.map((x) => <li key={x}>{x}</li>)}</ul>
              <p><b>What this expertise means:</b> {sp.explain}</p>
              <p><b>On your mission:</b> {a.help}</p>
              <div className="bonus"><b>🎮 GAMEPLAY BONUS (fictional):</b> {sp.bonus}<br /><span>Rules out one wrong answer and adds +20% to your score. It helps – it never guarantees success.</span></div>
              <div className="row wrap">
                <button className={`btn ${on ? 'danger' : 'primary'}`} disabled={locked || frozen || full} onClick={() => dispatch({ type: 'TOGGLE_CREW', id: a.id })}>{on ? 'Remove from crew' : full ? 'Crew is full' : 'Add to crew'}</button>
                <button className={`btn secondary small ${cmp.includes(a.id) ? 'sel-cmp' : ''}`} onClick={() => toggleCmp(a.id)}>{cmp.includes(a.id) ? '✔ Comparing' : '⚖️ Compare'}</button>
              </div>
            </div>
          )
        })}
      </div>
      {show && cmpPair && <Compare a={cmpPair[0]} b={cmpPair[1]} onClose={() => setShow(false)} />}
    </div>
  )
}
