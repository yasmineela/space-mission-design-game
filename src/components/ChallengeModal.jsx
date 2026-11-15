import React, { useState } from 'react'
import { useGame } from '../state/GameContext.jsx'
import { Modal } from './ui.jsx'
import Astronaut from './Astronaut.jsx'
import { ALL_CHALLENGES } from '../data/mission.js'
import { CREW_BY_ID, SKILL_LABEL, SPECS } from '../data/crew.js'
import { crewHas } from '../state/game.js'

// Scripted (simulated) teammate votes: some teammates choose the best option, others a cautious one.
function teamVote(state, ch, mine) {
  const best = ch.options.findIndex((o) => o.q === 'best')
  const ok = ch.options.findIndex((o) => o.q === 'ok')
  const votes = { me: mine }
  state.team.members.filter((m) => m.id !== 'me').forEach((m, k) => { votes[m.id] = (k % 2 === 1 && ok >= 0) ? ok : best })
  const tally = {}
  Object.values(votes).forEach((v) => { tally[v] = (tally[v] || 0) + 1 })
  const max = Math.max(...Object.values(tally))
  const top = Object.keys(tally).filter((k) => tally[k] === max).map(Number)
  const winner = top.length === 1 ? top[0] : votes[state.team.hostId || 'me'] // ties: the captain decides
  return { votes, winner, tie: top.length > 1 }
}

export default function ChallengeModal({ id, onClose }) {
  const { state, dispatch } = useGame()
  const ch = ALL_CHALLENGES.find((c) => c.id === id)
  const [showInspect, setShowInspect] = useState(false)
  const [identified, setIdentified] = useState(!ch.identify)
  const [idPick, setIdPick] = useState(null)
  const [mistakes, setMistakes] = useState(0)
  const [chosen, setChosen] = useState(null)
  const [vote, setVote] = useState(null)
  const [final, setFinal] = useState(null)
  const helper = crewHas(state, ch.skill) ? state.crew.map((c) => CREW_BY_ID[c]).filter(Boolean).find((a) => a.skill === ch.skill) : null
  const firstPoor = ch.options.findIndex((o) => o.q === 'poor')
  const eliminated = helper ? firstPoor : -1
  const team = state.team
  const result = final !== null ? ch.options[final] : null
  const done = state.mission.challenges[id]

  const pick = (i) => {
    if (team) { setChosen(i); setVote(teamVote(state, ch, i)); return }
    setChosen(i); setFinal(i); dispatch({ type: 'CHALLENGE', id, option: i, mistakes })
  }
  const followTeam = () => { setFinal(vote.winner); dispatch({ type: 'CHALLENGE', id, option: vote.winner, mistakes, votes: vote.votes }) }
  const afford = (o) => !(o.fx?.credits && o.fx.credits < 0 && state.balance < -o.fx.credits)

  return (
    <Modal wide className="challenge-modal">
      <h2>{ch.emoji} {ch.title}</h2>
      <p className="big">{ch.story}</p>
      <p className="why">💡 <b>Why it matters:</b> {ch.why}</p>
      {ch.inspect && (
        <div className="inspect">
          <button className="btn small secondary" onClick={() => setShowInspect(!showInspect)}>{showInspect ? 'Hide' : ch.inspect.title}</button>
          {showInspect && <table className="datatable"><tbody>{ch.inspect.rows.map(([a, b, st]) => <tr key={a} className={`row-${st}`}><td>{a}</td><td><b>{b}</b></td></tr>)}</tbody></table>}
          {showInspect && <small>{ch.inspect.note}</small>}
        </div>
      )}
      {helper && final === null && <p className="notice">🎮 GAMEPLAY BONUS (fictional): <b>{helper.name}</b> ({SPECS[helper.skill].name}) rules out one bad option and adds +20% to your score. It helps, but you still have to choose well!</p>}
      {!helper && final === null && <p className="tiny">No one on your crew specialises in {SKILL_LABEL[ch.skill]}, so think carefully!</p>}

      {!identified && (
        <div>
          <h4>{ch.identify.q}</h4>
          <div className="opts">{ch.identify.options.map((o, i) => (
            <button key={i} className={`opt o${i} ${idPick === i ? (o.ok ? 'right' : 'wrong shake') : ''}`} disabled={idPick !== null && ch.identify.options[idPick].ok} onClick={() => { setIdPick(i); if (o.ok) setIdentified(true); else setMistakes((m) => m + 1) }}>
              <span className="letter">{['▲', '●', '■', '◆'][i]}</span>{o.t}</button>))}</div>
          {idPick !== null && <div className={`feedback ${ch.identify.options[idPick].ok ? 'ok' : 'wrongfb'}`}>{ch.identify.options[idPick].why}{!ch.identify.options[idPick].ok && ' Try again – no harm done!'}</div>}
        </div>
      )}
      {identified && ch.identify && idPick !== null && final === null && !vote && <div className="feedback ok">✅ {ch.identify.options[idPick].why} Now choose what to do:</div>}

      {identified && !vote && final === null && (
        <div className="opts">
          {ch.options.map((o, i) => (
            <button key={i} className={`opt o${i}`} disabled={i === eliminated || !afford(o)} onClick={() => pick(i)}>
              <span className="letter">{['▲', '●', '■', '◆'][i]}</span>{o.t}
              {i === eliminated && <em> – ruled out by {helper.name}</em>}{!afford(o) && <em> – not enough credits</em>}
            </button>))}
        </div>
      )}

      {vote && final === null && (
        <div className="vote-card">
          <h4>🗳️ Team vote (simulated teammates)</h4>
          {team.members.map((m) => (
            <div key={m.id} className="bubble-row"><Astronaut avatar={m.avatar} color={m.color} size={36} /><div className="said"><b>{m.id === 'me' ? 'You' : m.name}:</b> “{ch.options[vote.votes[m.id]].t}”</div></div>))}
          <p className="tiny">{vote.tie ? `The vote was split, so the team captain (${state.team.members.find((m) => m.id === (state.team.hostId || 'me'))?.name}) decides.` : vote.winner === chosen ? 'Your choice won the vote!' : 'The team chose a different action – teamwork means compromise.'}</p>
          <button className="btn primary" onClick={followTeam}>Follow the team decision</button>
        </div>
      )}

      {result && (
        <div className={`feedback ${result.q === 'best' ? 'ok' : result.q === 'ok' ? 'okish' : 'wrongfb'}`}>
          <b>{result.q === 'best' ? '🌟 Excellent decision!' : result.q === 'ok' ? '👍 Good effort!' : '💡 Learning moment!'}</b> {result.res}
          <p className="tiny">Consequence: {[result.fx.energy && `energy ${result.fx.energy > 0 ? '+' : ''}${result.fx.energy}`, result.fx.fuel && `fuel ${result.fx.fuel > 0 ? '+' : ''}${result.fx.fuel}`, result.fx.oxygen && `oxygen ${result.fx.oxygen > 0 ? '+' : ''}${result.fx.oxygen}`, result.fx.health && `health ${result.fx.health > 0 ? '+' : ''}${result.fx.health}`, result.fx.credits && `credits ${result.fx.credits}`].filter(Boolean).join(' · ') || 'no resources lost'}. Score: {done?.score ?? '…'}/100{done?.bonus ? ' (includes the +20% crew bonus)' : ''}.</p>
          <p className="tiny">📘 {ch.learn} Unsuccessful decisions are learning opportunities, not punishments – the mission goes on!</p>
          <div className="row"><button className="btn primary" onClick={onClose}>Continue the mission</button></div>
        </div>
      )}
    </Modal>
  )
}
