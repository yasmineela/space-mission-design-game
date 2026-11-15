import React, { useState } from 'react'
import { useGame } from '../state/GameContext.jsx'
import { TIERS, HINT_COST, REASONS } from '../data/academy.js'
import { Confetti } from './ui.jsx'

// Reusable quiz question used in several places.
export function Choice({ q, options, onPick, art, disabledSet = [], picked = null, correct = null }) {
  return (
    <div className="qa q-card">
      {art && <div className="q-art">{art}</div>}
      <h3 className="q">{q}</h3>
      <div className="opts">
        {options.map((o, i) => (
          <button key={i} disabled={disabledSet.includes(i)} className={`opt o${i} ${picked === i ? (correct ? 'right' : 'wrong shake') : ''}`} onClick={() => onPick(i)}>
            <span className="letter">{['▲', '●', '■', '◆'][i] || String.fromCharCode(65 + i)}</span>{o}
          </button>
        ))}
      </div>
    </div>
  )
}

function SolarSlider({ value, goal }) {
  const sun = 120
  const diff = Math.abs(value - sun)
  const power = Math.max(0, Math.round(Math.cos((diff * Math.PI) / 180) * 100))
  return (
    <div className="gadget">
      <svg viewBox="0 0 300 160" className="gsvg">
        <g transform={`rotate(${-(sun - 90)} 150 130)`}><circle cx="150" cy="22" r="14" fill="#ffd166" /><path d="M150 40v40" stroke="#ffd166" strokeDasharray="4 5" strokeWidth="3" /></g>
        <g transform={`rotate(${value - 90} 150 120)`}><rect x="110" y="114" width="80" height="12" rx="4" fill="#2d5bff" stroke="#9db8ff" strokeWidth="2" /></g>
        <rect x="140" y="124" width="20" height="26" fill="#9aa0b8" rx="4" />
      </svg>
      <div className="meter"><div className="meter-fill" style={{ width: power + '%', background: power > 95 ? 'var(--green)' : 'var(--yellow)' }} /><span>⚡ Power: {power}%</span></div>
    </div>
  )
}
function ThrustSlider({ value }) {
  const thrust = value * 20, weight = 60
  const lifts = thrust > weight
  return (
    <div className="gadget">
      <div className={`rocket-pad ${lifts ? 'lift' : ''}`}><span className="r">🚀</span><div className="engs">{Array.from({ length: value }, (_, i) => <i key={i}>🔥</i>)}</div></div>
      <div className="meter"><span>Thrust {thrust} {lifts ? '>' : thrust === weight ? '=' : '<'} Weight {weight} → {lifts ? 'LIFT-OFF!' : 'stays on the pad'}</span></div>
    </div>
  )
}

function SliderActivity({ act, onResult, disabled }) {
  const [v, setV] = useState(act.init)
  const [res, setRes] = useState(null)
  const check = () => { const ok = v >= act.goal[0] && v <= act.goal[1]; setRes(ok); onResult(ok) }
  return (
    <div className="qa">
      <h3 className="q">{act.q}</h3>
      {act.kind === 'solar' ? <SolarSlider value={v} /> : <ThrustSlider value={v} />}
      <input className="slider" type="range" min={act.min} max={act.max} step={act.step} value={v} onChange={(e) => { setV(+e.target.value); setRes(null) }} disabled={disabled} aria-label="adjust" />
      <div className="row center"><b>{act.kind === 'solar' ? `Panel angle: ${v}°` : `Engines: ${v}`}</b></div>
      <div className="row center"><button className="btn primary" onClick={check} disabled={disabled}>Lock in my answer</button></div>
      {res === false && <p className="feedback wrongfb">{act.kind === 'thrust'
        ? (v * 20 <= 60 ? `With ${v} engine${v > 1 ? 's' : ''} the thrust is ${v * 20}. To lift off, thrust must be BIGGER than the weight (60) – equal is not enough. Try more engines.` : `${v} engines would lift off, but the question asks for the SMALLEST number that works. Can you lift off with fewer?`)
        : `The panel is making ${Math.max(0, Math.round(Math.cos(((v - 120) * Math.PI) / 180) * 100))}% of its possible power. Watch the meter as you turn the panel – it rises as the panel faces the Sun more directly.`}</p>}
    </div>
  )
}

