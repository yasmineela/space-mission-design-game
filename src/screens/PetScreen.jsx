import React, { useMemo, useState } from 'react'
import { useGame } from '../state/GameContext.jsx'
import PetShip from '../components/PetShip.jsx'
import PetStats, { moodLine } from '../components/PetStats.jsx'
import FloatArena from '../components/FloatArena.jsx'
import { ITEMS } from '../data/catalog.js'
import { FUEL_PRICE, FUEL_AMOUNT, REPAIR_PRICE, MAINTAIN_PRICE, requiredFuel } from '../state/game.js'

// Each interaction teaches one idea from space engineering.
const FACTS = {
  refuel: [
    'Propellant is the "fuel" a rocket throws out of its engine. Pushing it backwards pushes the rocket forwards – that push is called thrust.',
    'A heavier spacecraft needs more propellant to speed up. That is why engineers try to keep every part as light as possible.',
    'Most rockets carry both fuel AND oxidiser, because there is no air in space to burn fuel with.',
  ],
  recharge: [
    'Solar panels turn sunlight into electrical energy. They work best when they face the Sun directly.',
    'Batteries store electricity for when the spacecraft is in shadow, like behind a planet.',
    'Far from the Sun, sunlight is much weaker. At Mars it is only about 43% as strong as at Earth.',
  ],
  repair: [
    'Spacecraft are built from many components, each with its own job: engine, tank, antenna, power… Engineers find the faulty one and fix only that part.',
    'Engineers use sensors to tell them which component is not working, just like the red blinking light on me!',
    'Many spacecraft carry spare parts or backup systems so a single broken component does not end the mission.',
  ],
  maintain: [
    'Astronauts follow inspection checklists to check every system regularly – small problems are fixed before they become big ones.',
    'On the space station, crew spend hours each week cleaning air filters and checking equipment.',
    'Keeping a spacecraft clean matters: dust can clog vents and make electronics overheat.',
  ],
  play: [
    'In microgravity nothing falls down! Objects float and keep moving in a straight line until they bump into something.',
    'Astronauts are not really "weightless" – they are in free-fall around Earth, falling together with their spacecraft.',
    'Our solar system has 8 planets. Mars is the fourth from the Sun and has the biggest volcano of all, Olympus Mons.',
  ],
}
const MEMORY = [['🌍', 'Earth – our home, with liquid water.'], ['🔴', 'Mars – the Red Planet, our destination!'], ['🪐', 'Saturn – famous for its bright rings.'], ['☀️', 'The Sun – a star that gives us light and energy.']]

function Recharge({ onDone }) {
  const [a, setA] = useState(20)
  const power = Math.max(0, Math.round(Math.cos(((a - 120) * Math.PI) / 180) * 100))
  const ok = power >= 95
  return (
    <div>
      <p>☀️ Turn the solar panel to face the Sun (coming from the upper right), then charge my battery!</p>
      <div className="gadget">
        <svg viewBox="0 0 300 160" className="gsvg">
          <g transform="rotate(-30 150 130)"><circle cx="150" cy="22" r="14" fill="#ffd166" /><path d="M150 40v40" stroke="#ffd166" strokeDasharray="4 5" strokeWidth="3" /></g>
          <g transform={`rotate(${a - 90} 150 120)`}><rect x="110" y="114" width="80" height="12" rx="4" fill="#2d5bff" stroke="#9db8ff" strokeWidth="2" /></g>
          <rect x="140" y="124" width="20" height="26" fill="#9aa0b8" rx="4" />
        </svg>
        <div className="meter"><div className="meter-fill" style={{ width: power + '%', background: ok ? 'var(--green)' : 'var(--yellow)' }} /><span>⚡ Solar power: {power}%</span></div>
      </div>
      <input className="slider" type="range" min="0" max="180" value={a} onChange={(e) => setA(+e.target.value)} aria-label="panel angle" />
      <div className="row center"><button className="btn primary" disabled={!ok} onClick={onDone}>⚡ Charge battery (+25 energy)</button></div>
      {!ok && <p className="tiny center">Point the panel at the Sun to reach about 100% power.</p>}
    </div>
  )
}

