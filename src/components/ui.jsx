import React, { useEffect } from 'react'
import { ITEMS } from '../data/catalog.js'

export const Bar = ({ value, color = 'var(--cyan)', label, icon, warn }) => (
  <div className="stat">
    {(label || icon) && <div className="stat-top"><span>{icon} {label}</span><b>{Math.round(value)}%</b></div>}
    <div className={`bar ${warn ? 'warn' : ''}`}><i style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} /></div>
  </div>
)

export function Modal({ children, onClose, wide, className = '' }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div className="modal-back" onClick={(e) => e.target === e.currentTarget && onClose && onClose()}>
      <div className={`modal ${wide ? 'wide' : ''} ${className}`} role="dialog" aria-modal="true">{children}</div>
    </div>
  )
}

export const PartArt = ({ id, size = 64, mystery = false }) => {
  const it = ITEMS[id]
  return (
    <div className="part-art" style={{ width: size, height: size, background: mystery ? '#2a2f66' : `radial-gradient(circle at 30% 25%, #fff6, ${it.color})`, fontSize: size * 0.55 }}>
      {mystery ? '❓' : it.emoji}
    </div>
  )
}

export const Confetti = ({ once = false }) => (
  <div className={`confetti ${once ? 'once' : ''}`} aria-hidden="true">
    {Array.from({ length: 40 }, (_, i) => (
      <i key={i} style={{ left: (i * 37) % 100 + '%', background: ['#ff5ca8', '#35d0ff', '#ffd166', '#7cffb2', '#a78bfa'][i % 5], animationDelay: (i % 10) * 0.12 + 's', animationDuration: 2 + (i % 5) * 0.4 + 's' }} />
    ))}
  </div>
)

export const BackBtn = ({ onClick, children = '← Space Station' }) => (
  <button className="btn ghost small" onClick={onClick}>{children}</button>
)