function MatchActivity({ act, onResult, disabled }) {
  const [place, setPlace] = useState({}) // clueIndex -> pairIndex
  const [sel, setSel] = useState(null)
  const [wrong, setWrong] = useState([])
  const order = React.useMemo(() => act.pairs.map((_, i) => i).sort((a, b) => ((a * 7 + 3) % 5) - ((b * 7 + 3) % 5)), [act])
  const used = Object.values(place)
  const put = (ci, pi) => { setPlace((p) => ({ ...p, [ci]: pi })); setSel(null); setWrong([]) }
  const drop = (ci, e) => { e.preventDefault(); const pi = +e.dataTransfer.getData('text/plain'); if (!Number.isNaN(pi)) put(ci, pi) }
  const check = () => {
    const bad = act.pairs.map((_, i) => i).filter((i) => place[i] !== i)
    setWrong(bad)
    onResult(bad.length === 0)
  }
  return (
    <div className="qa">
      <h3 className="q">{act.q}</h3>
      <p className="tiny center">Drag a card onto a clue (or tap a card, then tap a clue).</p>
      <div className="match">
        <div className="match-cards">
          {order.map((pi) => (
            <button key={pi} disabled={used.includes(pi) || disabled} draggable={!used.includes(pi)} onDragStart={(e) => e.dataTransfer.setData('text/plain', String(pi))} className={`mcard ${sel === pi ? 'sel' : ''}`} onClick={() => setSel(sel === pi ? null : pi)}>{act.pairs[pi].label}</button>
          ))}
        </div>
        <div className="match-targets">
          {act.pairs.map((p, ci) => (
            <div key={ci} className={`mtarget ${wrong.includes(ci) ? 'bad' : ''} ${place[ci] !== undefined && wrong.length && !wrong.includes(ci) ? 'good' : ''}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => drop(ci, e)} onClick={() => sel !== null && put(ci, sel)}
              {...(place[ci] === undefined ? { role: 'button', tabIndex: 0, 'aria-label': `Match target: ${p.clue}. Choose a card first, then press Enter here to place it.`, onKeyDown: (e) => { if ((e.key === 'Enter' || e.key === ' ') && sel !== null) { e.preventDefault(); put(ci, sel) } } } : {})}>
              <span className="clue">{p.clue}</span>
              <span className="slot">{place[ci] !== undefined ? <button className="mcard in" onClick={(e) => { e.stopPropagation(); setPlace((q) => { const n = { ...q }; delete n[ci]; return n }); setWrong([]) }}>{act.pairs[place[ci]].label} ✕</button> : 'drop here'}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="row center"><button className="btn primary" disabled={Object.keys(place).length < act.pairs.length || disabled} onClick={check}>Check my matches</button></div>
      {wrong.length > 0 && <p className="feedback wrongfb">Some matches are not right yet (marked in red). Tap a card to remove it and try again!</p>}
    </div>
  )
}

export default function ActivityRunner({ act, onBack, team }) {
  const { state, dispatch } = useGame()
  const [shownHints, setShownHints] = useState([])
  const [tips, setTips] = useState([]) // free tips from teammates (one each)
  const [result, setResult] = useState(null) // 'right'
  const [picked, setPicked] = useState(null)
  const [wrongs, setWrongs] = useState(0)
  const [reasonPick, setReasonPick] = useState(null)
  const [wasDone] = useState(!!state.academy.done[act.id])
  const done = wasDone
  const reward = TIERS[act.tier].reward
  const canHint = done || state.balance >= HINT_COST // hints are free when practising a completed activity
  const hintCount = state.academy.hints[act.id] || 0
  const finished = result === 'right'

  const useHint = () => {
    if (!canHint) return dispatch({ type: 'HINT', id: act.id }) // shows "need credits" feedback
    const clue = act.hints[shownHints.length % act.hints.length]
    dispatch({ type: 'HINT', id: act.id })
    setShownHints((h) => [...h, clue])
  }
  const onResult = (ok) => {
    dispatch({ type: 'ANSWER', id: act.id, correct: ok })
    if (ok) setResult('right')
  }
  const pick = (i) => { setPicked(i); if (i !== act.answer) setWrongs((n) => n + 1); onResult(i === act.answer) }
  const reasons = REASONS[act.id]

  return (
    <div className="card activity">
      <div className="row between wrap">
        <button className="btn ghost small" onClick={onBack}>← Back to Academy</button>
        <span className="pill price">{done && !finished ? '✔ Already completed – practice mode (no credits)' : `Reward: 💰 ${reward} credits`}</span>
      </div>
      {act.type === 'mcq' && <Choice q={act.q} options={act.options} art={act.art} onPick={pick} picked={picked} correct={finished} disabledSet={finished ? act.options.map((_, i) => i) : []} />}
      {act.type === 'slider' && <SliderActivity act={act} onResult={onResult} disabled={finished} />}
      {act.type === 'match' && <MatchActivity act={act} onResult={onResult} disabled={finished} />}
      {picked !== null && !finished && act.type === 'mcq' && (
        <p className="feedback wrongfb" role="status">🤔 Not quite – “{act.options[picked]}” is not the answer. No credits lost!<br />🧭 <b>Coach clue:</b> {act.hints[(wrongs - 1) % act.hints.length]}</p>
      )}
      {finished && (
        <div className="feedback ok celebrate" role="status">
          {!done && <Confetti once />}
          {team && !done && <b>👫 Solved together! The shared team bank earns the reward. </b>}
          <b>🎉 Correct!</b> {act.explain}
          {!done && <div className="reward-pop">+{reward} 💰</div>}
          {reasons && (
            <div className="reason-box">
              <h4>🧪 Investigate: how do you know?</h4>
              <p className="tiny">Bonus thinking for scientists – no credits, no risk. Which statement is the best evidence for your answer?</p>
              <div className="opts">{reasons.map((r, i) => <button key={i} className={`opt o${i} ${reasonPick === i ? (r.ok ? 'right' : 'wrong shake') : ''}`} disabled={reasonPick !== null && reasons[reasonPick].ok} onClick={() => setReasonPick(i)}><span className="letter">{['▲', '●', '■', '◆'][i]}</span>{r.t}</button>)}</div>
              {reasonPick !== null && <p className={`feedback ${reasons[reasonPick].ok ? 'ok' : 'wrongfb'}`}>{reasons[reasonPick].ok ? '🌟 Great scientific reasoning! ' : '🤔 Not quite. '}{reasons[reasonPick].why}</p>}
            </div>
          )}
          <div className="row"><button className="btn primary small" onClick={onBack}>Next challenge</button></div>
        </div>
      )}
      {team && !finished && (
        <div className="team-tips">
          <b>👫 Teammates can help (free, one tip each)</b>
          <div className="chips">{team.members.filter((m) => m.id !== 'me').map((m) => (
            <button key={m.id} className="chip" disabled={tips.some((t) => t.id === m.id)} onClick={() => { setTips([...tips, { id: m.id, name: m.name, text: act.hints[tips.length % act.hints.length] }]); dispatch({ type: 'TEAM_TIP', who: m.id }) }}>💬 Ask {m.name}</button>))}</div>
          {tips.map((t) => <div key={t.id} className="hint-line">💬 {t.name}: {t.text}</div>)}
          {finished && null}
        </div>
      )}
      {!finished && (
        <div className="hint-box">
          <button className="btn hint" onClick={useHint}>💡 HINT <span className="cost">{done ? '(free while practising)' : `(costs ${HINT_COST} credits)`}</span></button>
          {!canHint && <small className="warn-text"> You have {state.balance} credits – earn more first!</small>}
          {hintCount > 0 && <small> · hints used: <span className="bulbs">{'💡'.repeat(Math.min(hintCount, 6))}</span></small>}
          {shownHints.map((h, i) => <div key={i} className="hint-line">💡 {h}</div>)}
        </div>
      )}
      {state.feedback?.kind === 'poor' && !finished && <div className="feedback poor">💸 {state.feedback.text}</div>}
    </div>
  )
}
