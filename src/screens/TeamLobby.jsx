import React, { useState } from 'react'
import { useGame } from '../state/GameContext.jsx'
import Astronaut from '../components/Astronaut.jsx'
import Spacecraft from '../components/Spacecraft.jsx'
import { Bar } from '../components/ui.jsx'
import ActivityRunner from '../components/Activity.jsx'
import { ACT_BY_ID, TIERS } from '../data/academy.js'
import { COMPONENTS, ITEMS } from '../data/catalog.js'
import { constructionPct, stepIndex, stepsOf, scienceCount, trainingCount } from '../state/game.js'
import { TRAINING } from '../data/crew.js'
import { EMBLEMS, MAX_MEMBERS, genCode, validCode, DECISIONS, SIM_ROSTER, SIM_SCIENCE_LIMIT, SIM_BUY_LIMIT_PER_LEVEL, statsOf, recognition } from '../state/teamService.js'

const KIND_ICON = { level: '🏆', buy: '🛠️', science: '🔬', crew: '🧑‍🚀', train: '🎓', join: '👋', launch: '🚀', almost: '✨', vote: '🗳️', tip: '💡', info: '📣' }
const ago = (t) => { const s = Math.max(0, Math.round((Date.now() - t) / 1000)); return s < 10 ? 'just now' : s < 60 ? `${s}s ago` : s < 3600 ? `${Math.round(s / 60)} min ago` : 'earlier' }

export function MemberRow({ m, extra }) {
  return <div className="member"><Astronaut avatar={m.avatar} color={m.color} size={44} /><div><b>{m.name}</b>{m.id === 'me' && <small> (you)</small>}{m.id !== 'me' && <small> · simulated</small>}</div>{extra}</div>
}

// Attractive, easy-to-scan live-style feed (newest first)
export function ActivityFeed({ team, max = 8, title = '📣 Team activity' }) {
  return (
    <div className="feed">
      <h4>{title}</h4>
      {team.feed.length === 0 && <p className="tiny">Nothing yet – start building together!</p>}
      {team.feed.slice(0, max).map((f, i) => {
        const m = team.members.find((x) => x.id === f.who)
        return (
          <div key={f.id} className={`feed-item k-${f.kind || 'info'} ${i === 0 ? 'fresh' : ''}`}>
            <span className="feed-ic">{KIND_ICON[f.kind] || '📣'}</span>
            {m && <Astronaut avatar={m.avatar} color={m.color} size={26} />}
            <span className="feed-text">{f.kind === 'level' || f.kind === 'almost' ? f.text : <><b>{f.name}</b> {f.text.replace(f.name, '').trim()}</>}</span>
            <small>{ago(f.t)}</small>
          </div>
        )
      })}
    </div>
  )
}

function Banner({ state }) {
  const team = state.team
  const pct = constructionPct(state)
  const copy = async () => { try { await navigator.clipboard.writeText(team.code) } catch (e) { /* clipboard unavailable */ } }
  return (
    <div className="team-banner">
      <div className="tb-emblem">{team.emblem || '🚀'}</div>
      <div className="tb-info">
        <small>TEAM MISSION · EARTH → MARS</small>
        <h2>{team.name}</h2>
        <div className="tb-row"><span className="pill">🔑 {team.code}</span><button className="btn small ghost" onClick={copy}>📋 Copy code</button><span className="pill">👫 {team.members.length}/{MAX_MEMBERS} members</span></div>
        <div className="tb-progress"><span>Level {Math.min(state.level, 3)} · Construction {pct}%</span><div className="bar"><i style={{ width: pct + '%', background: 'linear-gradient(90deg,var(--cyan),var(--green))' }} /></div></div>
      </div>
      <div className="tb-bank"><small>TEAM BANK</small><b>💰 {state.balance}</b><small>shared by everyone</small></div>
      <div className="tb-ship"><Spacecraft installed={state.installed} expr="happy" color={state.shipColor} size={110} bob={false} /><small>{state.shipName}</small></div>
    </div>
  )
}

