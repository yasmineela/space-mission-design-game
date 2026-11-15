import React, { useEffect, useRef, useState } from 'react'

// Microgravity arena: objects drift in straight lines, bounce off walls, and never fall.
export default function FloatArena({ items, mode = 'push', onPush, onCatch, onLost, height = 280, timeLimit }) {
  const ref = useRef(null)
  const sp = mode === 'rescue' ? 2.2 : 1
  const objs = useRef(items.map((e, i) => ({ e, id: i, x: 80 + i * 55, y: 70 + (i % 3) * 50, vx: (i % 2 ? 0.25 : -0.2) * sp, vy: (i % 3 - 1 + (i % 2 ? 0.4 : -0.3)) * 0.2 * sp, rot: 0, vr: 0, gone: false })))
  const [, tick] = useState(0)
  const [pushes, setPushes] = useState(0)
  const [caught, setCaught] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit || 0)
  const [lost, setLost] = useState(0)
  const placed = useRef(false)
  const lostRef = useRef(0)
  const caughtRef = useRef(0)
  const pushRef = useRef(0)

  useEffect(() => {
    let raf
    const loop = () => {
      const w = ref.current?.clientWidth || 500, h = height
      if (!placed.current && ref.current) { // on narrow (phone) screens, start every object inside the arena so none is "lost" at the first frame
        placed.current = true
        const hi = Math.max(80, w - 110), n = objs.current.length
        objs.current.forEach((o, i) => { if (o.x > hi) o.x = 70 + (n > 1 ? i / (n - 1) : 0) * (hi - 70) })
      }
      objs.current.forEach((o) => {
        if (o.gone) return
        o.x += o.vx; o.y += o.vy; o.rot += o.vr
        if (mode === 'rescue') { // objects drift towards the edge: collect them before they leave
          if (o.x < -10 || o.x > w - 34 || o.y < -10 || o.y > h - 34) { o.gone = true; o.lost = true; lostRef.current += 1; setLost(lostRef.current); onLost && onLost(lostRef.current, items.length) }
          return
        }
        if (o.x < 0) { o.x = 0; o.vx = Math.abs(o.vx) } if (o.x > w - 44) { o.x = w - 44; o.vx = -Math.abs(o.vx) }
        if (o.y < 0) { o.y = 0; o.vy = Math.abs(o.vy) } if (o.y > h - 44) { o.y = h - 44; o.vy = -Math.abs(o.vy) }
      })
      tick((n) => n + 1)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [height])

  useEffect(() => {
    if (!timeLimit) return
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [timeLimit])

  const click = (o, ev) => {
    if (o.gone) return
    if (mode === 'catch' || mode === 'rescue') {
      o.gone = true
      caughtRef.current += 1 // refs, so fast repeated taps are never miscounted
      const n = caughtRef.current
      setCaught(n)
      onCatch && onCatch(n, items.length)
    } else {
      const rect = ref.current.getBoundingClientRect()
      const cx = ev.clientX - rect.left - o.x - 22
      const cy = ev.clientY - rect.top - o.y - 22
      const ang = Math.atan2(-cy, -cx)
      o.vx = Math.cos(ang) * 2.4; o.vy = Math.sin(ang) * 2.4; o.vr = (Math.random() - 0.5) * 6
      pushRef.current += 1
      const n = pushRef.current
      setPushes(n)
      onPush && onPush(n)
    }
  }
  return (
    <div className="arena" ref={ref} style={{ height }}>
      {objs.current.map((o) => !o.gone && (
        <button key={o.id} className="float-obj" onClick={(ev) => click(o, ev)} style={{ transform: `translate(${o.x}px, ${o.y}px) rotate(${o.rot}deg)` }} aria-label={`floating ${o.e}`}>{o.e}</button>
      ))}
      <div className="arena-hud">
        {mode === 'push' ? <span>👆 Pushes: {pushes}</span> : <span>🎒 Caught: {caught}/{items.length}</span>}{mode === 'rescue' ? <span>💨 Drifted away: {lost}</span> : null}
        {timeLimit ? <span>⏱ {timeLeft}s</span> : null}
      </div>
    </div>
  )
}
