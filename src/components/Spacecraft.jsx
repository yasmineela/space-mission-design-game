import React from 'react'
import { COMPONENTS } from '../data/catalog.js'

// Each part is drawn at a fixed spot, so the spacecraft grows from the original core.
const PARTS = {
  // L1
  tank: () => (
    <g>
      <rect x="98" y="215" width="40" height="118" rx="18" fill="#ffb35c" stroke="#c77a1e" strokeWidth="3" />
      <rect x="262" y="215" width="40" height="118" rx="18" fill="#ffb35c" stroke="#c77a1e" strokeWidth="3" />
      <path d="M104 255h28M104 285h28M268 255h28M268 285h28" stroke="#c77a1e" strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  engine: ({ flame }) => (
    <g>
      <path d="M166 358h68l22 52h-112z" fill="#8a90ad" stroke="#585d7a" strokeWidth="3" />
      <rect x="158" y="350" width="84" height="14" rx="6" fill="#5b6080" />
      {flame && (
        <g className="flame">
          <path d="M168 410q32 70 64 0z" fill="#ff8a4c" />
          <path d="M182 410q18 42 36 0z" fill="#ffd166" />
        </g>
      )}
    </g>
  ),
  capsule: () => (
    <g>
      <path d="M146 208q-4-104 54-138 58 34 54 138z" fill="#eef0ff" stroke="#9aa6ff" strokeWidth="3" />
      <circle cx="200" cy="138" r="21" fill="#5ee3ff" stroke="#fff" strokeWidth="5" />
      <circle cx="193" cy="131" r="6" fill="#fff" opacity=".75" />
    </g>
  ),
  antenna: () => (
    <g>
      <line x1="200" y1="74" x2="200" y2="38" stroke="#c9ceea" strokeWidth="4" />
      <path d="M180 38q20 24 40 0z" fill="#ffd166" stroke="#c99a2e" strokeWidth="2" />
      <circle cx="200" cy="30" r="5" fill="#ff4d6d" className="blinker" />
    </g>
  ),
  power: () => (
    <g>
      <circle cx="232" cy="300" r="14" fill="#2a3060" stroke="#7cffb2" strokeWidth="3" />
      <path d="M234 292l-7 10h6l-3 8 9-11h-6z" fill="#7cffb2" />
    </g>
  ),
  // L2
  life: () => (
    <g>
      <circle cx="168" cy="300" r="14" fill="#2a3060" stroke="#7cffb2" strokeWidth="3" />
      <path d="M160 297h16M160 303h12" stroke="#9dffcf" strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  nav: () => (
    <g>
      <circle cx="200" cy="300" r="14" fill="#2a3060" stroke="#5ee3ff" strokeWidth="3" />
      <path d="M200 288l5 12-5 12-5-12z" fill="#5ee3ff" />
    </g>
  ),
  thermal: () => (
    <g>
      <path d="M149 332q51 24 102 0v30q-51 24-102 0z" fill="#ff8a4c" stroke="#c4521a" strokeWidth="3" />
      <path d="M168 342v26M200 346v28M232 342v26" stroke="#c4521a" strokeWidth="2" opacity=".6" />
    </g>
  ),
  solar: () => (
    <g>
      <path d="M100 280H142M258 280H300" stroke="#c9ceea" strokeWidth="5" />
      <rect x="22" y="242" width="80" height="76" rx="6" fill="#2d5bff" stroke="#9db8ff" strokeWidth="3" />
      <rect x="298" y="242" width="80" height="76" rx="6" fill="#2d5bff" stroke="#9db8ff" strokeWidth="3" />
      <path d="M48 242v76M75 242v76M22 280h80M325 242v76M352 242v76M298 280h80" stroke="#9db8ff" strokeWidth="2" opacity=".8" />
    </g>
  ),
  radiation: () => (
    <g>
      <path d="M150 222h12v100h-12zM238 222h12v100h-12z" fill="#b47cff" stroke="#7340c9" strokeWidth="2" />
      <text x="156" y="278" fontSize="10" textAnchor="middle" fill="#fff">☢</text>
      <text x="244" y="278" fontSize="10" textAnchor="middle" fill="#fff">☢</text>
    </g>
  ),
  // L3
  adv_prop: ({ flame }) => (
    <g>
      <path d="M112 336h24l8 46h-40z" fill="#5ee3ff" stroke="#2a8fb0" strokeWidth="3" />
      <path d="M264 336h24l8 46h-40z" fill="#5ee3ff" stroke="#2a8fb0" strokeWidth="3" />
      {flame && (
        <g className="flame">
          <path d="M116 382q16 36 32 0z" fill="#5ee3ff" />
          <path d="M268 382q16 36 32 0z" fill="#5ee3ff" />
        </g>
      )}
    </g>
  ),
  adv_comm: () => (
    <g>
      <path d="M250 150l36-38" stroke="#c9ceea" strokeWidth="5" />
      <ellipse cx="300" cy="102" rx="38" ry="15" transform="rotate(-38 300 102)" fill="#eef0ff" stroke="#9aa6ff" strokeWidth="3" />
      <circle cx="318" cy="84" r="4" fill="#ffd166" />
    </g>
  ),
  lab: () => (
    <g>
      <path d="M138 148h22" stroke="#c9ceea" strokeWidth="6" />
      <rect x="78" y="124" width="64" height="46" rx="14" fill="#9b5cff" stroke="#6a2fd1" strokeWidth="3" />
      <text x="110" y="156" fontSize="22" textAnchor="middle">🔬</text>
    </g>
  ),
  recycler: () => (
    <g>
      <path d="M252 340l40 6" stroke="#c9ceea" strokeWidth="5" />
      <ellipse cx="320" cy="350" rx="30" ry="24" fill="#2ea8ff" stroke="#0e6fb8" strokeWidth="3" />
      <text x="320" y="360" fontSize="22" textAnchor="middle">💧</text>
    </g>
  ),
  backup: () => (
    <g>
      <path d="M110 346l-10 0" stroke="#c9ceea" strokeWidth="5" />
      <rect x="44" y="326" width="58" height="44" rx="10" fill="#ff5c7a" stroke="#b02142" strokeWidth="3" />
      <text x="73" y="356" fontSize="22" textAnchor="middle">🛟</text>
    </g>
  ),
}
// draw order (back to front)
const ORDER = ['solar', 'adv_comm', 'lab', 'recycler', 'backup', 'engine', 'adv_prop', 'tank', 'capsule', 'antenna', 'thermal']
const FRONT = ['radiation', 'life', 'nav', 'power']

function Face({ expr, dim, look = { x: 0, y: 0 }, talking = false }) {
  const eyeL = 176, eyeR = 224, y = 240
  const pupil = (x, dx = 0, dy = 0, r = 6) => <circle className="pupil" cx={x + dx + look.x * 5} cy={y + dy + look.y * 4} r={r} fill="#1b1f4b" />
  const eyeWhite = (x, r = 15) => <circle cx={x} cy={y} r={r} fill="#fff" />
  let eyes, mouth, extra = null
  switch (expr) {
    case 'excited':
      eyes = (<g className="eyes">{eyeWhite(eyeL, 17)}{eyeWhite(eyeR, 17)}{pupil(eyeL, 0, 0, 9)}{pupil(eyeR, 0, 0, 9)}
        <circle cx={eyeL + 4} cy={y - 4} r="3.5" fill="#fff" /><circle cx={eyeR + 4} cy={y - 4} r="3.5" fill="#fff" /></g>)
      mouth = <path d="M184 266q16 24 32 0z" fill="#ff5c7a" stroke="#1b1f4b" strokeWidth="3" strokeLinejoin="round" />
      extra = <g fill="#ff9ec5" opacity=".7"><ellipse cx="160" cy="262" rx="8" ry="5" /><ellipse cx="240" cy="262" rx="8" ry="5" /></g>
      break
    case 'sleepy':
      eyes = (<g>
        <path d={`M${eyeL - 13} ${y}q13 10 26 0`} stroke="#1b1f4b" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d={`M${eyeR - 13} ${y}q13 10 26 0`} stroke="#1b1f4b" strokeWidth="4" fill="none" strokeLinecap="round" /></g>)
      mouth = <ellipse cx="200" cy="270" rx="6" ry="4" fill="#1b1f4b" />
      extra = <text className="zzz" x="246" y="214" fontSize="20" fill="#cfd6ff" fontWeight="800">z z</text>
      break
    case 'worried':
      eyes = (<g className="eyes">{eyeWhite(eyeL)}{eyeWhite(eyeR)}{pupil(eyeL, 0, 3, 5)}{pupil(eyeR, 0, 3, 5)}
        <path d={`M${eyeL - 14} ${y - 20}l24 -6M${eyeR + 14} ${y - 20}l-24 -6`} stroke="#1b1f4b" strokeWidth="4" strokeLinecap="round" /></g>)
      mouth = <path d="M186 272q7-8 14 0t14 0" stroke="#1b1f4b" strokeWidth="4" fill="none" strokeLinecap="round" />
      extra = <path d="M240 226q4 8 0 12-4-4 0-12z" fill="#7bd3ff" />
      break
    case 'sad':
      eyes = (<g className="eyes">{eyeWhite(eyeL)}{eyeWhite(eyeR)}{pupil(eyeL, 0, 4, 6)}{pupil(eyeR, 0, 4, 6)}
        <path d={`M${eyeL - 14} ${y - 18}l24 6M${eyeR + 14} ${y - 18}l-24 6`} stroke="#1b1f4b" strokeWidth="4" strokeLinecap="round" /></g>)
      mouth = <path d="M186 276q14-14 28 0" stroke="#1b1f4b" strokeWidth="4" fill="none" strokeLinecap="round" />
      extra = <path className="tear" d="M162 252q5 9 0 13-5-4 0-13z" fill="#7bd3ff" />
      break
    case 'proud':
      eyes = (<g>
        <path d={`M${eyeL - 13} ${y + 4}q13 -18 26 0`} stroke="#1b1f4b" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d={`M${eyeR - 13} ${y + 4}q13 -18 26 0`} stroke="#1b1f4b" strokeWidth="5" fill="none" strokeLinecap="round" /></g>)
      mouth = <path d="M182 262q18 24 36 0z" fill="#ff5c7a" stroke="#1b1f4b" strokeWidth="3" strokeLinejoin="round" />
      extra = <g fill="#ffd166"><path d="M150 214l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z" /><path d="M250 214l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z" /></g>
      break
    case 'curious':
      eyes = (<g className="eyes">{eyeWhite(eyeL, 14)}{eyeWhite(eyeR, 17)}{pupil(eyeL, 4, -4, 6)}{pupil(eyeR, 4, -4, 8)}
        <path d={`M${eyeR - 14} ${y - 24}q14 -8 28 0`} stroke="#1b1f4b" strokeWidth="4" fill="none" strokeLinecap="round" /></g>)
      mouth = <ellipse cx="204" cy="272" rx="6" ry="7" fill="#1b1f4b" />
      break
    default: // happy
      eyes = (<g className="eyes">{eyeWhite(eyeL)}{eyeWhite(eyeR)}{pupil(eyeL, 0, 1)}{pupil(eyeR, 0, 1)}
        <circle cx={eyeL + 3} cy={y - 3} r="2.5" fill="#fff" /><circle cx={eyeR + 3} cy={y - 3} r="2.5" fill="#fff" /></g>)
      mouth = <path d="M184 264q16 16 32 0" stroke="#1b1f4b" strokeWidth="4" fill="none" strokeLinecap="round" />
      extra = <g fill="#ff9ec5" opacity=".55"><ellipse cx="160" cy="260" rx="7" ry="4" /><ellipse cx="240" cy="260" rx="7" ry="4" /></g>
  }
  return <g className={dim ? 'face dim' : 'face'}>{extra}{eyes}<g className={talking ? 'mouth talk' : 'mouth'}>{mouth}</g></g>
}

/**
 * props: installed[], expr, color, energy (0-100), damaged (id), ghostLevel (shows ghost outlines of
 * this level's missing parts), target (id pulsing), flame, name
 */
export default function Spacecraft({ installed = [], expr = 'happy', color = '#7c5cff', energy = 100, damaged = null, ghostLevel = null, target = null, flame = false, size = 300, className = '', onClick, bob = true, label, view = '0 0 400 480', look, talking = false }) {
  const dim = energy < 30
  const ghosts = ghostLevel ? COMPONENTS.filter((c) => c.level === ghostLevel && !installed.includes(c.id)).map((c) => c.id) : []
  const show = (id) => installed.includes(id) || ghosts.includes(id)
  const draw = ORDER.filter(show)
  return (
    <svg viewBox={view} width={size} height={size * (+view.split(' ')[3] / +view.split(' ')[2])} className={`ship ${bob ? 'bob' : ''} ${className}`} onClick={onClick} role="img" aria-label={label || 'Space Buddy spacecraft'} style={{ cursor: onClick ? 'pointer' : 'default', filter: dim ? 'brightness(.62) saturate(.8)' : undefined }}>
      <defs>
        <linearGradient id={`body-${color.slice(1)}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.85" /><stop offset="1" stopColor={color} />
        </linearGradient>
      </defs>
      {draw.map((id) => {
        const P = PARTS[id]
        const isGhost = !installed.includes(id)
        return (
          <g key={id} className={`part ${isGhost ? 'ghost' : 'installed'} ${target === id ? 'target' : ''} ${damaged === id ? 'damaged' : ''}`} opacity={isGhost ? 0.22 : 1}>
            <P flame={flame} />
          </g>
        )
      })}
      {/* the original core never changes */}
      <rect x="150" y="170" width="100" height="190" rx="46" fill={`url(#body-${color.slice(1)})`} stroke="#fff" strokeOpacity=".75" strokeWidth="4" />
      <ellipse cx="180" cy="196" rx="16" ry="8" fill="#fff" opacity=".25" />
      <Face expr={expr} dim={dim} look={look} talking={talking} />
      {FRONT.filter(show).map((id) => {
        const P = PARTS[id]
        const isGhost = !installed.includes(id)
        return <g key={'top' + id} className={`part ${isGhost ? 'ghost' : 'installed'} ${damaged === id ? 'damaged' : ''}`} opacity={isGhost ? 0.22 : 1}><P /></g>
      })}
    </svg>
  )
}