function NoTeam() {
  const { dispatch } = useGame()
  const [name, setName] = useState('Mars Crew')
  const [emblem, setEmblem] = useState('🚀')
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const join = () => { const c = code.trim().toUpperCase(); if (!validCode(c)) return setErr('Invite codes look like ABCD-1234.'); dispatch({ type: 'JOIN_TEAM', code: c }) }
  return (
    <div className="center-page"><div className="card form-card">
      <h2>👫 TEAM MISSION</h2>
      <p className="notice">🧪 <b>Prototype note:</b> teammates are <b>simulated</b> characters saved on this device – no real players on other devices are connected. Codes, the shared bank, the shared spacecraft and the activity feed all work, and the code is organised so real multiplayer can be added later.</p>
      <div className="two-col">
        <div className="subcard">
          <h3>Create a team</h3>
          <label className="lbl">Team name</label>
          <input className="input" aria-label="Team name" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} />
          <label className="lbl">Team emblem</label>
          <div className="chips">{EMBLEMS.map((e) => <button key={e} className={`chip emoji ${emblem === e ? 'sel' : ''}`} onClick={() => setEmblem(e)} aria-label={`emblem ${e}`}>{e}</button>)}</div>
          <button className="btn primary" onClick={() => dispatch({ type: 'CREATE_TEAM', code: genCode(), name: name.trim() || 'Mars Crew', emblem })}>Create team & get invite code</button>
        </div>
        <div className="subcard">
          <h3>Join with a code</h3>
          <p className="tiny">Got a friend's invitation code? Enter it to join their team.</p>
          <input className="input" aria-label="Team invite code" value={code} maxLength={9} placeholder="ABCD-1234" onChange={(e) => { setCode(e.target.value); setErr('') }} />
          {err && <p className="error" role="alert">{err}</p>}
          <button className="btn secondary" onClick={join}>Join team</button>
        </div>
      </div>
    </div></div>
  )
}

