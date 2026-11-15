import React, { useState } from 'react'
import { useGame } from '../state/GameContext.jsx'
import Spacecraft from '../components/Spacecraft.jsx'
import Astronaut from '../components/Astronaut.jsx'
import { Confetti } from '../components/ui.jsx'
import { Bar } from '../components/ui.jsx'
import { weightOf, scienceCount, computeScore, BADGES, certified, rankOf, experimentsDone } from '../state/game.js'
import { COMPONENTS, ITEMS, WEIGHT_LIMIT } from '../data/catalog.js'
import { CREW_BY_ID, SPECS } from '../data/crew.js'
import { ALL_CHALLENGES, EXPERIMENTS, LIFE_TOPICS } from '../data/mission.js'
import { CONCEPTS, SITES, OBSERVATIONS, WATER_QUESTIONS } from '../data/mars.js'
import { statsOf } from '../state/teamService.js'

const SHIP_COLORS = ['#7c5cff', '#ff5ca8', '#35d0ff', '#ff9f43', '#2fd88f', '#ffd166']
const TIPS = {
  knowledge: 'Re-read the Science Academy explanations and try the hints – they help you understand, not just answer.',
  design: 'Read each instruction-book step carefully before buying so you avoid wrong purchases, and keep an eye on total weight.',
  resources: 'Check fuel, energy, oxygen and water often, and avoid using the emergency fuel or rescue tow.',
  problems: 'In challenges, use the inspect tables and identify the problem first, then choose the safest action.',
  exploration: 'Visit every location, take photos, collect all three samples and return the rover before the battery runs low.',
}