function Repair({ state, dispatch }) {
  const [msg, setMsg] = useState('')
  const [wrong, setWrong] = useState(0)
  const dmg = state.pet.damaged
  if (!dmg) return <p className="notice good">✅ Nothing is damaged. All my components are working perfectly!</p>
  const pick = (id) => {
    if (id === dmg) { dispatch({ type: 'REPAIR' }); setMsg(''); setWrong(0) }
    else { setWrong(wrong + 1); setMsg(`The ${ITEMS[id].name} is working fine. ${wrong >= 1 ? 'Look at my picture – one part is blinking red!' : 'Which part is it?'}`) }
  }
  return (
    <div>
      <p>🔧 <b>Something is wrong with my {ITEMS[dmg].name}!</b> Can you find the broken component? (The damaged part blinks red on my body.) Repair costs 💰 {REPAIR_PRICE}.</p>
      <div className="chips">{state.installed.map((id) => <button key={id} className="chip" onClick={() => pick(id)}>{ITEMS[id].emoji} {ITEMS[id].name}</button>)}</div>
      {msg && <p className="feedback wrongfb">{msg}</p>}
    </div>
  )
}

function Maintain({ dispatch }) {
  const spots = [['🛡️', 'Hull panels: no cracks, just a little dust.'], ['🔩', 'Bolts & joints: all tight.'], ['🔋', 'Battery vents: need a quick wipe.']]
  const [seen, setSeen] = useState([])
  const look = (i) => setSeen((cur) => (cur.includes(i) ? cur : [...cur, i]))
  return (
    <div>
      <p>🧽 Follow the astronaut checklist: inspect all 3 spots, then clean and maintain for 💰 {MAINTAIN_PRICE}.</p>
      <div className="chips">{spots.map(([e, t], i) => <button key={i} className={`chip big ${seen.includes(i) ? 'sel' : ''}`} onClick={() => look(i)}>{seen.includes(i) ? '✅' : e} {seen.includes(i) ? t : 'Inspect'}</button>)}</div>
      <div className="row center"><button className="btn primary" disabled={seen.length < 3} onClick={() => { dispatch({ type: 'MAINTAIN' }); setSeen([]) }}>🧽 Clean & maintain (−{MAINTAIN_PRICE})</button></div>
    </div>
  )
}

function Memory({ onWin }) {
  const deck = useMemo(() => [...MEMORY, ...MEMORY].map((c, i) => ({ id: i, e: c[0], f: c[1] })).sort(() => Math.random() - 0.5), [])
  const [open, setOpen] = useState([])
  const [done, setDone] = useState([])
  const [fact, setFact] = useState('')
  const [moves, setMoves] = useState(0)
  const flip = (c) => {
    if (open.length >= 2 || open.includes(c.id) || done.includes(c.e)) return
    const next = [...open, c.id]
    setOpen(next)
    if (next.length === 2) {
      setMoves(moves + 1)
      const [a, b] = next.map((id) => deck.find((x) => x.id === id))
      setTimeout(() => {
        if (a.e === b.e) {
          const nd = [...done, a.e]
          setDone(nd); setFact(a.f)
          if (nd.length === MEMORY.length) onWin()
        }
        setOpen([])
      }, 650)
    }
  }
  return (
    <div>
      <p className="tiny">🃏 Space Memory: find the matching pairs. Moves: {moves}</p>
      <div className="memory">{deck.map((c) => { const up = open.includes(c.id) || done.includes(c.e); return <button key={c.id} className={`mem ${up ? 'up' : ''} ${done.includes(c.e) ? 'ok' : ''}`} onClick={() => flip(c)} aria-label="card">{up ? c.e : '❔'}</button> })}</div>
      {fact && <p className="feedback ok">{fact}</p>}
    </div>
  )
}

