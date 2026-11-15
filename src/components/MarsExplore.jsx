import React, { useEffect, useState } from 'react'
import { useGame } from '../state/GameContext.jsx'
import Spacecraft from './Spacecraft.jsx'
import Astronaut from './Astronaut.jsx'
import PetShip from './PetShip.jsx'
import { Modal, Bar, Confetti } from './ui.jsx'
import { useExpression } from './Companion.jsx'
import { crewHas } from '../state/game.js'
import { CREW_BY_ID, SPECS } from '../data/crew.js'
import { SITES, SITE_BY_ID, ROVER, roverCost, OBSERVATIONS, TERRAIN_SITES, SAMPLE_INFO, SAMPLE_NOTE, WATER_CLUES, WATER_QUESTIONS, BUDDY_FACTS, EXPLORE_ACTIVITIES, CONCEPTS } from '../data/mars.js'

/* ---------- one question with encouraging feedback, retries and a free Space Buddy hint ---------- */
function QuestionCard({ title, scene, q, why, hint, options, bonusSkill, onCorrect, onClose }) {
  const { state, dispatch } = useGame()
  const [picked, setPicked] = useState(null)
  const [attempts, setAttempts] = useState(0)
  const [ok, setOk] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const helper = bonusSkill && crewHas(state, bonusSkill) ? state.crew.map((id) => CREW_BY_ID[id]).find((a) => a?.skill === bonusSkill) : null
  const wrongIdx = helper ? options.findIndex((o) => !o.ok) : -1
  const pick = (i) => {
    setPicked(i); const a = attempts + 1; setAttempts(a)
    if (options[i].ok) { setOk(true); dispatch({ type: 'BUDDY', text: 'That is a great answer, astronaut! We are learning about Mars together.', mood: 'proud' }) }
    else dispatch({ type: 'BUDDY', text: 'Not quite – but mistakes help us learn. Try again!', mood: 'curious' })
  }
  const askHint = () => { setShowHint(true); dispatch({ type: 'EXPLORE_HINT', text: `Hint: ${hint}` }) }
  return (
    <Modal wide onClose={ok ? undefined : onClose} className="mx-question">
      <h2>{title}</h2>
      {scene && <p className="big">{scene}</p>}
      <h4>{q}</h4>
      {helper && !ok && <p className="notice">🎮 GAMEPLAY BONUS (fictional): <b>{helper.name}</b> ({SPECS[helper.skill].name}) rules out one wrong answer.</p>}
      <div className="opts">{options.map((o, i) => <button key={i} disabled={ok || i === wrongIdx} className={`opt o${i} ${picked === i ? (o.ok ? 'right' : 'wrong shake') : ''}`} onClick={() => pick(i)}><span className="letter">{['▲', '●', '■'][i]}</span>{o.t}</button>)}</div>
      {picked !== null && !ok && <div className="feedback wrongfb">Good try! Think about it again – there is no penalty for trying.</div>}
      {attempts >= 1 && !ok && <button className="btn secondary small" onClick={askHint}>💜 Ask Space Buddy for a hint (free)</button>}
      {showHint && !ok && <div className="hint-line">💜 Space Buddy: {hint}</div>}
      {ok && <div className="feedback ok celebrate"><Confetti once />✅ {why}<div className="row"><button className="btn primary" onClick={() => onCorrect(attempts)}>Continue</button></div></div>}
      {!ok && <div className="row"><button className="btn ghost small" onClick={onClose}>Not now</button></div>}
    </Modal>
  )
}

