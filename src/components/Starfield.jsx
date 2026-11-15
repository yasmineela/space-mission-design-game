import React, { useMemo } from 'react'

export default function Starfield({ planets = true }) {
  const stars = useMemo(() => Array.from({ length: 70 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100, s: Math.random() * 2.4 + 0.6,
    d: Math.random() * 4 + 2, delay: Math.random() * 5,
  })), [])
  return (
    <div className="space-bg" aria-hidden="true">
      {stars.map((s) => (
        <i key={s.id} className="star" style={{ left: s.x + '%', top: s.y + '%', width: s.s, height: s.s, animationDuration: s.d + 's', animationDelay: s.delay + 's' }} />
      ))}
      <div className="nebula n1" /><div className="nebula n2" />
      <i className="shoot s1" /><i className="shoot s2" />
      {planets && (
        <>
          <div className="planet earth drift" />
          <div className="planet mars drift2" />
          <div className="planet gas drift3" />
        </>
      )}
    </div>
  )
}
