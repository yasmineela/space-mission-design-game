import React, { useEffect, useState } from 'react'
import { useGame } from '../state/GameContext.jsx'
import Spacecraft from './Spacecraft.jsx'

// Derives the companion's face from the real game state.
export const baseExpression = (s) => {
  const p = s.pet
  if (p.energy < 30) return 'sleepy'
  if (p.damaged || p.fuel < 20 && s.installed.length > 2 || p.health < 40) return 'worried'
  if (p.happiness < 25) return 'sad'
  if (p.happiness > 85) return 'proud'
  return 'happy'
}

export function useExpression() {
  const { state } = useGame()
  const [mood, setMood] = useState(null)
  useEffect(() => {
    if (!state.say.n) return
    setMood(state.say.mood)
    const t = setTimeout(() => setMood(null), 4500)
    return () => clearTimeout(t)
  }, [state.say.n])
  return mood || baseExpression(state)
}

const MOOD_WORDS = { happy: 'happy', proud: 'proud', excited: 'excited', curious: 'curious', worried: 'worried and needs attention', sad: 'a little sad', sleepy: 'sleepy and low on energy' }

export default function Companion() {
  const { state } = useGame()
  const expr = useExpression()
  const [show, setShow] = useState(false)
  const [react, setReact] = useState('') // a short body reaction to what just happened (CSS only)
  useEffect(() => {
    if (!state.say.n) return
    setShow(true)
    setReact('react-' + (state.say.mood || 'happy'))
    const t = setTimeout(() => setShow(false), 8000)
    const r = setTimeout(() => setReact(''), 1300)
    return () => { clearTimeout(t); clearTimeout(r) }
  }, [state.say.n])
  if (!state.adopted) return null
  return (
    <div className={`companion ${react}`} data-mood={expr} role="button" tabIndex={0} aria-label={`${state.shipName}, your Space Buddy, feeling ${MOOD_WORDS[expr] || expr}. Press to show or hide its message.`} onClick={() => setShow((v) => !v)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShow((v) => !v) } }} title={state.shipName}>
      {show && state.say.text && <div className="bubble" role="status">{state.say.text}</div>}
      <div className="mini-ship">
        <Spacecraft installed={state.installed} expr={expr} color={state.shipColor} energy={state.pet.energy} size={78} bob={false} damaged={state.pet.damaged} view="60 120 280 280" />
      </div>
    </div>
  )
}