/* ---------- scene: changes with the rover's location ---------- */
function Scene({ pos, state, expr }) {
  const crew = state.crew.map((id) => CREW_BY_ID[id]).filter(Boolean)
  const atBase = pos === 'base'
  return (
    <div className={`mx-scene at-${pos}`}>
      <div className="mx-sky"><div className="mx-sun" /></div>
      <div className="mx-mtn m1" /><div className="mx-mtn m2" /><div className="mx-mtn m3" />
      {pos === 'ridge' && <><div className="mx-volcano" /><div className="mx-volcano v2" /></>}
      {pos === 'crater' && <div className="mx-crater" />}
      {pos === 'plain' && <div className="mx-rocks">{['🪨', '🪨', '🪨', '🪨', '🪨'].map((r, i) => <i key={i} style={{ left: 8 + i * 19 + '%', bottom: 4 + (i % 3) * 8 + '%', fontSize: 1.3 + (i % 3) * 0.7 + 'rem' }}>{r}</i>)}</div>}
      {pos === 'dunes' && <><div className="mx-dune d1" /><div className="mx-dune d2" /></>}
      {pos === 'ice' && <><div className="mx-ice" /><div className="mx-shadow" /></>}
      <div className="mx-ground" />
      <div className={`mx-ship ${atBase ? 'near' : 'far'}`}><Spacecraft installed={state.installed} expr={expr} color={state.shipColor} size={atBase ? 120 : 54} bob={false} /></div>
      {atBase && <div className="mx-crew">{crew.map((a) => <Astronaut key={a.id} face={a.initials} color={a.color} size={48} float />)}<Astronaut avatar={state.profile.avatar} color={state.profile.color} size={52} wave />
        {state.team?.members.filter((m) => m.id !== 'me').map((m) => <Astronaut key={m.id} avatar={m.avatar} color={m.color} size={48} float />)}</div>}
      <div className="mx-rover" title="Rover">🤖</div>
      <div className="mx-buddy"><PetShip size={96} bubble /></div>
      <div className="mx-loc"><b>{SITE_BY_ID[pos].emoji} {SITE_BY_ID[pos].name}</b><small>{SITE_BY_ID[pos].blurb}</small></div>
    </div>
  )
}

