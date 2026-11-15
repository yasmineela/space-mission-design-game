import React, { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { useGame } from './state/GameContext.jsx'
import { BADGES, ACHIEVEMENTS, isUnlocked } from './state/game.js'
import Starfield from './components/Starfield.jsx'
import Companion from './components/Companion.jsx'
import Timeline from './components/Timeline.jsx'
import Astronaut from './components/Astronaut.jsx'
import { Confetti, Modal } from './components/ui.jsx'
import Welcome from './screens/Welcome.jsx'
import Profile from './screens/Profile.jsx'
import Adopt from './screens/Adopt.jsx'
import TeamLobby from './screens/TeamLobby.jsx'
import Dashboard from './screens/Dashboard.jsx'
const Workshop = lazy(() => import('./screens/Workshop.jsx'))
const Book = lazy(() => import('./screens/Book.jsx'))
const Academy = lazy(() => import('./screens/Academy.jsx'))
const Bank = lazy(() => import('./screens/Bank.jsx'))
const Crew = lazy(() => import('./screens/Crew.jsx'))
const Training = lazy(() => import('./screens/Training.jsx'))
const MissionControl = lazy(() => import('./screens/MissionControl.jsx'))
const PetScreen = lazy(() => import('./screens/PetScreen.jsx'))
const Launch = lazy(() => import('./screens/Launch.jsx'))
const Interior = lazy(() => import('./screens/Interior.jsx'))
const Mars = lazy(() => import('./screens/Mars.jsx'))
const Report = lazy(() => import('./screens/Report.jsx'))
const TeamLaunch = lazy(() => import('./screens/TeamLaunch.jsx'))
import { LEVELS } from './data/catalog.js'

const SCREENS = {
  welcome: Welcome, profile: Profile, adopt: Adopt, team: TeamLobby, dashboard: Dashboard, workshop: Workshop,
  book: Book, academy: Academy, bank: Bank, crew: Crew, training: Training, mission: MissionControl, pet: PetScreen,
  launch: Launch, interior: Interior, mars: Mars, report: Report, teamlaunch: TeamLaunch,
}
const NO_SHELL = ['welcome', 'profile', 'adopt', 'launch']
const SHOW_CONSTRUCTION_TL = ['workshop', 'book', 'crew', 'training', 'mission', 'academy', 'bank', 'pet', 'team', 'teamlaunch']
const SHOW_MISSION_TL = ['interior', 'mars', 'report', 'pet', 'bank', 'book', 'team']

function BalanceChip({ balance, onClick }) {
  const prev = useRef(balance)
  const [delta, setDelta] = useState(null)
  useEffect(() => {
    const d = balance - prev.current
    prev.current = balance
    if (!d) return
    setDelta({ d, id: Date.now() })
    const t = setTimeout(() => setDelta(null), 1500)
    return () => clearTimeout(t)
  }, [balance])
  return (
    <button className={`bank-chip ${delta ? (delta.d > 0 ? 'bump-up' : 'bump-down') : ''}`} onClick={onClick} title="Open Space Bank">
      💰 <b>{balance}</b> credits
      {delta && <span key={delta.id} className={`delta ${delta.d > 0 ? 'up' : 'down'}`}>{delta.d > 0 ? '+' : '−'}{Math.abs(delta.d)}</span>}
    </button>
  )
}

function TopBar() {
  const { state, dispatch } = useGame()
  const p = state.profile
  const go = (screen) => dispatch({ type: 'NAV', screen })
  return (
    <header className="topbar">
      <button className="btn ghost small" onClick={() => go('dashboard')} aria-label="Back to space station">🏠 Space Station</button>
      <div className="tb-ship">🚀 <b>{state.shipName || 'Your spacecraft'}</b>{state.mode === 'team' && <span className="pill">Team {state.team?.code}</span>}</div>
      <div className="tb-right">
        <BalanceChip balance={state.balance} onClick={() => go('bank')} />
        {p && <div className="tb-player"><Astronaut avatar={p.avatar} color={p.color} size={34} /><span>{p.name}</span></div>}
      </div>
    </header>
  )
}

function TeamToast() {
  const { state } = useGame()
  const n = state.team?.notice
  const [shown, setShown] = useState(null)
  useEffect(() => {
    if (!n?.n || !n.text) return
    setShown(n)
    const t = setTimeout(() => setShown(null), 4200)
    return () => clearTimeout(t)
  }, [n?.n])
  if (!shown) return null
  return <div className="team-toast" role="status" key={shown.n}>{state.team?.emblem || '👫'} {shown.text}</div>
}

// A short celebration whenever a badge or achievement is earned DURING play (never on load). It repeats the
// information in text (role="status"), so nothing depends on colour or motion alone.
function RewardToast() {
  const { state } = useGame()
  const seen = useRef(null)
  const [queue, setQueue] = useState([])
  const [shown, setShown] = useState(null)
  useEffect(() => {
    const badges = Object.keys(state.claimed || {})
    const ach = ACHIEVEMENTS.filter((a) => isUnlocked(state, a)).map((a) => a.id)
    if (seen.current === null) { seen.current = { badges, ach }; return }
    const found = []
    // earned together (for example when a mission ends) = ONE toast, so rewards never queue up for 20 seconds
    const nb = badges.filter((id) => !seen.current.badges.includes(id)).map((id) => BADGES.find((x) => x.id === id)).filter(Boolean)
    if (nb.length === 1) found.push({ key: 'b' + nb[0].id, icon: nb[0].emoji, title: 'Badge earned: ' + nb[0].name, sub: `+${nb[0].credits} credits` })
    else if (nb.length > 1) found.push({ key: 'b' + nb.map((b) => b.id).join(''), icon: '🏅', title: `${nb.length} badges earned!`, sub: `${nb.map((b) => b.emoji + ' ' + b.name).join(', ')} · +${nb.reduce((a, b) => a + b.credits, 0)} credits` })
    const na = ach.filter((id) => !seen.current.ach.includes(id)).map((id) => ACHIEVEMENTS.find((x) => x.id === id)).filter(Boolean)
    if (na.length === 1) found.push({ key: 'a' + na[0].id, icon: na[0].emoji, title: 'Achievement unlocked: ' + na[0].name, sub: na[0].desc })
    else if (na.length > 1) found.push({ key: 'a' + na.map((a) => a.id).join(''), icon: '🏆', title: `${na.length} achievements unlocked!`, sub: na.map((a) => a.emoji + ' ' + a.name).join(', ') })
    seen.current = { badges, ach }
    if (found.length) setQueue((q) => [...q, ...found])
  }, [state.claimed, state.achieved, state.mission.arrived, state.mission.launched, state.mission.finished, state.assembled, state.training, state.academy.done, state.adopted])
  useEffect(() => {
    if (shown || !queue.length) return
    setShown(queue[0]); setQueue((q) => q.slice(1))
  }, [queue, shown])
  useEffect(() => {
    if (!shown) return
    const t = setTimeout(() => setShown(null), 4800)
    return () => clearTimeout(t)
  }, [shown])
  if (!shown) return null
  return (
    <div className="reward-toast" role="status" key={shown.key}>
      <Confetti once />
      <span className="rt-icon" aria-hidden="true">{shown.icon}</span>
      <span><b>{shown.title}</b><small>{shown.sub}</small></span>
    </div>
  )
}

function LevelUpModal() {
  const { state, dispatch } = useGame()
  const lu = state.levelUp
  if (!lu) return null
  const next = LEVELS[lu.level]
  const allDone = lu.level === 3
  const close = () => dispatch({ type: 'DISMISS_LEVELUP' })
  return (
    <Modal onClose={close} className="levelup">
      <Confetti />
      <h2>🎉 LEVEL {lu.level} COMPLETE! 🎉</h2>
      <p className="big">We did it! We're one step closer to Mars!</p>
      <p>{lu.reward > 0 ? <>Reward: <b className="gold">+{lu.reward} credits</b></> : <>Your bonus for this level was already collected earlier, so no credits are paid twice.</>}</p>
      <p>{allDone ? 'All 15 components are bought! Head to the workshop and run FINAL ASSEMBLY.' : `The instruction book for ${next.title} is now unlocked.`}</p>
      <div className="row center">
        <button className="btn primary" onClick={() => { close(); dispatch({ type: 'NAV', screen: allDone ? 'workshop' : 'book' }) }}>{allDone ? 'Go to the workshop' : 'Open next instruction book'}</button>
        <button className="btn ghost" onClick={close}>Keep looking at my ship</button>
      </div>
    </Modal>
  )
}

export default function App() {
  const { state, dispatch } = useGame()
  const Screen = SCREENS[state.screen] || Welcome
  const shell = !NO_SHELL.includes(state.screen)
  // the companion notices its own condition: on arrival, then every minute (throttled in the reducer)
  useEffect(() => { if (state.adopted && state.screen !== 'welcome') dispatch({ type: 'PET_ALERT' }) }, [state.screen])
  useEffect(() => {
    if (!state.adopted) return
    const alertId = setInterval(() => dispatch({ type: 'PET_ALERT' }), 45000)
    const tickId = setInterval(() => dispatch({ type: 'TICK' }), 180000) // 1 point per 3 minutes, with a comfortable floor
    return () => { clearInterval(alertId); clearInterval(tickId) }
  }, [state.adopted])
  useEffect(() => { if (state.adopted && state.screen !== 'welcome') dispatch({ type: 'SAY', pool: 'welcomeBack' }) }, [])
  const mTl = state.mission.launched && SHOW_MISSION_TL.includes(state.screen)
  const cTl = !state.mission.launched && SHOW_CONSTRUCTION_TL.includes(state.screen)
  return (
    <>
      <Starfield planets={state.screen !== 'launch'} />
      {shell && <TopBar />}
      {shell && (cTl || mTl) && <Timeline mission={mTl} />}
      <main className={`screen screen-${state.screen}`} key={state.screen}><Suspense fallback={<div className="loading" role="status">🚀 Loading…</div>}><Screen /></Suspense></main>
      {shell && !['dashboard', 'pet'].includes(state.screen) && !(state.screen === 'mars' && state.mission.arrived) && <Companion />}
      <LevelUpModal />
      {state.adopted && state.screen !== 'welcome' && <RewardToast />}
      {state.team && state.screen !== 'welcome' && <TeamToast />}
    </>
  )
}
