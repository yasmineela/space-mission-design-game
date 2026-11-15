import React from 'react'
import { useGame } from '../state/GameContext.jsx'
import PetShip from '../components/PetShip.jsx'
import PetStats, { moodLine } from '../components/PetStats.jsx'
import Astronaut from '../components/Astronaut.jsx'
import { constructionPct, missionPct, ACHIEVEMENTS, weightOf, resumeScreen, isUnlocked, constructionStages, scienceCount, SCI_GOAL } from '../state/game.js'
import { ActivityFeed } from './TeamLobby.jsx'
import Astronaut2 from '../components/Astronaut.jsx'


// "What do I do now?" – derived from the same stages shown in the construction timeline, so it never disagrees with it
function nextStep(state) {
  if (state.mission.finished) return null
  if (state.mission.launched) return null
  const st = constructionStages(state)
  const compStage = st.find((x) => x.key === 'components')
  const cur = (compStage && !compStage.done) ? compStage : st.find((x) => !x.done)
  if (!cur) return { text: 'Everything is ready! Go to Mission Control and launch to Mars.', go: 'mission', btn: '🛰️ Mission Control' }
  switch (cur.key) {
    case 'components': return { text: 'Build your spacecraft: read the next step in the Instruction Book, then buy that part in the Workshop. Short of credits? Answer questions in the Science Academy to earn more.', go: 'book', btn: '📖 Open the Instruction Book' }
    case 'science': return { text: `Answer science questions in the Academy to earn credits (${Math.min(scienceCount(state), SCI_GOAL)}/${SCI_GOAL} needed for launch).`, go: 'academy', btn: '🔬 Science Academy' }
    case 'assembled': return { text: 'All parts are bought! Open the Workshop and press FINAL ASSEMBLY.', go: 'workshop', btn: '🛠️ Workshop' }
    case 'crew': return { text: 'Recruit your real astronaut crew in the Recruitment Centre.', go: 'crew', btn: '🧑‍🚀 Recruitment Centre' }
    case 'training': return { text: 'Complete the four training modules so your crew is ready to fly.', go: 'training', btn: '🎓 Training Academy' }
    default: return { text: 'Almost there! Check fuel and energy, then launch from Mission Control.', go: 'mission', btn: '🛰️ Mission Control' }
  }
}

