import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react'
import { reducer, loadState, saveState, SAVE_KEY } from './game.js'

const BACKUP_KEY = SAVE_KEY + '.backup'
const Ctx = createContext(null)

// A safety net so a player can never lose a game by accident: the previous save is copied
// to a backup before a reset, and an unreadable save is kept instead of being overwritten.
export const hasBackup = () => { try { return !!localStorage.getItem(BACKUP_KEY) } catch (e) { return false } }
export const restoreBackup = () => { try { const raw = localStorage.getItem(BACKUP_KEY); if (raw) { localStorage.setItem(SAVE_KEY, raw); location.reload() } } catch (e) { /* storage unavailable */ } }

export function GameProvider({ children }) {
  const [state, rawDispatch] = useReducer(reducer, undefined, loadState)
  useEffect(() => { saveState(state) }, [state])
  const dispatch = useCallback((a) => {
    if (a.type === 'RESET') { try { const raw = localStorage.getItem(SAVE_KEY); if (raw) localStorage.setItem(BACKUP_KEY, raw) } catch (e) { /* ignore */ } }
    rawDispatch(a)
  }, [])
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>
}
export const useGame = () => useContext(Ctx)