export default function MarsExplore() {
  const { state, dispatch } = useGame()
  const expr = useExpression()
  const m = state.mission
  const e = m.explore
  const [sel, setSel] = useState(null)
  const [openQ, setOpenQ] = useState(null) // { kind, id }
  const [clues, setClues] = useState(false)
  const [factIdx, setFactIdx] = useState(0)
  const [reward, setReward] = useState(null)
  const site = SITE_BY_ID[e.pos]
  const acts = e.acts || {}
  const actCount = ['terrain', 'samples', 'water'].filter((id) => acts[id]).length
  const allActs = actCount === 3
  const prog = Math.round(((actCount + (allActs && e.pos === 'base' ? 1 : 0)) / 4) * 100)
  const fb = state.feedback

  // activities complete automatically when their questions are answered
  useEffect(() => {
    const t = TERRAIN_SITES.every((id) => e.q[OBSERVATIONS[id].qid])
    const s = ['rock', 'soil'].every((id) => e.analysed[id])
    const w = WATER_QUESTIONS.every((x) => e.q[x.qid])
    ;[['terrain', t], ['samples', s], ['water', w]].forEach(([id, done]) => { if (done && !acts[id]) { dispatch({ type: 'EXPLORE_ACT', id }); setReward(id) } })
  }, [e.q, e.analysed])

  const costTo = (id) => roverCost(e.pos, id)
  const nextTip = () => {
    if (!acts.terrain && !e.visited.crater) return 'Try driving to Dusty Crater first, then press “Scan surface”.'
    if (!acts.terrain) { const left = TERRAIN_SITES.find((id) => !e.q[OBSERVATIONS[id].qid]); return `You still need to scan and identify ${SITE_BY_ID[left].name}.` }
    if (!acts.samples) { const need = ['rock', 'soil'].find((id) => !e.samples.includes(id)); return need ? `Collect the ${need} sample at ${SITE_BY_ID[SAMPLE_INFO[need].site].name}, then analyse it.` : 'Open the rover lab and analyse your samples.' }
    if (!acts.water) return 'Drive to the Polar Ice Edge and scan for clues about water.'
    return 'All activities are done! Return the rover to the spacecraft to finish.'
  }
  const buddy = (text, mood) => dispatch({ type: 'BUDDY', text, mood })
  const scan = () => { dispatch({ type: 'EXPLORE_SCAN' }) }
  const scanned = !!e.scanned[e.pos]
  const batClass = e.battery < 20 ? 'bad' : e.battery < 45 ? 'warn' : 'good'
  const analyseList = ['rock', 'soil'].filter((id) => e.samples.includes(id))

  return (
    <div className="mx">
      <Scene pos={e.pos} state={state} expr={expr} />

      <div className="mx-grid">
        <section className="card mx-map-card">
          <h3>🗺️ Exploration map</h3>
          <p className="tiny">Tap a location to see the drive cost, then press Drive. Mission progress: <b>{prog}%</b></p>
          <div className="mx-progress"><i style={{ width: prog + '%' }} />{['A', 'B', 'C', '🏠'].map((l, i) => <span key={l} className={(i < 3 ? acts[['terrain', 'samples', 'water'][i]] : allActs && e.pos === 'base') ? 'on' : ''} style={{ left: (i + 1) * 25 - 12.5 + '%' }}>{l}</span>)}</div>
          <div className="mx-map">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mx-lines">{SITES.filter((s) => s.id !== e.pos).map((s) => <line key={s.id} x1={site.x} y1={site.y} x2={s.x} y2={s.y} />)}</svg>
            {SITES.map((s) => (
              <button key={s.id} className={`pin ${e.pos === s.id ? 'here' : ''} ${e.visited[s.id] ? 'seen' : ''} ${sel === s.id ? 'sel' : ''}`} style={{ left: s.x + '%', top: s.y + '%' }} onClick={() => setSel(s.id)} aria-label={s.name}>{s.emoji}</button>
            ))}
            <div className="map-rover" style={{ left: site.x + '%', top: site.y + '%' }}>🤖</div>
          </div>
          {sel && sel !== e.pos && (
            <div className="sel-card"><b>{SITE_BY_ID[sel].emoji} {SITE_BY_ID[sel].name}</b><small>{SITE_BY_ID[sel].blurb}</small>
              <span>Drive cost: <b>{costTo(sel)}%</b> battery (you have {e.battery}%)</span>
              <button className="btn primary small" onClick={() => { dispatch({ type: 'EXPLORE_MOVE', to: sel }); setSel(null); setClues(false) }}>🚙 Drive here</button></div>
          )}
          {sel === e.pos && <div className="sel-card"><b>You are here: {site.name}</b><small>{site.blurb}</small></div>}
        </section>

        <section className="card mx-rover-card">
          <h3>🤖 Rover controls</h3>
          <div className="rover-stats">
            <div className={`rs ${batClass}`}><small>🔋 Battery</small><Bar value={e.battery} color={e.battery < 20 ? 'var(--red)' : e.battery < 45 ? 'var(--yellow)' : 'var(--green)'} warn={e.battery < 20} /><b>{e.battery}%</b></div>
            <div className="rs"><small>🛣️ Distance</small><b>{e.distance} km</b></div>
            <div className="rs"><small>🧪 Samples</small><b>{e.samples.length}/3</b></div>
            <div className="rs"><small>📸 Photos</small><b>{e.photos.length}</b></div>
          </div>
          <p className="tiny">Scan costs {ROVER.scan}%, photo {ROVER.photo}%, collecting {ROVER.collect}%. Driving costs battery too – plan your route and return to recharge!</p>
          <div className="rover-btns">
            <button className="btn secondary" disabled={scanned} onClick={scan}>📡 Scan surface</button>
            <button className="btn secondary" disabled={e.photos.includes(e.pos)} onClick={() => dispatch({ type: 'EXPLORE_PHOTO' })}>📸 Take photo</button>
            <button className="btn secondary" disabled={!site.sample || e.samples.includes(site.sample)} onClick={() => dispatch({ type: 'EXPLORE_COLLECT' })}>🧪 Collect sample</button>
            <button className="btn primary" disabled={e.pos === 'base'} onClick={() => dispatch({ type: 'EXPLORE_RETURN' })}>🏠 Return to spacecraft</button>
          </div>
          {fb && <div className="feedback poor">{fb.text}</div>}
          {e.battery < 25 && e.pos !== 'base' && <p className="notice warn">⚠️ Battery is low! Return to the spacecraft soon (the way home costs {roverCost(e.pos, 'base')}%). If the rover runs out, the crew will tow it – safe, but it lowers your resource score.</p>}
          {scanned && <p className="tiny">✅ Scanned this location.</p>}
        </section>
      </div>

      {/* what can be done here */}
      <section className="card mx-here">
        <h3>📍 {site.name}</h3>
        {e.pos === 'base' && <p>This is your landing site. Choose a place on the map and drive there with the rover. You can come back at any time to recharge the battery.</p>}
        {TERRAIN_SITES.includes(e.pos) && (
          <div>
            <p>{scanned ? 'The scan is complete. Look closely and tell Space Buddy what you see!' : 'Scan the surface to see what is here.'}</p>
            <button className="btn primary" disabled={!scanned || !!e.q[OBSERVATIONS[e.pos].qid]} onClick={() => setOpenQ({ kind: 'obs', id: e.pos })}>{e.q[OBSERVATIONS[e.pos].qid] ? '✅ Identified' : '🔎 Identify what I see'}</button>
          </div>
        )}
        {e.pos === 'dunes' && <p>Fine red dust and sand. Collect a soil sample, then analyse it in the rover lab below.</p>}
        {e.pos === 'ice' && (
          <div>
            <p>A very cold, shadowed place. Scan for clues about water, then investigate.</p>
            <button className="btn primary" disabled={!scanned} onClick={() => setClues(true)}>🔍 Investigate the clues</button>
            {clues && (
              <div className="clues">{WATER_CLUES.map((c) => <div key={c.id} className="clue-card"><span>{c.emoji}</span>{c.text}</div>)}
                <div className="row wrap">{WATER_QUESTIONS.map((q, i) => <button key={q.qid} className="btn secondary small" disabled={!!e.q[q.qid] || (i === 1 && !e.q[WATER_QUESTIONS[0].qid])} onClick={() => setOpenQ({ kind: 'water', id: i })}>{e.q[q.qid] ? '✅' : '❓'} Question {i + 1}</button>)}</div>
              </div>
            )}
          </div>
        )}
        {e.pos === 'ice' && e.samples.includes('ice') && <p className="tiny">🧊 Ice sample collected (simulated).</p>}
      </section>

      <div className="mx-grid">
        <section className="card">
          <h3>🔭 Activities</h3>
          {EXPLORE_ACTIVITIES.map((a) => (
            <div key={a.id} className={`xact ${acts[a.id] ? 'done' : ''}`}>
              <span className="xact-ic">{acts[a.id] ? '✅' : a.emoji}</span>
              <div><b>{a.name}</b><small>{a.how}</small>
                {a.id === 'terrain' && <small>Identified: {TERRAIN_SITES.filter((id) => e.q[OBSERVATIONS[id].qid]).length}/3</small>}
                {a.id === 'samples' && <small>Analysed: {['rock', 'soil'].filter((id) => e.analysed[id]).length}/2 · {SAMPLE_NOTE}</small>}
                {a.id === 'water' && <small>Questions answered: {WATER_QUESTIONS.filter((q) => e.q[q.qid]).length}/2 · Finding water ice does not prove that life exists.</small>}
                {acts[a.id] && <em>Reward: +60 science XP · learned: {CONCEPTS[a.id].join(', ')}</em>}</div>
            </div>
          ))}
        </section>
        <section className="card">
          <h3>🧪 Rover lab</h3>
          <p className="tiny">{SAMPLE_NOTE} Scientists study samples to understand a planet's history, its rocks and whether it could have supported life.</p>
          {e.samples.length === 0 && <p className="tiny">No samples yet – collect one with the rover.</p>}
          <div className="sample-list">{e.samples.map((id) => (
            <div key={id} className="sample"><span>{SAMPLE_INFO[id].emoji}</span><b>{SAMPLE_INFO[id].name}</b>
              {SAMPLE_INFO[id].q ? <button className="btn small secondary" disabled={!!e.analysed[id]} onClick={() => setOpenQ({ kind: 'sample', id })}>{e.analysed[id] ? '✅ Analysed' : '🔬 Analyse'}</button> : <small>Stored for later study</small>}</div>))}</div>
          <h4>📸 Photo album</h4>
          <div className="album">{e.photos.length === 0 ? <small>No photographs yet.</small> : e.photos.map((id) => <figure key={id} className={`photo p-${id}`}><span>{SITE_BY_ID[id].emoji}</span><figcaption>{OBSERVATIONS[id]?.caption || SITE_BY_ID[id].blurb}</figcaption></figure>)}</div>
        </section>
      </div>

      <section className="card mx-buddy-card">
        <h3>💜 Space Buddy says</h3>
        <p className="say-box">{state.say.text || 'We are on Mars! Let us explore!'}</p>
        <div className="row wrap">
          <button className="btn secondary small" onClick={() => { buddy(BUDDY_FACTS[factIdx % BUDDY_FACTS.length], 'excited'); setFactIdx(factIdx + 1) }}>🌟 Tell me a Mars fact</button>
          <button className="btn secondary small" onClick={() => buddy(nextTip(), 'curious')}>💡 What should I do next?</button>
        </div>
      </section>

      <section className="card finish-card">
        {!allActs ? <p>Complete all three activities, then return the rover to the spacecraft to finish the mission. ({actCount}/3 done)</p> : <p className="big">🎉 All three activities are complete!{e.pos !== 'base' ? ' Return the rover to the spacecraft to finish.' : ' The rover is home.'}</p>}
        <div className="row center wrap">
          {allActs && e.pos !== 'base' && <button className="btn secondary huge" onClick={() => dispatch({ type: 'EXPLORE_RETURN' })}>🏠 Return rover to the spacecraft</button>}
          <button className="btn primary huge" disabled={!allActs || e.pos !== 'base'} onClick={() => dispatch({ type: 'FINISH' })}>📋 Complete mission & see my report</button>
        </div>
        <p className="tiny center">This is the end of the prototype mission – the crew stays on Mars.</p>
      </section>

      {reward && <Modal onClose={() => setReward(null)}><Confetti once /><h2>🎉 Activity complete!</h2><p className="big">{EXPLORE_ACTIVITIES.find((a) => a.id === reward).name}</p><p>Reward: <b className="gold">+60 science XP</b>. You learned about: {CONCEPTS[reward].join(' · ')}.</p><p className="tiny">Badges and credits are awarded only once, so repeating an activity cannot earn extra.</p><div className="row center"><button className="btn primary" onClick={() => setReward(null)}>Keep exploring</button></div></Modal>}

      {openQ?.kind === 'obs' && (() => { const o = OBSERVATIONS[openQ.id]; return <QuestionCard title={`🔎 ${SITE_BY_ID[openQ.id].name}`} scene={o.scene} q="What is it?" options={o.options} why={o.why} hint={o.hint} bonusSkill="research" onClose={() => setOpenQ(null)} onCorrect={(att) => { dispatch({ type: 'EXPLORE_ANSWER', qid: o.qid, attempts: att }); setOpenQ(null) }} /> })()}
      {openQ?.kind === 'sample' && (() => { const sm = SAMPLE_INFO[openQ.id]; return <QuestionCard title={`🧪 Analysing: ${sm.name} (simulated)`} scene={SAMPLE_NOTE} q={sm.q} options={sm.options} why={sm.why} hint={sm.hint} bonusSkill="research" onClose={() => setOpenQ(null)} onCorrect={(att) => { dispatch({ type: 'EXPLORE_ANSWER', qid: sm.qid, attempts: att, sample: sm.id }); setOpenQ(null) }} /> })()}
      {openQ?.kind === 'water' && (() => { const w = WATER_QUESTIONS[openQ.id]; return <QuestionCard title="💧 Signs of water?" scene={openQ.id === 0 ? WATER_CLUES.map((c) => c.text).join(' ') : 'Water ice is interesting – but what does it mean for life?'} q={w.q} options={w.options} why={w.why} hint={w.hint} bonusSkill="research" onClose={() => setOpenQ(null)} onCorrect={(att) => { dispatch({ type: 'EXPLORE_ANSWER', qid: w.qid, attempts: att }); setOpenQ(null) }} /> })()}
    </div>
  )
}
