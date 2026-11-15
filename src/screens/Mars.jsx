import React, { useEffect, useState } from 'react'
import { useGame } from '../state/GameContext.jsx'
import Spacecraft from '../components/Spacecraft.jsx'
import ChallengeModal from '../components/ChallengeModal.jsx'
import MarsExplore from '../components/MarsExplore.jsx'
import { useExpression } from '../components/Companion.jsx'
import { Confetti } from '../components/ui.jsx'

export default function Mars() {
  const { state, dispatch } = useGame()
  const expr = useExpression()
  const m = state.mission
  const step = m.arrived ? 2 : Math.max(m.marsStep, 0)
  const [approach, setApproach] = useState(false)
  const [ch, setCh] = useState(false)
  useEffect(() => { if (step === 0) { const t = setTimeout(() => setApproach(true), 600); return () => clearTimeout(t) } }, [step])

  return (
    <div className="mars">
      {step < 2 && <div className="card mars-banner"><h2 className="arrive-title">🔭 {step === 0 ? 'Mission Control: Mars is now within visual range.' : 'Mission Control: Prepare for final mission procedures.'}</h2></div>}
      {step >= 2 && <div className="card mars-banner"><Confetti once /><h2 className="arrive-title">🔴 WE MADE IT! WELCOME TO MARS!</h2><p className="arrive-quote">"Mission Control: {state.shipName} has arrived at Mars!" The crew has landed – time to explore with the rover.</p></div>}

      {step < 2 && (
        <>
          <div className="card mars-stage window-frame">
            <div className={`mars-planet ${step === 0 ? (approach ? 'approach' : '') : 'orbit'}`}>
              <div className="mars-body" />
              {step === 1 && <div className="orbit-ring"><span>🛰️</span></div>}
            </div>
            <div className="mars-ship"><Spacecraft installed={state.installed} expr={expr} color={state.shipColor} size={140} flame={step === 1} /></div>
          </div>
          <div className="card">
            {step === 0 && <><h3>1. Approaching Mars</h3><p>Mars is growing in the window… You can see its red-orange surface, dusty plains and giant volcanoes.</p><button className="btn primary" onClick={() => dispatch({ type: 'MARS_STEP', step: 1 })}>🛰️ Begin final procedures</button></>}
            {step === 1 && (
              <>
                <h3>2. Final procedures: orbit insertion</h3>
                <p>To be captured by Mars' gravity the spacecraft must slow down. Decide how to fire the engine – this is a physics decision!</p>
                {!m.challenges.calc ? <button className="btn primary" onClick={() => setCh(true)}>⚛️ Start orbit insertion</button> : <button className="btn primary huge pulse" onClick={() => dispatch({ type: 'MARS_STEP', step: 2 })}>🎉 Land on Mars!</button>}
              </>
            )}
          </div>
        </>
      )}
      {step >= 2 && <MarsExplore />}
      {ch && <ChallengeModal id="calc" onClose={() => setCh(false)} />}
    </div>
  )
}
