import React, { useEffect, useRef, useState } from 'react'
import { useGame } from '../state/GameContext.jsx'
import Spacecraft from './Spacecraft.jsx'
import { useExpression } from './Companion.jsx'

const PARTICLES = {
  tap: ['💜', '✨', '💜'], refuel: ['⛽', '💧', '⛽'], recharge: ['⚡', '🔋', '⚡'], repair: ['🔧', '✨', '🔩'],
  maintain: ['🧽', '✨', '🫧'], play: ['🎈', '⭐', '🎈'], buy: ['🔩', '✨', '⭐'], level: ['🎉', '⭐', '🎊', '✨'], damage: ['💥', '😟'],
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

/**
 * The living companion: wraps the existing Spacecraft SVG and adds
 * eye tracking, idle behaviours, reaction animations, particles and a speech bubble.
 */
export default function PetShip({ size = 270, bubble = true }) {
  const { state, dispatch } = useGame()
  const expr = useExpression()
  const ref = useRef(null)
  const [look, setLook] = useState({ x: 0, y: 0 })
  const [cls, setCls] = useState('')
  const [parts, setParts] = useState([])
  const [talking, setTalking] = useState(false)
  const [show, setShow] = useState(false)
  const lastMove = useRef(0)
  const pid = useRef(0)
  const p = state.pet

  // eyes follow the pointer
  useEffect(() => {
    let raf = 0
    const move = (e) => {
      lastMove.current = Date.now()
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = ref.current?.getBoundingClientRect()
        if (!r) return
        const cx = r.left + r.width / 2, cy = r.top + r.height * 0.5
        setLook({ x: clamp((e.clientX - cx) / 250, -1, 1), y: clamp((e.clientY - cy) / 250, -1, 1) })
      })
    }
    window.addEventListener('pointermove', move)
    return () => { window.removeEventListener('pointermove', move); cancelAnimationFrame(raf) }
  }, [])

  // idle life: look around, little hop, hearts when very happy
  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() - lastMove.current > 4000) setLook({ x: Math.random() * 2 - 1, y: Math.random() - 0.4 })
      if (Math.random() < 0.35 && p.energy >= 30) { setCls('fx-hop'); setTimeout(() => setCls(''), 800) }
    }, 4200)
    return () => clearInterval(id)
  }, [p.energy])
  useEffect(() => {
    if (p.happiness < 85) return
    const id = setInterval(() => spawn(['💜']), 3200)
    return () => clearInterval(id)
  }, [p.happiness >= 85])

  const spawn = (list) => {
    const made = list.map((e, i) => ({ id: ++pid.current, e, x: 25 + Math.random() * 50, d: i * 120 }))
    setParts((cur) => [...cur, ...made])
    setTimeout(() => setParts((cur) => cur.filter((x) => !made.some((m) => m.id === x.id))), 1700)
  }

  // visible reaction to every game interaction
  useEffect(() => {
    if (!p.fx?.n) return
    setCls('fx-' + p.fx.kind)
    spawn(PARTICLES[p.fx.kind] || ['✨'])
    const t = setTimeout(() => setCls(''), 1100)
    return () => clearTimeout(t)
  }, [p.fx?.n])

  // speech: bubble + moving mouth
  useEffect(() => {
    if (!state.say.n) return
    setShow(true); setTalking(true)
    const a = setTimeout(() => setTalking(false), 2200)
    const b = setTimeout(() => setShow(false), 8000)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [state.say.n])

  return (
    <div className="petship" ref={ref} style={{ width: size }}>
      {bubble && show && state.say.text && <div className={`pet-bubble mood-${state.say.mood}`}>{state.say.text}</div>}
      <div className={`petship-inner ${cls} ${p.energy < 30 ? 'breathe' : ''}`}>
        <Spacecraft installed={state.installed} expr={expr} color={state.shipColor} energy={p.energy} damaged={p.damaged} size={size} look={look} talking={talking} bob={!cls && p.energy >= 30} onClick={() => dispatch({ type: 'TAP' })} flame={state.mission.launched && !state.mission.finished} />
      </div>
      {parts.map((x) => <span key={x.id} className="particle" style={{ left: x.x + '%', animationDelay: x.d + 'ms' }}>{x.e}</span>)}
    </div>
  )
}
