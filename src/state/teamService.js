/**
 * TEAM SERVICE (prototype)
 * ------------------------------------------------------------------
 * Everything team-related in Space Buddy is LOCAL and SIMULATED: the teammates are scripted
 * characters that live in this browser's saved game. Nothing here talks to a network.
 *
 * The code is organised so that real multiplayer can replace it later:
 *  - `state.team` is the single shared "room" document (members, shared bank lives in state.balance,
 *    one spacecraft, one crew, one decision log, one event feed).
 *  - Every shared change goes through the reducer in game.js and appends to `team.feed`
 *    (an event log) and bumps `team.rev` (a revision counter). A real backend would broadcast
 *    those events and apply them in order; `rev` would be used to detect conflicting writes.
 *  - Teammate behaviour (votes, tips, purchases) is produced by the helpers below; a real
 *    implementation would replace them with messages arriving from other players' devices.
 */
import { ITEMS } from '../data/catalog.js'

export const EMBLEMS = ['🚀', '🦊', '🌟', '🛰️', '🪐', '🐉', '⚡', '🦅']
export const MAX_MEMBERS = 4

export const genCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const pick = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${pick()}-${pick()}`
}
export const validCode = (c) => /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(c)

// scripted teammates (simulated). `votes` are their fixed preferences per level decision.
export const SIM_ROSTER = [
  { id: 'sim1', name: 'Nova', avatar: 'fox', color: '#35d0ff', votes: { 1: 'A', 2: 'B', 3: 'A' } },
  { id: 'sim2', name: 'Orion', avatar: 'robot', color: '#ff9f43', votes: { 1: 'B', 2: 'A', 3: 'B' } },
  { id: 'sim3', name: 'Luna', avatar: 'panda', color: '#a78bfa', votes: { 1: 'A', 2: 'A', 3: 'B' } },
]
export const SIM_SCIENCE_LIMIT = 3 // each simulated teammate may finish at most this many Academy activities
export const SIM_BUY_LIMIT_PER_LEVEL = 1

// Team decisions: which of two parts to buy first. i and j are step positions that swap.
export const DECISIONS = {
  1: { i: 1, j: 3, title: 'First big purchase – Level 1',
    A: { target: 'engine', reason: 'without thrust we cannot go anywhere!' }, B: { target: 'antenna', reason: 'we need to talk to Mission Control and it is cheaper.' } },
  2: { i: 2, j: 3, title: 'Priority – Level 2',
    A: { target: 'nav', reason: 'we must know where we are and where we are heading.' }, B: { target: 'solar', reason: 'everything needs energy, so power comes first.' } },
  3: { i: 0, j: 1, title: 'Mars-ready upgrade – Level 3',
    A: { target: 'adv_prop', reason: 'an efficient engine saves fuel on the long trip.' }, B: { target: 'adv_comm', reason: 'we need a strong link to Earth over long distances.' } },
}

export const blankStats = () => ({ sci: 0, earned: 0, bought: [], installed: [], training: [], tips: 0, votes: 0 })
export const statsOf = (team, id) => ({ ...blankStats(), ...(team?.stats?.[id] || {}) })
export const crewKey = (crew) => [...crew].sort().join('|')

// how the swap from a decision changes a level's step order
export function applyDecision(steps, level, decision) {
  if (!decision || !decision.result) return steps
  const d = DECISIONS[level]
  if (!d || decision.result !== 'B') return steps
  const arr = [...steps]
  ;[arr[d.i], arr[d.j]] = [arr[d.j], arr[d.i]]
  return arr
}

// Friendly, non-competitive recognition text for the Contribution Board
export function recognition(team, member, isMe) {
  const st = statsOf(team, member.id)
  const who = isMe ? 'You' : member.name
  const lines = []
  if (st.earned > 0) lines.push(`${isMe ? 'You' : member.name} earned ${st.earned} credits through science challenges!`)
  if (st.bought.length) { const names = st.bought.map((id) => ITEMS[id]?.name).filter(Boolean); lines.push(`${who} purchased the ${names.length > 1 ? names.slice(0, -1).join(', the ') + ' and the ' + names[names.length - 1] : names[0]}!`) }
  if (st.installed.length) lines.push(`${who} ${isMe ? 'completed' : 'completed'} the ${ITEMS[st.installed[st.installed.length - 1]]?.name.toLowerCase()} installation!`)
  if (st.tips) lines.push(`${who} shared ${st.tips} helpful tip${st.tips > 1 ? 's' : ''} on team challenges.`)
  if (st.votes) lines.push(`${who} helped make ${st.votes} team decision${st.votes > 1 ? 's' : ''}.`)
  if (!lines.length) lines.push(`${who} ${isMe ? 'are' : 'is'} ready to help – every contribution counts!`)
  return lines
}

// Scripted comments a teammate gives about the chosen crew
export function crewComment(sim, crew, specs, needs) {
  if (!crew.length) return 'Let us choose some astronauts first!'
  const have = crew.map((a) => specs[a.skill].name.toLowerCase())
  const missing = needs.filter((n) => !crew.some((a) => a.skill === n.id))
  const first = crew[(sim.id.charCodeAt(sim.id.length - 1)) % crew.length]
  const miss = missing.length ? ` We may need to be extra careful with ${specs[missing[0].id].need.toLowerCase()}.` : ' Our crew covers every need!'
  return `I like having ${first.name.split(' ')[0]} (${specs[first.skill].name.toLowerCase()}) on board.${miss}`
}
