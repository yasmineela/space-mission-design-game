import React, { useEffect, useState } from 'react'
import { useGame } from '../state/GameContext.jsx'
import Spacecraft from '../components/Spacecraft.jsx'
import { resumeScreen } from '../state/game.js'
import { hasBackup, restoreBackup } from '../state/GameContext.jsx'
import { Modal } from '../components/ui.jsx'

const GREETINGS = ["Hey! I'm your future spacecraft. Are you ready to take me to Mars?", 'Together we can build a real space mission!', "Let's earn credits, build my parts and fly to the Red Planet!"]
function Greeting() {
  const [i, setI] = useState(0)
  const [n, setN] = useState(0)
  useEffect(() => {
    const msg = GREETINGS[i]
    if (n < msg.length) { const t = setTimeout(() => setN(n + 1), 32); return () => clearTimeout(t) }
    const t = setTimeout(() => { setI((i + 1) % GREETINGS.length); setN(0) }, 2600)
    return () => clearTimeout(t)
  }, [i, n])
  return <div className="hero-bubble" aria-live="polite">{GREETINGS[i].slice(0, n)}<span className="caret">|</span></div>
}

export default function Welcome() {
  const { state, dispatch } = useGame()
  const [confirm, setConfirm] = useState(false)
  const hasSave = state.profile && state.adopted
  const start = () => (hasSave ? setConfirm(true) : dispatch({ type: 'NAV', screen: 'profile' }))
  return (
    <div className="welcome">
      <div className="hero">
        <h1 className="logo">SPACE <span>BUDDY</span></h1>
        <p className="subtitle">Your journey to Mars starts here!</p>
        <div className="hero-ship">
          <Greeting />
          <div className="halo" />
          <div className="big-planet earth-big" /><div className="big-planet mars-big" />
          <Spacecraft installed={['capsule', 'engine', 'tank', 'antenna', 'solar']} expr="excited" color="#7c5cff" size={320} flame />
        </div>
        <div className="row center wrap">
          {hasSave && <button className="btn primary huge" onClick={() => dispatch({ type: 'NAV', screen: resumeScreen(state) })}>▶ CONTINUE MISSION</button>}
          {!hasSave && hasBackup() && <button className="btn secondary" onClick={restoreBackup}>♻️ Restore my previous game</button>}
          <button className={`btn ${hasSave ? 'ghost' : 'primary huge'}`} onClick={start}>{hasSave ? 'Start a new mission' : '🚀 START YOUR MISSION'}</button>
        </div>
        <p className="tiny">Progress is saved automatically on this device. No personal information is collected.</p>
      </div>
      {confirm && (
        <Modal onClose={() => setConfirm(false)}>
          <h2>Start a new mission?</h2>
          <p>This will start a new game in place of your current spacecraft <b>{state.shipName}</b>, credits and progress. Don't worry: your last game is kept as a backup you can restore from this screen.</p>
          <div className="row center">
            <button className="btn danger" onClick={() => { dispatch({ type: 'RESET' }); dispatch({ type: 'NAV', screen: 'profile' }); setConfirm(false) }}>Yes, start over</button>
            <button className="btn ghost" onClick={() => setConfirm(false)}>Keep my progress</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