export default function Report() {
  const { state, dispatch } = useGame()
  const [journey, setJourney] = useState(false)
  const [redo, setRedo] = useState(false)
  const [name, setName] = useState(state.shipName)
  const [color, setColor] = useState(state.shipColor)
  const m = state.mission, e = m.explore
  const res = m.result || computeScore(state)
  const { score, cats } = res
  const grade = score >= 85 ? 'Outstanding mission!' : score >= 65 ? 'Great mission!' : score >= 45 ? 'Good effort – you completed a Mars mission!' : 'A brave first mission – and a lot learned!'
  const sorted = [...cats].sort((a, b) => b.value - a.value)
  const best = sorted[0], weakest = sorted[sorted.length - 1]
  const team = state.team

  const comps = state.installed.map((id) => ITEMS[id]).filter(Boolean)
  const cost = comps.reduce((a, c) => a + c.price, 0)
  const refuels = state.tx.filter((t) => t.cat === 'fuel').length
  const chList = ALL_CHALLENGES.map((c) => ({ c, r: m.challenges[c.id] })).filter((x) => x.r)
  const solvedWell = chList.filter((x) => x.r.quality !== 'poor')
  const crew = state.crew.map((id) => CREW_BY_ID[id]).filter(Boolean)
  const bonusHelped = (a) => chList.filter((x) => x.r.bonus && x.c.skill === a.skill).map((x) => x.c.title.toLowerCase())
  const qEntries = Object.entries(e.q || {})
  const firstTry = qEntries.filter(([, n]) => n <= 1).length
  const visited = SITES.filter((s) => s.id !== 'base' && e.visited[s.id])
  const concepts = [...['terrain', 'samples', 'water'].filter((id) => e.acts[id]).flatMap((id) => CONCEPTS[id]), ...EXPERIMENTS.filter((id) => m.activities[id]).map((id) => ({ gravity: 'Microgravity: objects float because everything falls around Earth together', solar: 'Solar panels turn sunlight into electrical energy', planet: 'Mars has a thin atmosphere, is cold and has volcanoes and canyons' }[id])), ...LIFE_TOPICS.filter((t) => (m.lifeDone || {})[t.id]).map((t) => `Life in space: ${t.title.toLowerCase()}`)]
  const resourceRows = [['⛽ Fuel', state.pet.fuel], ['🔋 Energy', state.pet.energy], ['🫁 Oxygen', m.oxygen], ['💧 Water', m.water ?? 100]]
  const good = resourceRows.filter(([, v]) => v >= 50).map(([l]) => l)
  const improve = [
    ...chList.filter((x) => x.r.quality === 'poor').map((x) => `${x.c.title}: ${x.c.learn}`),
    ...(m.emergencyUsed ? ['You needed Mission Control’s emergency fuel – watch propellant earlier next time.'] : []),
    ...(m.coasted ? ['The spacecraft had to coast with almost no fuel – plan the fuel for every leg.'] : []),
    ...(e.towed ? ['The rover ran out of battery and was towed – return to recharge a little sooner.'] : []),
    TIPS[weakest.id],
  ]
  const buddyMsg = `${state.profile.name}, I am SO proud of us! ${best.emoji} Our best category was ${best.label.toLowerCase()} (${best.value}). ${chList[0] ? `I loved how we handled the ${chList.find((x) => x.r.quality === 'best')?.c.title.toLowerCase() || chList[0].c.title.toLowerCase()}. ` : ''}Next time, let's work on ${weakest.label.toLowerCase()} together – mistakes are how engineers learn!`
  const prev = (state.history || []).filter((h) => h.attempt < (res.attempt || 1))
  const lastPrev = prev[prev.length - 1]

  return (
    <div className="report">
      <Confetti once />
      <div className="card report-head">
        <Spacecraft installed={state.installed} expr="proud" color={state.shipColor} size={190} flame />
        <div>
          <small className="rp-kicker">MISSION REPORT · ATTEMPT {res.attempt || state.attempt || 1}</small>
          <h1>{team ? `Team “${team.name}” reached Mars!` : `${state.profile.name} reached Mars!`}</h1>
          <p className="big">Mission <b>{state.shipName}</b> · Destination: <b>Mars 🔴</b> · Status: {m.arrived ? '✅ Completed – arrived and explored' : 'In progress'}</p>
          <p className="tiny">Objective: build a spacecraft, choose and train a crew, travel from Earth to Mars and explore the surface. {m.finished ? 'The crew stays on Mars – this is the end of the prototype mission.' : ''}</p>
          <div className="score"><b>{score}</b><span>{team ? 'Team' : 'Final'} score · {grade}{lastPrev ? ` · ${score >= lastPrev.score ? '▲' : '▼'} ${Math.abs(score - lastPrev.score)} vs attempt ${lastPrev.attempt}` : ''}</span></div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <h3>📊 Score breakdown</h3>
          {cats.map((c) => <div key={c.id} className="cat-row"><div className="row between"><span>{c.emoji} {c.label}</span><b>{c.value}</b></div><Bar value={c.value} color={c.value >= 70 ? 'var(--green)' : c.value >= 45 ? 'var(--yellow)' : 'var(--orange)'} /></div>)}
          <p className="tiny">The score rewards learning, effort and good decisions – not just finishing. Answering correctly after a retry still earns points.</p>
        </div>
        <div className="card buddy-msg">
          <h3>💜 A message from {state.shipName}</h3>
          <p className="say-box">{buddyMsg}</p>
          <h4>🏅 Badges</h4>
          <div className="bdg-grid">{BADGES.map((b) => { const got = state.claimed?.[b.id]; const now = (res.badgesNow || []).includes(b.id); return <div key={b.id} className={`bdg ${got ? 'on' : ''}`}><span>{got ? b.emoji : '🔒'}</span><b>{b.name}</b><small>{b.desc}</small>{got && <em>{now ? `+${b.credits} credits (first time!)` : 'earned earlier – credits already paid'}</em>}</div> })}</div>
          <p className="tiny">Each badge pays its credits only once, so repeating an activity cannot farm credits.</p>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <h3>🛠️ Spacecraft performance</h3>
          <ul className="plain">
            <li>Components: <b>{comps.length}/{COMPONENTS.length}</b> installed · total cost <b>💰 {cost}</b></li>
            <li>Remaining credits: <b>💰 {state.balance}</b></li>
            <li>Mass: <b>{weightOf(state).toLocaleString()} kg</b> (limit {WEIGHT_LIMIT.toLocaleString()} kg – heavier spacecraft need more fuel)</li>
            <li>Refuelled {refuels} time{refuels === 1 ? '' : 's'}{m.emergencyUsed ? ' · used emergency fuel' : ''}{m.coasted ? ' · coasted on momentum once' : ''}</li>
            <li>Wrong purchases while building: {state.stats?.wrongBuys || 0}</li>
          </ul>
          <div className="mini-parts">{comps.map((c) => <span key={c.id} className="mini-part" title={c.name}>{c.emoji}</span>)}</div>
          <h4>Resources at the end</h4>
          {resourceRows.map(([l, v]) => <div key={l} className="cat-row"><div className="row between"><span>{l}</span><b>{Math.round(v)}%</b></div><Bar value={v} color={v >= 50 ? 'var(--green)' : v >= 30 ? 'var(--yellow)' : 'var(--red)'} /></div>)}
          <h4>Problems encountered</h4>
          {chList.length === 0 ? <p className="tiny">No problems recorded.</p> : <ul className="plain">{chList.map((x) => <li key={x.c.id}>{x.c.emoji} {x.c.title}: {x.r.quality === 'best' ? '🌟 solved well' : x.r.quality === 'ok' ? '👍 partly solved' : '💡 learning moment'} ({x.r.score}/100)</li>)}</ul>}
        </div>
        <div className="card">
          <h3>🧑‍🚀 Crew performance</h3>
          <div className="seats four">
            <div className="seat on cmdr"><Astronaut avatar={state.profile.avatar} color={state.profile.color} size={64} wave /><b>{state.profile.name}</b><small>⭐ Mission Commander{certified(state) ? ' · 🎖️ certified' : ''}</small></div>
            {crew.map((a) => <div key={a.id} className="seat on"><Astronaut face={a.initials} color={a.color} size={64} float /><b>{a.name.split(' ')[0]}</b><small>{SPECS[a.skill].emoji} {SPECS[a.skill].name}</small></div>)}
          </div>
          <ul className="plain">{crew.map((a) => { const h = bonusHelped(a); return <li key={a.id}>🎮 <b>{a.name}</b>: {h.length ? `the fictional gameplay bonus helped in ${h.join(', ')}.` : `no matching challenge needed this bonus (${SPECS[a.skill].bonus.toLowerCase()}) this time.`}</li> })}</ul>
          <p className="tiny">Gameplay bonuses are fictional game mechanics inspired by real expertise – not real abilities. Training: {rankOf(state.xp)} · {state.xp} XP.</p>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <h3>🔬 Scientific achievements</h3>
          <ul className="plain">
            <li>Experiments completed: <b>{experimentsDone(state)}/{EXPERIMENTS.length}</b> · science XP ⭐ {m.sciXp || 0}</li>
            <li>Exploration activities: {['terrain', 'samples', 'water'].filter((id) => e.acts[id]).length}/3 (terrain, samples, water)</li>
            <li>Locations explored: <b>{visited.length}/5</b>{visited.length ? ` (${visited.map((v) => v.name).join(', ')})` : ''}</li>
            <li>Samples collected (simulated): <b>{e.samples.length}</b> · photographs: <b>{e.photos.length}</b> · rover distance {e.distance} km</li>
            <li>Questions answered correctly: <b>{qEntries.length}/{Object.keys(OBSERVATIONS).length + 2 + WATER_QUESTIONS.length}</b> ({firstTry} on the first try) · Academy challenges: {scienceCount(state)}</li>
          </ul>
          <h4>Concepts you learned</h4>
          <div className="chips">{concepts.map((c) => <span key={c} className="chip">{c}</span>)}</div>
          <p className="tiny">All Mars samples and discoveries in this game are simulated for learning.</p>
        </div>
        <div className="card">
          <h3>🧠 Decision-making</h3>
          {m.decisions.length === 0 ? <p className="tiny">No decisions recorded.</p> : m.decisions.map((d) => <div key={d.title} className={`decision ${d.quality}`}><b>{d.title}</b><p>{d.choice}</p><small>{d.quality === 'best' ? '🌟 Best choice' : d.quality === 'ok' ? '👍 Good choice' : '💡 Learning opportunity'}{d.votes ? ' · decided by team vote' : ''}</small></div>)}
          <p><b>Problems solved well:</b> {solvedWell.length}/{chList.length} · <b>Resources managed successfully:</b> {good.length ? good.join(', ') : 'keep practising!'}</p>
          <h4>Areas to improve</h4>
          <ul className="plain">{improve.map((t) => <li key={t}>💡 {t}</li>)}</ul>
        </div>
      </div>

      {team && (
        <div className="card team-report">
          <h3>👫 Shared team report · “{team.name}” {team.emblem}</h3>
          <p>Team final score: <b>{score}</b> · shared badges: {BADGES.filter((b) => state.claimed?.[b.id]).map((b) => b.emoji + ' ' + b.name).join(', ') || 'none yet'}</p>
          <div className="contrib-grid">{team.members.map((mem) => { const st = statsOf(team, mem.id); return (
            <div key={mem.id} className="ccard"><div className="ahead"><Astronaut avatar={mem.avatar} color={mem.color} size={48} /><div><b>{mem.id === 'me' ? `${mem.name} (you)` : mem.name}</b><small>{mem.id === 'me' ? 'Mission Commander' : 'Simulated teammate'}</small></div></div>
              <ul className="cstats"><li><span>🔬 Science challenges</span><b>{st.sci}</b></li><li><span>💰 Credits earned</span><b>{st.earned}</b></li><li><span>🛠️ Parts bought</span><b>{st.bought.length}</b></li><li><span>🗳️ Decisions shared</span><b>{st.votes}</b></li><li><span>💡 Tips shared</span><b>{st.tips}</b></li></ul></div>) })}</div>
          <p className="tiny">Teammates are simulated characters saved on this device – no real-time multiplayer is connected.</p>
        </div>
      )}

      <div className="card">
        <h3>🚀 Next mission suggestions</h3>
        <ul className="plain">
          <li>Focus on <b>{weakest.label.toLowerCase()}</b>: {TIPS[weakest.id]}</li>
          <li>Try a different crew: each specialization gives a bonus in different challenges.</li>
          <li>Try a new strategy for fuel and energy, or a new spacecraft name and colour.</li>
          {prev.length > 0 && <li>Your earlier attempt scored {lastPrev.score}. Can you beat it?</li>}
        </ul>
        {(state.history || []).length > 0 && <><h4>Attempts</h4><div className="chips">{state.history.map((h) => <span key={h.attempt} className="chip">#{h.attempt} · {h.ship} · {h.score}</span>)}</div></>}
      </div>

      <div className="card">
        <div className="row between wrap"><h3>🗺️ Review your mission journey</h3><button className="btn small secondary" onClick={() => setJourney(!journey)}>{journey ? 'Hide' : 'Show'} journey</button></div>
        {journey && <div className="log" style={{ maxHeight: 'none' }}>{[...m.log].reverse().map((l, i) => <div key={i}><b>{l.t}</b> {l.text}</div>)}{m.log.length === 0 && <small>No journey notes saved.</small>}</div>}
      </div>

      <div className="card">
        <h3>What next?</h3>
        <div className="row center wrap">
          <button className="btn secondary" onClick={() => dispatch({ type: 'NAV', screen: 'dashboard' })}>🛰️ Revisit my spacecraft</button>
          <button className="btn primary" onClick={() => dispatch({ type: 'REPLAY', mode: 'same' })}>🔁 Fly again – same spacecraft, new strategy</button>
          <button className="btn primary" onClick={() => setRedo(!redo)}>🛠️ Redesign & fly again</button>
          <button className="btn danger" onClick={() => { if (window.confirm('Start a brand new game? Your current progress will be erased.')) dispatch({ type: 'RESET' }) }}>🔄 Restart the whole game</button>
        </div>
        {redo && (
          <div className="subcard">
            <p className="tiny">Your component purchases are refunded and you rebuild from Level 1 (e.g. try different team decisions, a new name or colour, or a new crew). Badges and credits already earned are not paid twice.</p>
            <label className="lbl">New spacecraft name</label><input className="input" value={name} maxLength={16} onChange={(e2) => setName(e2.target.value)} />
            <div className="chips">{SHIP_COLORS.map((c) => <button key={c} className={`swatch ${color === c ? 'sel' : ''}`} style={{ background: c }} onClick={() => setColor(c)} aria-label={`colour ${c}`} />)}</div>
            <button className="btn primary" onClick={() => dispatch({ type: 'REPLAY', mode: 'redesign', name: name.trim() || state.shipName, color })}>Refund & start rebuilding</button>
          </div>
        )}
      </div>
    </div>
  )
}