export default function Dashboard() {
  const { state, dispatch } = useGame()
  const go = (screen) => dispatch({ type: 'NAV', screen })
  const launched = state.mission.launched
  const pct = launched ? missionPct(state) : constructionPct(state)
  const pet = state.pet
  const next = nextStep(state)
  const alerts = []
  if (pet.damaged) alerts.push('🔧 A part is damaged – visit Pet Interaction to repair it.')
  if (pet.energy < 30) alerts.push('🔋 Energy is low – help me recharge!')
  if (pet.fuel < 25 && state.installed.length > 2) alerts.push('⛽ Fuel is low – check the refuelling station.')
  const tiles = [
    ...(state.team ? [{ id: 'team', e: state.team.emblem || '👫', t: 'TEAM HUB', d: 'Members, contributions, decisions', c: '#4fd18b' }] : []),
    { id: 'workshop', e: '🛠️', t: 'MY SPACECRAFT', d: 'Workshop: buy & install parts', c: '#ff9f43' },
    { id: 'book', e: '📖', t: 'INSTRUCTION BOOK', d: 'See what to build next', c: '#35d0ff' },
    { id: 'academy', e: '🔬', t: 'SCIENCE ACADEMY', d: 'Answer & earn credits', c: '#8b5cf6' },
    { id: 'bank', e: '🏦', t: 'SPACE BANK', d: 'Balance & transactions', c: '#ffd166' },
    { id: 'crew', e: '🧑‍🚀', t: 'RECRUITMENT CENTRE', d: 'Recruit your real astronaut crew', c: '#ff5ca8' },
    { id: 'mission', e: '🛰️', t: 'MISSION CONTROL', d: 'Training, checks & launch', c: '#4d7dff' },
    { id: 'pet', e: '💜', t: 'PET INTERACTION', d: 'Refuel, repair, play', c: '#c77dff' },
  ]
  return (
    <>
    <section className="station-banner">
      <div className="sb-left"><Astronaut avatar={state.profile.avatar} color={state.profile.color} size={72} wave float />
        <div><small>PERSONAL SPACE STATION</small><h1>{state.profile.name}'s Station</h1>
          <div className="sb-meta"><span className="pill">🚀 {state.shipName}</span><span className="pill">Level {Math.min(state.level, 3)} of 3{state.levelsDone.length === 3 ? ' ✔' : ''}</span><span className="pill">{state.mode === 'team' ? '👫 Team mode' : '🧒 Solo mode'}</span></div></div></div>
      <div className="sb-right">
        {state.team && <div className="sb-team">{state.team.members.map((m) => <span key={m.id} title={m.name}><Astronaut avatar={m.avatar} color={m.color} size={34} /></span>)}</div>}
        <div className="ring" style={{ '--p': pct }}><b>{pct}%</b><small>{launched ? 'mission' : 'built'}</small></div>
        <button className="sb-bank" onClick={() => go('bank')}><small>SPACE BANK</small><b>💰 {state.balance}</b></button>
      </div>
    </section>
    <div className="dash">
      <section className="card dash-ship">
        <div className="dock"><span className="dock-label">DOCKING BAY</span><PetShip size={250} /></div>
        <h3 className="ship-name">{state.shipName}</h3>
        <p className="mood-line">{moodLine(state)}</p>
        <p className="tiny center">Tap me, or move your mouse – I'm watching!</p>
        <div className="mini-stats"><PetStats state={state} compact /></div>
        <button className="btn small secondary" onClick={() => go('pet')}>💜 Play & care for me</button>
      </section>
      <section className="dash-main">
        <div className="card mission-card">
          <div className="row between wrap">
            <div><small>CURRENT MISSION</small><h2>🌍 Earth → Mars 🔴</h2></div>
            <div className="chips-info"><span className="pill">Level {Math.min(state.level, 3)}{state.levelsDone.length === 3 ? ' ✔' : ''}</span><span className="pill">⚖️ {weightOf(state).toLocaleString()} kg</span></div>
          </div>
          <div className="bar"><i style={{ width: pct + '%', background: 'linear-gradient(90deg,var(--cyan),var(--green))' }} /></div>
          <p className="tiny">{launched ? 'Mission progress' : 'Construction progress'}: <b>{pct}%</b> · Level {Math.min(state.level, 3)} of 3 construction levels</p>
          {!launched && <p className="goal tiny">🎯 <b>Your mission:</b> build a spacecraft, choose and train a crew, then fly to Mars and explore it.</p>}
          {next && <div className="next-step" role="note"><span>👉 <b>Your next step:</b> {next.text}</span><button className="btn small primary" onClick={() => go(next.go)}>{next.btn}</button></div>}
          {launched && !state.mission.finished && <button className="btn primary" onClick={() => go(resumeScreen(state))}>▶ Continue mission</button>}
          {state.mission.finished && <button className="btn primary" onClick={() => go('report')}>📋 View mission report</button>}
        </div>
        {alerts.length > 0 && <div className="alerts">{alerts.map((a) => <div key={a} className="alert">{a}</div>)}</div>}
        <div className="tiles">
          {tiles.map((t) => <button key={t.id} className="tile" style={{ '--c': t.c }} onClick={() => go(t.id)}><span className="tile-e"><i>{t.e}</i></span><b>{t.t}</b><small>{t.d}</small></button>)}
        </div>
      </section>
      <aside className="dash-side">
        {state.team && (
          <div className="card team-panel">
            <h4>{state.team.emblem || '👫'} Team “{state.team.name}” · {state.team.code}</h4>
            <div className="sb-team members-line">{state.team.members.map((m) => <span key={m.id} title={m.name}><Astronaut2 avatar={m.avatar} color={m.color} size={38} /></span>)}</div>
            <ActivityFeed team={state.team} max={4} />
            <div className="row wrap"><button className="btn small primary" onClick={() => go('team')}>Open Team Hub</button><button className="btn small secondary" onClick={() => dispatch({ type: 'TEAM_HELP' })}>🤖 Teammate helps</button></div>
          </div>
        )}
        <div className="card">
          <h4>🏆 Achievements</h4>
          <div className="ach-list">
            {ACHIEVEMENTS.map((a) => { const on = isUnlocked(state, a); return <div key={a.id} className={`ach ${on ? 'on' : ''}`} title={a.desc}><span>{on ? a.emoji : '🔒'}</span><div><b>{a.name}</b><small>{a.desc}</small></div></div> })}
          </div>
        </div>
      </aside>
    </div>
    </>
  )
}
