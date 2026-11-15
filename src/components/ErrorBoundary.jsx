import React from 'react'
import { SAVE_KEY } from '../state/game.js'

// Shows a friendly screen instead of a blank page if something unexpected happens. Saved progress is untouched.
export default class ErrorBoundary extends React.Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error) { console.error('Space Buddy error:', error) }
  home = () => {
    try { const raw = localStorage.getItem(SAVE_KEY); if (raw) { const s = JSON.parse(raw); s.screen = s.adopted ? 'dashboard' : 'welcome'; localStorage.setItem(SAVE_KEY, JSON.stringify(s)) } } catch (e) { /* ignore */ }
    location.reload()
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="center-card card" role="alert" style={{ margin: '60px auto', maxWidth: 560, position: 'relative', zIndex: 5 }}>
        <h2>🛰️ Oops – Mission Control lost the signal!</h2>
        <p>Something unexpected happened. <b>Your saved game is safe.</b> Try again, or go back to your space station.</p>
        <div className="row center wrap">
          <button className="btn primary" onClick={() => this.setState({ error: null })}>Try again</button>
          <button className="btn secondary" onClick={this.home}>Go to my space station</button>
        </div>
      </div>
    )
  }
}
