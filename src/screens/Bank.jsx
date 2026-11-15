import React, { useState } from 'react'
import { useGame } from '../state/GameContext.jsx'
import { bankStats } from '../state/game.js'

export default function Bank() {
  const { state } = useGame()
  const b = bankStats(state)
  const [f, setF] = useState('all')
  const list = state.tx.filter((t) => f === 'all' || t.type === f)
  const tiles = [
    ['💰', 'Current balance', state.balance], ['📈', 'Total credits earned', b.earned], ['📉', 'Total credits spent', b.spent],
    ['🛠️', 'Spent on components', b.components], ['💡', 'Spent on hints', b.hints], ['⛽', 'Fuel, repairs & upkeep', b.other],
  ]
  return (
    <div className="bank">
      <div className="card">
        <h2>🏦 Space Bank {state.team && <span className="pill">Shared team account</span>}</h2>
        <div className="bank-tiles">{tiles.map(([e, l, v]) => <div key={l} className="btile"><span>{e}</span><b>{v}</b><small>{l}</small></div>)}</div>
        {state.balance < 30 && <p className="notice">Low on credits? Visit the Science Academy to earn more!</p>}
      </div>
      <div className="card">
        <div className="row between wrap"><h3>📜 Transaction history</h3>
          <div className="chips">{['all', 'earn', 'spend'].map((x) => <button key={x} className={`chip ${f === x ? 'sel' : ''}`} onClick={() => setF(x)}>{x === 'all' ? 'All' : x === 'earn' ? 'Earned' : 'Spent'}</button>)}</div></div>
        {list.length === 0 ? <p className="tiny">No transactions yet. Your starting balance is 100 credits.</p> : (
          <div className="tx-list">
            {list.map((t) => <div key={t.id} className={`tx ${t.type}`}><span className="amt">{t.type === 'earn' ? '+' : '−'}{t.amount}</span><span className="lbl2">{t.label}</span>{state.team && <small>by {t.by}</small>}</div>)}
          </div>
        )}
      </div>
    </div>
  )
}
