import React from 'react'
import { Bar } from './ui.jsx'

export const STATS = [
  { k: 'energy', icon: '🔋', label: 'Energy', color: 'var(--yellow)', low: 30, tip: 'Sleepy – recharge me!' },
  { k: 'fuel', icon: '⛽', label: 'Fuel', color: 'var(--orange)', low: 25, tip: 'Running low – refuel!' },
  { k: 'health', icon: '❤️', label: 'Health', color: 'var(--green)', low: 40, tip: 'Needs a repair check' },
  { k: 'maintenance', icon: '🧽', label: 'Maintenance', color: 'var(--cyan)', low: 40, tip: 'Time for an inspection' },
  { k: 'happiness', icon: '😊', label: 'Happiness', color: 'var(--pink)', low: 40, tip: 'Play with me!' },
]
const word = (v) => (v < 30 ? 'Low' : v < 60 ? 'OK' : v < 90 ? 'Good' : 'Great')

export function moodLine(state) {
  const p = state.pet
  if (p.damaged) return '😟 Something is wrong – a part needs repairing!'
  if (p.energy < 30) return '😴 I am so sleepy… please recharge me.'
  if (p.fuel < 25 && state.installed.length > 2) return '⛽ My tank is nearly empty.'
  if (p.happiness >= 90) return '🥰 I LOVE being your spacecraft!'
  if (p.happiness < 40) return '🥺 I miss playing with you.'
  return '🙂 I feel fine. What shall we do?'
}

export default function PetStats({ state, compact = false }) {
  const p = state.pet
  return (
    <div className={`pet-stats ${compact ? 'compact' : ''}`}>
      {STATS.map((s) => {
        const v = p[s.k]
        const low = v < s.low
        return (
          <div key={s.k} className={`pstat ${low ? 'low' : ''}`}>
            <div className="pstat-top"><span>{s.icon} {s.label}</span><b>{Math.round(v)}<small>/100</small> · {word(v)}</b></div>
            <Bar value={v} color={s.color} warn={low} />
            {!compact && low && <small className="pstat-tip">{s.tip}</small>}
          </div>
        )
      })}
    </div>
  )
}
