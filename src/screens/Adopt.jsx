import React, { useEffect, useState } from 'react'
import { useGame } from '../state/GameContext.jsx'
import Spacecraft from '../components/Spacecraft.jsx'
import { MSG } from '../data/messages.js'
import { colorName } from '../data/learn.js'

const SHIP_COLORS = ['#7c5cff', '#ff5ca8', '#35d0ff', '#ff9f43', '#2fd88f', '#ffd166']
export default function Adopt() {
  const { state, dispatch } = useGame()
  const [name, setName] = useState(state.shipName || '')
  const [color, setColor] = useState(state.shipColor)
  const [talk, setTalk] = useState(MSG.adopt[0][1])
  const [expr, setExpr] = useState('excited')
  const [taps, setTaps] = useState(0)
  useEffect(() => { const t = setTimeout(() => setExpr('happy'), 2500); return () => clearTimeout(t) }, [])
  const tap = () => {
    const lines = ['Hee hee! That tickles!', 'Wheee!', 'I like you already!', "Hello, astronaut! I'm your new spacecraft. Where are we going?"]
    setTaps(taps + 1); setTalk(lines[taps % lines.length]); setExpr(taps % 2 ? 'excited' : 'happy')
  }
  const go = () => {
    const n = name.trim()
    if (!n) return setTalk('Please give me a name first! What should I be called?')
    dispatch({ type: 'ADOPT', shipName: n.slice(0, 16), shipColor: color })
  }
  return (
    <div className="center-page">
      <div className="card form-card adopt">
        <h2>🥚 Adopt your spacecraft core</h2>
        <p className="tiny center">I'm still just a core – I need engines, a cabin and more! Tap me!</p>
        <div className="adopt-stage">
          <div className="bubble big-bubble">{talk}</div>
          <Spacecraft installed={[]} expr={expr} color={color} size={260} onClick={tap} />
        </div>
        <label className="lbl">Give your spacecraft a name</label>
        <input className="input" aria-label="Spacecraft name" value={name} maxLength={16} onChange={(e) => setName(e.target.value)} placeholder="e.g. Comet, Zoom, Buddy" onFocus={() => setExpr('curious')} onBlur={() => setExpr('happy')} />
        <label className="lbl">Colour</label>
        <div className="chips">{SHIP_COLORS.map((c) => <button key={c} className={`swatch ${color === c ? 'sel' : ''}`} style={{ background: c }} onClick={() => { setColor(c); dispatch({ type: 'SET_SHIP_COLOR', color: c }) }} aria-label={`spacecraft colour ${colorName(c)}`} />)}</div>
        <div className="row center"><button className="btn primary huge" onClick={go}>💜 ADOPT ME!</button></div>
      </div>
    </div>
  )
}
