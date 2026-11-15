import React, { useEffect, useRef, useState } from 'react'
import { useGame } from '../state/GameContext.jsx'
import Spacecraft from '../components/Spacecraft.jsx'
import { useExpression } from '../components/Companion.jsx'
import { Bar, PartArt } from '../components/ui.jsx'
import { ITEMS, LEVELS, COMPONENTS, DECOYS, WEIGHT_LIMIT, ESSENTIALS, compsOfLevel } from '../data/catalog.js'
import { weightOf, requiredFuel, constructionPct, stepIndex, stepsOf } from '../state/game.js'

export function marketFor(state) {
  const lv = LEVELS[state.level - 1]
  const idx = stepIndex(state)
  if (state.level === 3) {
    const step = stepsOf(state)[idx]
    return step ? step.options.map((id) => ITEMS[id]).filter((i) => !state.installed.includes(i.id)) : []
  }
  const decoys = DECOYS.filter((d) => d.level === state.level)
  return [...compsOfLevel(state.level), ...decoys].filter((i) => !state.installed.includes(i.id))
}

export default function Workshop() {
  const { state, dispatch } = useGame()
  const expr = useExpression()
  const [burst, setBurst] = useState(0)
  const fb = state.feedback
  const src = useRef(null)
  const shipBox = useRef(null)
  // a purchased component flies from the shop to the spacecraft and attaches
  useEffect(() => {
    if (fb?.kind !== 'ok') return
    setBurst(fb.id)
    const s = src.current, target = shipBox.current?.querySelector('svg')
    if (!s || !target || !s.rect || !s.item) return
    const tr = target.getBoundingClientRect()
    const el = document.createElement('div')
    el.className = 'flying-part'
    el.textContent = s.item.emoji
    el.style.cssText = `left:${s.rect.left}px;top:${s.rect.top}px;width:${s.rect.width}px;height:${s.rect.height}px;background:radial-gradient(circle at 30% 25%,#fff8,${s.item.color})`
    document.body.appendChild(el)
    const dx = tr.left + tr.width / 2 - (s.rect.left + s.rect.width / 2), dy = tr.top + tr.height * 0.55 - (s.rect.top + s.rect.height / 2)
    const anim = el.animate([
      { transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1 },
      { transform: `translate(${dx * 0.5}px,${dy * 0.5 - 80}px) scale(1.5) rotate(160deg)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px,${dy}px) scale(.35) rotate(360deg)`, opacity: 0.2 },
    ], { duration: 850, easing: 'cubic-bezier(.4,.1,.3,1)', fill: 'forwards' })
    anim.onfinish = () => el.remove()
    const kill = setTimeout(() => el.remove(), 1100) // safety net so a tile can never get stuck
    return () => { clearTimeout(kill); setTimeout(() => el.remove(), 900) }
  }, [fb?.id])
  const lv = LEVELS[state.level - 1]
  const levelDone = state.levelsDone.includes(state.level)
  const idx = stepIndex(state)
  const stepList = stepsOf(state)
  const step = stepList[idx]
  const market = marketFor(state)
  const weight = weightOf(state)
  const need = requiredFuel(state)
  const allBought = state.installed.length === COMPONENTS.length
  const checks = ESSENTIALS.map((e) => ({ ...e, ok: state.installed.includes(e.id) }))
  const missing = step ? ITEMS[step.target].price - state.balance : 0
  const stepText = !step ? null : state.level === 1 ? step.text : state.level === 2 ? step.text : step.text
  return (
    <div className="workshop">
      <aside className="card market">
        <h3>🛒 Component Marketplace</h3>
        <p className="tiny">{state.level === 3 ? 'Mission decision: pick the best option for this requirement.' : state.level === 2 ? 'Read each description and match it to the instruction.' : 'Buy the part named in your instruction book.'}</p>
        {market.length === 0 && <p className="notice">{allBought ? '✅ Everything is bought! Run FINAL ASSEMBLY.' : 'No parts available.'}</p>}
        <div className="market-list">
          {market.map((it) => (
            <div key={it.id} className={`item ${step && it.id === step.target && state.level === 1 ? 'is-target' : ''}`}>
              <PartArt id={it.id} />
              <div className="item-body">
                <b>{it.name}</b>
                <p>{it.desc}</p>
                <div className="item-meta"><span className="pill price">💰 {it.price}</span><span className="pill">⚖️ {it.weight} kg</span></div>
              </div>
              <button className={`btn small ${state.balance >= it.price ? 'primary' : 'secondary'}`} onClick={(e) => { src.current = { item: it, rect: e.currentTarget.closest('.item').querySelector('.part-art').getBoundingClientRect() }; dispatch({ type: 'BUY', id: it.id }) }}>Buy</button>
            </div>
          ))}
        </div>
      </aside>

      <section className="card stage bay">
        {step && (
          <div className="step-banner">
            <small>{lv.tag} · STEP {idx + 1} OF {stepList.length}</small>
            <p>{stepText}</p>
            <button className="btn small ghost" onClick={() => dispatch({ type: 'NAV', screen: 'book' })}>📖 Open instruction book</button>
          </div>
        )}
        {!step && !state.assembled && <div className="step-banner"><small>ALL PARTS BOUGHT</small><p>Every component is installed! Run the final assembly check below.</p></div>}
        <div className="stage-ship" key={burst} ref={shipBox}>
          <div className="scanner" />
          {burst > 0 && <div className="sparkle-burst">✨⭐✨</div>}
          <Spacecraft installed={state.installed} expr={expr} color={state.shipColor} energy={state.pet.energy} damaged={state.pet.damaged} ghostLevel={levelDone ? null : state.level} target={step?.target} size={280} flame={state.assembled} />
        </div>
        {!allBought && (
          <div className="slot-row" aria-label="Component slots">
            {stepList.map((st, i) => { const it = ITEMS[st.target]; const on = state.installed.includes(st.target); return <div key={st.target} className={`slot ${on ? 'on' : ''} ${i === idx && !levelDone ? 'next' : ''}`} title={on ? it.name : 'Empty slot'}><span style={on ? { background: it.color } : undefined}>{on ? it.emoji : '＋'}</span><small>{on ? it.name.split(' ')[0] : `Slot ${i + 1}`}</small></div> })}
          </div>
        )}
        {fb && <div className={`feedback ${fb.kind}`} role="status">{fb.kind === 'ok' ? '🎉 ' : fb.kind === 'poor' ? '💸 ' : '🤔 '}{fb.text}{fb.kind === 'poor' && <button className="btn small primary" onClick={() => dispatch({ type: 'NAV', screen: 'academy' })}>Go to the Science Academy</button>}</div>}
        {allBought && !state.assembled && (
          <div className="assembly">
            <h4>🔧 FINAL ASSEMBLY CHECK</h4>
            <ul className="checks">
              <li className={weight <= WEIGHT_LIMIT ? 'ok' : 'bad'}>Total weight {weight.toLocaleString()} kg is within the {WEIGHT_LIMIT.toLocaleString()} kg launch limit</li>
              {checks.map((c) => <li key={c.id} className={c.ok ? 'ok' : 'bad'}>{c.label} installed</li>)}
            </ul>
            <button className="btn primary huge" disabled={weight > WEIGHT_LIMIT} onClick={() => dispatch({ type: 'ASSEMBLE' })}>🔧 ASSEMBLE MY SPACECRAFT</button>
          </div>
        )}
        {state.assembled && <div className="assembly done"><h4>✅ Spacecraft assembled!</h4><p>Next: recruit your astronaut crew.</p><button className="btn primary" onClick={() => dispatch({ type: 'NAV', screen: 'crew' })}>Choose my crew →</button></div>}
      </section>

      <aside className="card side-stats">
        <div className="balance">💰 {state.balance}<small>credits</small></div>
        {step && missing > 0 && <p className="tiny warn-text">Next part needs {missing} more credits.</p>}
        <div className="trade">
          <h4>⚖️ Physical trade-off</h4>
          <Bar value={(weight / WEIGHT_LIMIT) * 100} color={weight > WEIGHT_LIMIT * 0.85 ? 'var(--orange)' : 'var(--cyan)'} icon="⚖️" label={`Mass ${weight.toLocaleString()} / ${WEIGHT_LIMIT.toLocaleString()} kg`} />
          <p className="tiny">Fuel needed to reach Mars: <b>{need}</b> units{state.installed.includes('adv_prop') ? ' (efficient engine helps!)' : ''}.</p>
          <p className="tip">Adding more equipment increases your spacecraft's weight. A heavier spacecraft generally requires more propellant to accelerate.</p>
        </div>
        <div className="trade">
          <h4>💰 Financial trade-off</h4>
          <p className="tip">Credits are limited. Parts, fuel, repairs and hints all cost credits, so spend them wisely.</p>
        </div>
        <div className="trade">
          <h4>🧩 Technical: essential systems</h4>
          <ul className="checks small">{checks.map((c) => <li key={c.id} className={c.ok ? 'ok' : 'todo'}>{c.label}</li>)}</ul>
        </div>
        <div className="progress-box">
          <div className="row between"><span>Installed</span><b>{state.installed.length} / {COMPONENTS.length}</b></div>
          <div className="row between"><span>Construction</span><b>{constructionPct(state)}%</b></div>
          <Bar value={(state.installed.length / COMPONENTS.length) * 100} color="var(--green)" />
        </div>
        <div className="installed-list">
          <h4>Installed parts</h4>
          <div className="mini-parts">{state.installed.length === 0 ? <small>Only the core so far.</small> : state.installed.map((id) => <span key={id} title={ITEMS[id].name} className="mini-part">{ITEMS[id].emoji}</span>)}</div>
        </div>
      </aside>
    </div>
  )
}
