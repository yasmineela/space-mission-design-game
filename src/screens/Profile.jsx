import { colorName } from '../data/learn.js'
import React, { useState } from 'react'
import { useGame } from '../state/GameContext.jsx'
import Astronaut, { AVATARS, SUIT_COLORS } from '../components/Astronaut.jsx'

export default function Profile() {
  const { state, dispatch } = useGame()
  const [name, setName] = useState(state.profile?.name || '')
  const [avatar, setAvatar] = useState(state.profile?.avatar || 'fox')
  const [color, setColor] = useState(state.profile?.color || SUIT_COLORS[1])
  const [mode, setMode] = useState(state.mode || 'solo')
  const [err, setErr] = useState('')
  const submit = () => {
    const n = name.trim()
    if (n.length < 3 || n.length > 14) return setErr('Pick an astronaut name with 3 to 14 characters.')
    if (!/^[A-Za-z0-9_ -]+$/.test(n)) return setErr('Use only letters, numbers, spaces, - or _.')
    if (/\d{5,}/.test(n)) return setErr('Please do not use phone numbers or real personal details!')
    dispatch({ type: 'CREATE_PROFILE', name: n, avatar, color, mode })
  }
  return (
    <div className="center-page">
      <div className="card form-card">
        <button className="btn ghost small" onClick={() => dispatch({ type: 'NAV', screen: 'welcome' })}>← Back</button>
        <h2>🧑‍🚀 Create your astronaut</h2>
        <div className="profile-grid">
          <div className="preview"><Astronaut avatar={avatar} color={color} size={170} wave float /><p className="astro-name">{name.trim() || 'Your name'}</p></div>
          <div>
            <label className="lbl">Astronaut username</label>
            <input className="input" aria-label="Astronaut username" value={name} maxLength={14} onChange={(e) => { setName(e.target.value); setErr('') }} placeholder="e.g. StarFox" />
            <p className="tiny">Tip: use a nickname – never your real name, address or school.</p>
            <label className="lbl">Avatar</label>
            <div className="chips">{AVATARS.map((a) => <button key={a.id} className={`chip emoji ${avatar === a.id ? 'sel' : ''}`} onClick={() => setAvatar(a.id)} aria-label={a.id}>{a.emoji}</button>)}</div>
            <label className="lbl">Spacesuit colour</label>
            <div className="chips">{SUIT_COLORS.map((c) => <button key={c} className={`swatch ${color === c ? 'sel' : ''}`} style={{ background: c }} onClick={() => setColor(c)} aria-label={`suit colour ${colorName(c)}`} />)}</div>
          </div>
        </div>
        <label className="lbl">Game mode</label>
        <div className="mode-grid">
          <button className={`mode ${mode === 'solo' ? 'sel' : ''}`} onClick={() => setMode('solo')}><span>🧒</span><b>SOLO MISSION</b><small>Build and operate a spacecraft independently.</small></button>
          <button className={`mode ${mode === 'team' ? 'sel' : ''}`} onClick={() => setMode('team')}><span>👫</span><b>TEAM MISSION</b><small>Invite friends and build one spacecraft together.</small></button>
        </div>
        {err && <p className="error" role="alert">⚠️ {err}</p>}
        <div className="row center"><button className="btn primary huge" onClick={submit}>Next: meet your spacecraft →</button></div>
      </div>
    </div>
  )
}