function Lobby({ state }) {
  const { dispatch } = useGame()
  const team = state.team
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const fresh = state.installed.length === 0 && scienceCount(state) === 0
  const sims = team.members.filter((m) => m.id !== 'me')
  const join = () => { const c = code.trim().toUpperCase(); if (!validCode(c)) return setErr('Invite codes look like ABCD-1234.'); dispatch({ type: 'JOIN_TEAM', code: c }) }
  return (
    <div className="two-col">
      <div className="card">
        <h3>👫 Team members</h3>
        <div className="members">{team.members.map((m) => (
          <div key={m.id} className="member big"><Astronaut avatar={m.avatar} color={m.color} size={62} float /><div><b>{m.name}</b>{m.id === 'me' && <small> (you)</small>}{team.hostId === m.id && <small> · ⭐ captain</small>}<br /><small>{m.id === 'me' ? 'Mission Commander' : 'Simulated teammate'}</small></div></div>
        ))}</div>
        {team.members.length < MAX_MEMBERS && <div className="row"><button className="btn secondary" onClick={() => dispatch({ type: 'ADD_SIM_MEMBER' })}>➕ Simulate a friend joining with the code</button></div>}
        <p className="tiny">A pop-up confirms whenever someone joins.</p>
      </div>
      <div className="card">
        <h3>✉️ Invite friends</h3>
        <div className="code-box"><small>Invitation code for “{team.name}”</small><div className="code">{team.code}</div><p className="tiny">Share this code. Friends choose <b>Team Mission → Join with a code</b>.</p></div>
        <h4>Enter another player's code</h4>
        {fresh ? (
          <><input className="input" aria-label="Team invite code" value={code} maxLength={9} placeholder="ABCD-1234" onChange={(e) => { setCode(e.target.value); setErr('') }} />{err && <p className="error" role="alert">{err}</p>}<button className="btn secondary" onClick={join}>Switch to that team</button></>
        ) : <p className="tiny">You can only switch teams before building starts, so nobody's shared spacecraft gets mixed up.</p>}
        <h4>🤝 Ask a teammate to help</h4>
        <p className="tiny">Scripted teammates do real, limited jobs: {SIM_SCIENCE_LIMIT} science challenges each, and {SIM_BUY_LIMIT_PER_LEVEL} purchase per level. Everything goes through the shared bank.</p>
        {sims.map((m) => { const st = statsOf(team, m.id); return (
          <div key={m.id} className="helper-row"><Astronaut avatar={m.avatar} color={m.color} size={34} /><b>{m.name}</b>
            <button className="btn small secondary" disabled={st.sci >= SIM_SCIENCE_LIMIT} onClick={() => dispatch({ type: 'TEAM_HELP', who: m.id })}>🔬 Science ({st.sci}/{SIM_SCIENCE_LIMIT})</button>
            <button className="btn small secondary" onClick={() => dispatch({ type: 'TEAM_BUY', who: m.id })}>🛠️ Buy next part</button></div>) })}
        {state.feedback && <div className={`feedback ${state.feedback.kind}`}>{state.feedback.text}</div>}
      </div>
    </div>
  )
}

function Contributions({ state }) {
  const team = state.team
  const totalSci = team.members.reduce((a, m) => a + statsOf(team, m.id).sci, 0)
  return (
    <div className="contrib">
      <div className="card team-totals">
        <h3>🌟 Our shared mission</h3>
        <div className="bank-tiles">
          <div className="btile"><span>💰</span><b>{state.balance}</b><small>team bank</small></div>
          <div className="btile"><span>🛠️</span><b>{state.installed.length}/{COMPONENTS.length}</b><small>parts installed</small></div>
          <div className="btile"><span>🔬</span><b>{scienceCount(state)}</b><small>science challenges</small></div>
          <div className="btile"><span>🏆</span><b>{state.levelsDone.length}/3</b><small>levels done</small></div>
        </div>
        <p className="tiny">Every contribution helps the same spacecraft. There is no ranking – a team is strongest when everyone does what they are best at!</p>
      </div>
      <div className="contrib-grid">
        {team.members.map((m) => {
          const st = statsOf(team, m.id)
          const me = m.id === 'me'
          return (
            <div key={m.id} className="card ccard">
              <div className="ahead"><Astronaut avatar={m.avatar} color={m.color} size={64} /><div><h3>{me ? `${m.name} (you)` : m.name}</h3><small>{me ? 'Mission Commander' : 'Simulated teammate'}</small></div></div>
              <ul className="cstats">
                <li><span>🔬 Science challenges</span><b>{st.sci}</b></li>
                <li><span>💰 Credits earned</span><b>{st.earned}</b></li>
                <li><span>🛒 Components purchased</span><b>{st.bought.length}</b></li>
                <li><span>🔧 Construction tasks</span><b>{st.installed.length}</b></li>
                <li><span>🎓 Training activities</span><b>{st.training.length}/{TRAINING.length}</b></li>
              </ul>
              {st.bought.length > 0 && <p className="tiny">Bought: {st.bought.map((id) => ITEMS[id].emoji + ' ' + ITEMS[id].name).join(', ')}</p>}
              <div className="recog">{recognition(team, m, me).map((l) => <p key={l}>🌟 {l}</p>)}</div>
            </div>
          )
        })}
      </div>
      {totalSci === 0 && state.installed.length === 0 && <p className="notice">Nothing to show yet – complete a science challenge or buy a part, and your contribution appears here!</p>}
    </div>
  )
}

const TEAM_CHALLENGES = [
  { id: 'ph3', title: 'Physics puzzle together', emoji: '⚛️', blurb: 'Work out how many engines can lift the rocket.' },
  { id: 'en2', title: 'Match components to functions', emoji: '🧩', blurb: 'Drag each spacecraft part to the job it does.' },
  { id: 'pl3', title: 'Planet identification', emoji: '🪐', blurb: 'Match each planet to its clue.' },
  { id: 'en6', title: 'Fuel-management problem', emoji: '⛽', blurb: 'Why does a heavier spacecraft need more fuel?' },
]
function TeamChallenges({ state }) {
  const { dispatch } = useGame()
  const [open, setOpen] = useState(null)
  const team = state.team
  if (open) return <ActivityRunner key={open} act={ACT_BY_ID[open]} onBack={() => { setOpen(null); dispatch({ type: 'CLEAR_FEEDBACK' }) }} team={team} />
  return (
    <div>
      <p className="notice">🔬 Solve these together! Teammates can share one free tip each. Rewards go to the <b>shared team bank</b> using the normal Academy rewards – and every challenge can only be rewarded once.</p>
      <div className="act-grid">
        {TEAM_CHALLENGES.map((c) => {
          const act = ACT_BY_ID[c.id]; const t = TIERS[act.tier]; const done = state.academy.done[c.id]; const locked = t.unlockLevel > Math.min(state.level, 3)
          return <button key={c.id} className={`act ${done ? 'done' : ''} ${locked ? 'locked' : ''}`} disabled={locked} onClick={() => setOpen(c.id)}><span className="act-icon">{locked ? '🔒' : done ? '✅' : c.emoji}</span><b>{c.title}</b><small>{c.blurb}</small><small>{t.label} · 💰 {t.reward} for the team</small><small>{locked ? `Unlocks at Level ${t.unlockLevel}` : done ? 'Completed by the team' : 'Play together'}</small></button>
        })}
      </div>
    </div>
  )
}

function Decisions({ state }) {
  const { dispatch } = useGame()
  const team = state.team
  const n = Math.min(state.level, 3)
  const d = DECISIONS[n]
  const [talked, setTalked] = useState(false)
  const [choice, setChoice] = useState(null)
  const dec = team.decisions?.[n]
  const open = d && !dec && !state.levelsDone.includes(n) && stepIndex(state, n) <= Math.min(d.i, d.j)
  const opt = (k) => ({ k, ...d[k], item: ITEMS[d[k].target] })
  const history = Object.entries(team.decisions || {})
  return (
    <div className="decisions">
      {open && (
        <div className="card">
          <h3>🗳️ Team decision · {d.title}</h3>
          <p>Your team has <b>💰 {state.balance}</b> credits. Which part should we buy <b>first</b>? Discuss, then everyone votes. If it is a tie, the team captain decides.</p>
          <div className="dec-options">
            {['A', 'B'].map((k) => { const o = opt(k); return (
              <button key={k} className={`dec-opt ${choice === k ? 'sel' : ''}`} onClick={() => setChoice(k)}>
                <span className="part-art" style={{ background: `radial-gradient(circle at 30% 25%, #fff8, ${o.item.color})`, width: 64, height: 64, fontSize: 34 }}>{o.item.emoji}</span>
                <b>{o.item.name}</b><small>💰 {o.item.price} · ⚖️ {o.item.weight} kg</small><small>{o.item.purpose}</small>
              </button>) })}
          </div>
          {!talked ? <button className="btn secondary" onClick={() => setTalked(true)}>💬 Discuss with the team</button> : (
            <div className="discuss">
              {team.members.filter((m) => m.id !== 'me').map((m) => { const v = SIM_ROSTER.find((r) => r.id === m.id)?.votes[n] || 'A'; const o = opt(v); return (
                <div key={m.id} className="bubble-row"><Astronaut avatar={m.avatar} color={m.color} size={40} /><div className="said"><b>{m.name}:</b> “I think the {o.item.name} should come first – {o.reason}”</div></div>) })}
              <p className="tiny">Teammates are scripted (simulated) – their opinions are fixed. Think for yourself!</p>
            </div>
          )}
          <button className="btn primary" disabled={!choice || !talked} onClick={() => dispatch({ type: 'TEAM_VOTE', choice })}>{!talked ? 'Discuss first' : choice ? 'Cast my vote' : 'Pick an option'}</button>
        </div>
      )}
      {!open && !dec && <div className="card"><p className="notice">No open decision right now. A new decision appears at the start of each construction level, before the parts it affects are bought.</p></div>}
      {history.length > 0 && (
        <div className="card">
          <h3>📜 Final team decisions</h3>
          {history.map(([lvl, r]) => { const dd = DECISIONS[lvl]; const win = ITEMS[dd[r.result].target]; return (
            <div key={lvl} className="decision best"><b>Level {lvl}: {win.emoji} {win.name} first</b>
              <p>{team.members.map((m) => `${m.name}: ${r.votes[m.id] ? ITEMS[dd[r.votes[m.id]].target].name : '–'}`).join(' · ')}</p></div>) })}
          {dec && <p className="tiny">The instruction book and workshop now follow this order.</p>}
        </div>
      )}
    </div>
  )
}

export default function TeamLobby() {
  const { state, dispatch } = useGame()
  const [tab, setTab] = useState('lobby')
  if (!state.team) return <NoTeam />
  const team = state.team
  const tabs = [['lobby', '👫 Lobby'], ['contrib', '🏅 Contributions'], ['challenges', '🔬 Team challenges'], ['decisions', '🗳️ Decisions'], ['feed', '📣 Activity feed']]
  return (
    <div className="team-hub">
      <Banner state={state} />
      <div className="chips hub-tabs">{tabs.map(([id, l]) => <button key={id} className={`chip big ${tab === id ? 'sel' : ''}`} onClick={() => { setTab(id); dispatch({ type: 'CLEAR_FEEDBACK' }) }}>{l}</button>)}</div>
      {tab === 'lobby' && <Lobby state={state} />}
      {tab === 'contrib' && <Contributions state={state} />}
      {tab === 'challenges' && <TeamChallenges state={state} />}
      {tab === 'decisions' && <Decisions state={state} />}
      {tab === 'feed' && <div className="card"><ActivityFeed team={team} max={30} title="📣 Live team activity" /></div>}
      <div className="row center"><button className="btn primary huge" onClick={() => dispatch({ type: 'NAV', screen: 'dashboard' })}>Enter the space station →</button></div>
    </div>
  )
}