export default function PetScreen() {
  const { state, dispatch } = useGame()
  const [tab, setTab] = useState('refuel')
  const [game, setGame] = useState('catch')
  const [round, setRound] = useState(0)
  const [won, setWon] = useState(false)
  const p = state.pet
  const tabs = [['refuel', '⛽ REFUEL'], ['recharge', '🔋 RECHARGE'], ['repair', '🔧 REPAIR'], ['maintain', '🧽 MAINTAIN'], ['play', '🎈 PLAY']]
  const fb = state.feedback
  // the lesson follows the last interaction; otherwise the open tab
  const kind = p.fx?.kind && FACTS[p.fx.kind] ? p.fx.kind : tab
  const fact = FACTS[kind][(p.fx?.n || 0) % FACTS[kind].length]
  const win = () => { dispatch({ type: 'PLAY' }); setWon(true) }
  return (
    <div className="pet">
      <section className="card pet-stage">
        <h2>💜 {state.shipName}</h2>
        <p className="mood-line">{moodLine(state)}</p>
        <div className="pet-ship-wrap">
          {p.energy < 30 && <div className="note">🔋 Zzz… recharge me!</div>}
          {p.fuel < 25 && state.installed.length > 2 && <div className="note note2">⛽ We need fuel!</div>}
          <PetShip size={270} />
        </div>
        <p className="tiny">Tap me, wave your mouse around, or play with me!</p>
        <PetStats state={state} />
        <p className="tiny">Happiness is a fictional game value. Nothing can break permanently, and I will never be upset if you are away.</p>
      </section>
      <section className="card pet-actions">
        <div className="chips">{tabs.map(([id, l]) => <button key={id} className={`chip big ${tab === id ? 'sel' : ''}`} onClick={() => { setTab(id); setWon(false); dispatch({ type: 'CLEAR_FEEDBACK' }) }}>{l}{id === 'repair' && p.damaged ? ' ❗' : ''}</button>)}</div>
        {tab === 'refuel' && (
          <div>
            <p>⛽ Mars needs <b>{requiredFuel(state)}</b> fuel units for my current weight. Fuel costs 💰 {FUEL_PRICE} per {FUEL_AMOUNT} units.</p>
            <div className="fuel-gauge"><div style={{ width: p.fuel + '%' }} /><span>{Math.round(p.fuel)}%</span></div>
            <button className="btn primary" disabled={p.fuel >= 100} onClick={() => dispatch({ type: 'REFUEL' })}>⛽ Buy +{FUEL_AMOUNT} fuel (💰 {FUEL_PRICE})</button>
            {p.fuel >= 100 && <p className="tiny">My tank is full!</p>}
          </div>
        )}
        {tab === 'recharge' && <Recharge onDone={() => dispatch({ type: 'RECHARGE' })} />}
        {tab === 'repair' && <Repair state={state} dispatch={dispatch} />}
        {tab === 'maintain' && <Maintain dispatch={dispatch} />}
        {tab === 'play' && (
          <div>
            <div className="chips">
              <button className={`chip ${game === 'catch' ? 'sel' : ''}`} onClick={() => { setGame('catch'); setWon(false); setRound(round + 1) }}>🫧 Float & Catch</button>
              <button className={`chip ${game === 'memory' ? 'sel' : ''}`} onClick={() => { setGame('memory'); setWon(false); setRound(round + 1) }}>🃏 Space Memory</button>
            </div>
            {game === 'catch' && <>
              <p className="tiny">Catch all the floating toys before time runs out!</p>
              <FloatArena key={'c' + round} items={['🧸', '🍎', '🔧', '⭐', '🧦', '🎈']} mode="catch" timeLimit={25} onCatch={(n, t) => { if (n === t) win() }} height={250} />
            </>}
            {game === 'memory' && <Memory key={'m' + round} onWin={win} />}
            {won && <p className="feedback ok">🎉 You won! Happiness +20 (a little energy used).<button className="btn small primary" onClick={() => { setWon(false); setRound(round + 1) }}>Play again</button></p>}
          </div>
        )}
        {fb && fb.kind === 'poor' && <div className="feedback poor">💸 {fb.text} <button className="btn small primary" onClick={() => dispatch({ type: 'NAV', screen: 'academy' })}>Science Academy</button></div>}
        <div className="lesson"><b>🎓 Engineer's note</b><p>{fact}</p></div>
      </section>
    </div>
  )
}
