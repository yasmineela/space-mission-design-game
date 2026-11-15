import { COMPONENTS, ITEMS, LEVELS, CORE_WEIGHT, WEIGHT_LIMIT, ESSENTIALS } from '../data/catalog.js'
import { ACT_BY_ID, TIERS, HINT_COST } from '../data/academy.js'
import { CREW_BY_ID, CREW_SLOTS, TRAINING, XP_PER_MODULE, RANKS } from '../data/crew.js'
import { CHALLENGES, ALL_CHALLENGES, EXPERIMENTS, MC_SCRIPT, MC_ALERT, CREW_TALK, QUALITY_SCORE } from '../data/mission.js'
import { MSG, ENCOURAGE } from '../data/messages.js'
import { MAX_MEMBERS, SIM_ROSTER, SIM_SCIENCE_LIMIT, SIM_BUY_LIMIT_PER_LEVEL, DECISIONS, blankStats, statsOf, applyDecision, crewKey } from './teamService.js'
import { ACTIVITIES } from '../data/academy.js'
import { ROVER, SITE_BY_ID, roverCost, roverKm, SAMPLE_REQUIRED } from '../data/mars.js'

export const SAVE_KEY = 'spacebuddy.save.v1'
export const SCI_GOAL = 5
export const FUEL_PRICE = 15
export const FUEL_AMOUNT = 20
export const REPAIR_PRICE = 15
export const MAINTAIN_PRICE = 10
export const SIM_NAMES = SIM_ROSTER

export const initialState = () => ({
  screen: 'welcome',
  profile: null,
  mode: 'solo',
  team: null,
  shipName: '',
  shipColor: '#7c5cff',
  adopted: false,
  level: 1,
  levelsDone: [],
  balance: 100,
  tx: [],
  installed: [],
  assembled: false,
  academy: { done: {}, hints: {} },
  hintsUsed: 0,
  crew: [],
  crewLocked: false,
  training: {},
  trainingRecord: {},
  xp: 0,
  pet: { energy: 70, fuel: 20, health: 100, maintenance: 60, happiness: 60, damaged: null, lastTick: Date.now(), plays: 0, fx: { kind: '', n: 0 }, lastAlert: null },
  say: { text: '', mood: 'happy', n: 0, t: 0 },
  msgCount: 0,
  encourage: ENCOURAGE.start[0],
  claimed: {}, achieved: {}, history: [], attempt: 1, stats: { wrongBuys: 0 }, levelPaid: {},
  feedback: null,
  levelUp: null,
  mission: {
    launched: false, progress: 0, oxygen: 100, comm: 'Online', navStatus: 'On course',
    activities: {}, challenges: {}, pending: null, decisions: [], score: 0, log: [],
    marsStep: 0, marsData: [], arrived: false, finished: false, emergencyUsed: false, research: [],
    water: 100, messages: [], msgSeq: 0, sent: [], sciXp: 0, solarCharges: 0, lifeDone: {}, talks: {}, approach: false, marsActs: {},
    coasted: false, result: null,
    explore: { pos: 'base', battery: 100, distance: 0, visited: {}, scanned: {}, photos: [], samples: [], analysed: {}, q: {}, acts: {}, recharges: 0, towed: false, hints: 0 },
  },
})

/* ---------------- derived selectors ---------------- */
export const weightOf = (s) => CORE_WEIGHT + s.installed.reduce((a, id) => a + ITEMS[id].weight, 0)
export const requiredFuel = (s) => {
  const base = weightOf(s) / 160
  return Math.max(10, Math.round(s.installed.includes('adv_prop') ? base * 0.85 : base))
}
// the steps of a level in the order the (team) has chosen – a team decision can swap two steps
export const stepsOf = (s, n = s.level) => applyDecision(LEVELS[n - 1].steps, n, s.team?.decisions?.[n])
export const stepIndex = (s, n = s.level) => {
  const steps = stepsOf(s, n)
  let i = 0
  while (i < steps.length && s.installed.includes(steps[i].target)) i++
  return i
}
export const trainingCount = (s) => TRAINING.filter((t) => s.training[t.id]).length
export const scienceCount = (s) => Object.keys(s.academy.done).length
export const teamConfirmed = (s) => !s.team || s.team.members.every((m) => s.team.confirms[m.id])
export const preflight = (s) => [
  { id: 'fuel', ok: s.pet.fuel >= requiredFuel(s), label: `Fuel loaded: ${Math.round(s.pet.fuel)} / ${requiredFuel(s)} needed for Mars` },
  { id: 'energy', ok: s.pet.energy >= 50, label: `Energy at least 50% (now ${Math.round(s.pet.energy)}%)` },
  { id: 'health', ok: s.pet.health >= 50 && !s.pet.damaged, label: s.pet.damaged ? 'A damaged part needs repair' : `Health at least 50% (now ${Math.round(s.pet.health)}%)` },
]
export function constructionStages(s) {
  const prior = [
    { key: 'adopted', label: 'Spacecraft adopted', frac: s.adopted ? 1 : 0 },
    { key: 'science', label: 'Science challenges completed', frac: Math.min(1, scienceCount(s) / SCI_GOAL), detail: `${Math.min(scienceCount(s), SCI_GOAL)}/${SCI_GOAL}` },
    { key: 'components', label: 'Components purchased', frac: s.installed.length / COMPONENTS.length, detail: `${s.installed.length}/${COMPONENTS.length}` },
    { key: 'assembled', label: 'Spacecraft assembled', frac: s.assembled ? 1 : 0 },
    { key: 'crew', label: 'Astronaut crew selected', frac: s.crewLocked ? 1 : s.crew.length / CREW_SLOTS, detail: `${s.crew.length}/${CREW_SLOTS}` },
    { key: 'training', label: 'Astronaut training completed', frac: trainingCount(s) / TRAINING.length, detail: `${trainingCount(s)}/${TRAINING.length}` },
  ]
  const readyAll = prior.every((p) => p.frac >= 1) && preflight(s).every((c) => c.ok) && teamConfirmed(s)
  const all = [...prior, { key: 'ready', label: 'Ready for launch', frac: readyAll ? 1 : 0 }]
  all.forEach((st) => (st.done = st.frac >= 1))
  const cur = all.findIndex((x) => !x.done)
  all.forEach((st, i) => (st.state = st.done ? 'done' : i === cur ? 'current' : 'todo'))
  return all
}
export const constructionPct = (s) => {
  const st = constructionStages(s)
  return Math.round((st.reduce((a, x) => a + Math.min(1, x.frac), 0) / st.length) * 100)
}
// where "Continue" should take the player
export const resumeScreen = (s) => {
  const m = s.mission
  if (m.launched) return m.finished ? 'report' : m.approach || m.arrived ? 'mars' : 'interior'
  return 'dashboard'
}
export const isReadyToLaunch = (s) => constructionStages(s).every((x) => x.done)
const surface3 = (m) => ['terrain', 'samples', 'water'].every((id) => m.explore?.acts?.[id])
export const experimentsDone = (s) => EXPERIMENTS.filter((id) => s.mission.activities[id]).length
export const missionStages = (s) => {
  const m = s.mission
  const chs = Object.keys(m.challenges).filter((id) => id !== 'calc').length
  const surface = ['terrain', 'samples', 'water'].filter((id) => m.explore?.acts?.[id]).length + (m.explore?.pos === 'base' && surface3(m) ? 1 : 0)
  const approach = m.approach || m.arrived
  const L = m.launched ? 1 : 0
  const fr = [
    L, L, L, Math.min(1, m.progress / 30), experimentsDone(s) / EXPERIMENTS.length, chs / CHALLENGES.length,
    m.arrived ? 1 : approach ? 0.5 : Math.min(0.3, (m.progress / 100) * 0.3),
    m.finished ? 1 : m.arrived ? 0.3 + 0.7 * (surface / 4) : 0,
  ]
  const names = ['Earth launch', 'Leaving Earth\u2019s atmosphere', 'Entering space', 'Spacecraft operations', 'Scientific experiments', 'Mission challenges', 'Mars approach', 'Mars arrival']
  const out = names.map((label, i) => ({ key: 'm' + i, label, frac: fr[i], done: fr[i] >= 1 }))
  const cur = out.findIndex((x) => !x.done)
  out.forEach((st, i) => (st.state = st.done ? 'done' : i === cur ? 'current' : 'todo'))
  return out
}
export const missionPct = (s) => {
  const st = missionStages(s)
  return Math.round((st.reduce((a, x) => a + x.frac, 0) / st.length) * 100)
}
export const bankStats = (s) => {
  const sum = (f) => s.tx.filter(f).reduce((a, t) => a + t.amount, 0)
  return {
    earned: sum((t) => t.type === 'earn'),
    spent: sum((t) => t.type === 'spend'),
    components: sum((t) => t.cat === 'component'),
    hints: sum((t) => t.cat === 'hint'),
    other: sum((t) => t.type === 'spend' && t.cat !== 'component' && t.cat !== 'hint'),
  }
}
export const crewHas = (s, skill) => s.crew.some((id) => CREW_BY_ID[id]?.skill === skill)
export const certified = (s) => TRAINING.every((t) => s.training[t.id])
export const rankOf = (xp) => RANKS.filter(([, min]) => xp >= min).pop()[0]
export const ACHIEVEMENTS = [
  { id: 'first', emoji: '🥚', name: 'First Steps in Space', desc: 'Adopted a spacecraft.', test: (s) => s.adopted },
  { id: 'scientist', emoji: '🔬', name: 'Young Scientist', desc: 'Completed 5 science challenges.', test: (s) => scienceCount(s) >= SCI_GOAL },
  { id: 'engineer', emoji: '🛠️', name: 'Space Engineer', desc: 'Completed spacecraft construction.', test: (s) => s.assembled },
  { id: 'team', emoji: '🤝', name: 'Team Player', desc: 'Built a spacecraft with friends.', test: (s) => !!s.team && s.assembled },
  { id: 'commander', emoji: '🚀', name: 'Mission Commander', desc: 'Successfully launched.', test: (s) => s.mission.launched },
  { id: 'certified', emoji: '🎖️', name: 'Certified Mission Commander', desc: 'Completed all four training modules.', test: (s) => certified(s) },
  { id: 'mars', emoji: '🔴', name: 'Mars Explorer', desc: 'Reached Mars.', test: (s) => s.mission.arrived },
  { id: 'investigator', emoji: '🔬', name: 'Scientific Investigator', desc: 'Completed all three Mars exploration activities.', test: (s) => !!s.claimed?.investigator || surface3(s.mission) },
  { id: 'resource', emoji: '🔋', name: 'Resource Manager', desc: 'Kept every resource healthy to the end.', test: (s) => !!s.claimed?.resource },
  { id: 'solver', emoji: '🧩', name: 'Problem Solver', desc: 'Handled at least 6 mission challenges well.', test: (s) => !!s.claimed?.solver },
]

// ---------------- badges (credits are paid ONCE per badge, ever) ----------------
const mgmtOk = (s) => [s.pet.fuel, s.pet.energy, s.mission.oxygen, s.mission.water ?? 100].every((v) => v >= 30) && !s.mission.coasted && !s.mission.explore?.towed
// an achievement stays unlocked forever once earned (even after replaying or redesigning)
export const isUnlocked = (s, a) => !!s.achieved?.[a.id] || !!a.test(s)
export const BADGES = [
  { id: 'mars', emoji: '🔴', name: 'Mars Explorer', credits: 30, desc: 'Reached Mars.', test: (s) => s.mission.arrived },
  { id: 'investigator', emoji: '🔬', name: 'Scientific Investigator', credits: 40, desc: 'Completed all three exploration activities.', test: (s) => surface3(s.mission) },
  { id: 'resource', emoji: '🔋', name: 'Resource Manager', credits: 30, desc: 'Finished with fuel, energy, oxygen and water all at 30%+ and no rescues.', test: (s) => s.mission.finished && mgmtOk(s) },
  { id: 'solver', emoji: '🧩', name: 'Problem Solver', credits: 30, desc: 'Handled at least 6 mission challenges well.', test: (s) => s.mission.finished && Object.values(s.mission.challenges).filter((c) => c.quality !== 'poor').length >= 6 },
  { id: 'commander', emoji: '⭐', name: 'Mission Commander', credits: 50, desc: 'Completed the whole Earth-to-Mars mission.', test: (s) => s.mission.finished },
]
function claimBadges(s) {
  let out = s
  const names = []
  BADGES.forEach((b) => {
    if (out.claimed?.[b.id] || !b.test(out)) return
    out = addTx(out, 'earn', 'achievement', b.credits, `Badge earned: ${b.name}`)
    out = { ...out, claimed: { ...(out.claimed || {}), [b.id]: { credits: b.credits, attempt: out.attempt || 1 } } }
    names.push(b.name)
  })
  if (names.length && out.team) out = notify(feed(out, `Your team earned the badge${names.length > 1 ? 's' : ''}: ${names.join(', ')}!`, 'me', 0, 'level'), `Badge earned: ${names[0]}!`)
  return out
}

// ---------------- fair scoring: five categories, effort and learning are rewarded ----------------
export function computeScore(s) {
  const m = s.mission, e = m.explore || {}
  const attempts = Object.values(e.q || {})
  const qScore = attempts.length ? attempts.reduce((a, n) => a + (n <= 1 ? 1 : n === 2 ? 0.7 : 0.5), 0) / attempts.length : 0 // right after a retry still counts
  const acts = ['terrain', 'samples', 'water'].filter((id) => e.acts?.[id]).length
  const knowledge = Math.round(100 * (0.4 * qScore + 0.3 * (acts / 3) + 0.3 * (experimentsDone(s) / EXPERIMENTS.length)))
  const wrong = s.stats?.wrongBuys || 0
  const design = Math.max(20, Math.min(100, (s.assembled ? 40 : 15) + (weightOf(s) <= WEIGHT_LIMIT ? 20 : 0) + Math.max(0, 40 - 8 * wrong)))
  const resAvg = (s.pet.fuel + s.pet.energy + m.oxygen + (m.water ?? 100)) / 4
  const pen = (m.emergencyUsed ? 15 : 0) + (m.coasted ? 15 : 0) + (e.towed ? 10 : 0)
  const resources = Math.round(0.5 * resAvg + 0.5 * Math.max(30, 100 - pen))
  const problem = Math.min(100, Math.round(Object.values(m.challenges).reduce((a, c) => a + c.score, 0) / ALL_CHALLENGES.length))
  const visited = Object.keys(e.visited || {}).filter((id) => id !== 'base').length
  const exploration = Math.round(100 * (0.4 * (visited / 5) + 0.2 * (Math.min((e.photos || []).length, 3) / 3) + 0.25 * (Math.min((e.samples || []).length, 3) / 3) + 0.15 * (e.pos === 'base' && visited > 0 ? 1 : 0)))
  const cats = [
    { id: 'knowledge', label: 'Scientific knowledge', emoji: '🔬', value: knowledge },
    { id: 'design', label: 'Spacecraft design', emoji: '🛠️', value: design },
    { id: 'resources', label: 'Resource management', emoji: '🔋', value: resources },
    { id: 'problems', label: 'Problem-solving', emoji: '🧩', value: problem },
    { id: 'exploration', label: 'Exploration', emoji: '🗺️', value: exploration },
  ]
  return { score: Math.round(cats.reduce((a, c) => a + c.value, 0) / cats.length), cats }
}
export const performance = (s) => s.mission.result?.score ?? computeScore(s).score

const newTeam = (code, name, emblem, members, hostId) => ({
  code, name, emblem, hostId, host: hostId === 'me', members, feed: [], confirms: {}, credit: {}, acts: {}, helps: 0, simulated: true,
  stats: {}, decisions: {}, crewReview: null, notice: { text: '', n: 0 }, rev: 0,
})

/* ---------------- reducer helpers ---------------- */
const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v))
const hash = (str) => [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7)
const fbk = (s, kind, text, extra = {}) => ({ ...s, feedback: { id: (s.feedback?.id || 0) + 1, kind, text, ...extra } })

function say(s, pool, extra = {}) {
  const arr = MSG[pool]
  let i = Math.abs(s.msgCount * 7 + hash(pool)) % arr.length
  const fill = (t) => t.replace('{part}', extra.part || 'engine')
  if (arr.length > 1 && fill(arr[i][1]) === s.say.text) i = (i + 1) % arr.length
  const [mood, text] = arr[i]
  return { ...s, msgCount: s.msgCount + 1, say: { text: fill(text), mood, n: s.say.n + 1, t: Date.now() } }
}
function sayText(s, text, mood = 'happy') {
  return { ...s, msgCount: s.msgCount + 1, say: { text, mood, n: s.say.n + 1, t: Date.now() } }
}
function enc(s, pool) {
  const arr = ENCOURAGE[pool] || ENCOURAGE.start
  let i = s.msgCount % arr.length
  if (arr[i] === s.encourage) i = (i + 1) % arr.length
  return { ...s, encourage: arr[i] }
}
function addTx(s, type, cat, amount, label, byName) {
  if (amount <= 0) return s
  if (type === 'spend' && s.balance < amount) return s // never negative
  const balance = type === 'earn' ? s.balance + amount : s.balance - amount
  const entry = { id: s.tx.length + 1, t: Date.now(), type, cat, amount, label, by: byName || s.profile?.name || 'You' }
  return { ...s, balance, tx: [entry, ...s.tx] }
}
function feed(s, text, who = 'me', credits = 0, kind = 'info') {
  if (!s.team) return s
  const member = s.team.members.find((m) => m.id === who) || s.team.members[0]
  const item = { id: (s.team.feed[0]?.id || 0) + 1, who: member.id, name: member.name, text, kind, t: Date.now() }
  const credit = { ...s.team.credit, [member.id]: (s.team.credit[member.id] || 0) + credits }
  const acts = { ...s.team.acts, [member.id]: (s.team.acts[member.id] || 0) + 1 }
  return { ...s, team: { ...s.team, feed: [item, ...s.team.feed].slice(0, 60), credit, acts, rev: (s.team.rev || 0) + 1 } }
}
// a short pop-up message for everyone on the team (shown as a toast)
function notify(s, text) {
  if (!s.team) return s
  return { ...s, team: { ...s.team, notice: { text, n: (s.team.notice?.n || 0) + 1 } } }
}
// per-member contribution tracking
function track(s, who, fn) {
  if (!s.team) return s
  const cur = statsOf(s.team, who)
  return { ...s, team: { ...s.team, stats: { ...(s.team.stats || {}), [who]: fn({ ...cur }) } } }
}
const memberName = (s, who) => (who === 'me' ? myName(s) : s.team?.members.find((m) => m.id === who)?.name || 'A teammate')
const myName = (s) => s.profile?.name || 'You'
const petSet = (s, patch) => ({ ...s, pet: { ...s.pet, ...patch } })
// visible reaction trigger for the companion (jump, spin, sparkles…)
const fx = (s, kind) => ({ ...s, pet: { ...s.pet, fx: { kind, n: (s.pet.fx?.n || 0) + 1 } } })

function completeLevelIfDone(s, n) {
  const lv = LEVELS[n - 1]
  if (s.levelsDone.includes(n)) return s
  if (!lv.steps.every((st) => s.installed.includes(st.target))) return s
  const paid = !!s.levelPaid?.[n] // the bonus is paid once per level, ever (rebuilding after a redesign does not pay again)
  let out = { ...s, levelsDone: [...s.levelsDone, n], level: Math.min(3, n + 1), levelPaid: { ...(s.levelPaid || {}), [n]: true }, levelUp: { level: n, reward: paid ? 0 : lv.reward, n: (s.levelUp?.n || 0) + 1 } }
  if (!paid) out = addTx(out, 'earn', 'reward', lv.reward, `Level ${n} complete bonus`)
  out = feed(out, `${myName(s)} completed Level ${n}! 🎉`, 'me', paid ? 0 : lv.reward, 'level')
  if (n < 3) out = notify(feed(out, `Your team has unlocked Level ${n + 1}!`, 'me', 0, 'level'), `Your team has unlocked Level ${n + 1}!`)
  else out = feed(out, 'All 15 components are installed – time for final assembly!', 'me', 0, 'level')
  return fx(say(out, 'levelDone'), 'level')
}

// Mission Control / crew messages shown in the cabin's communication panel
function addMsg(m, text, opts = {}) {
  const id = (m.msgSeq || 0) + 1
  return { ...m, msgSeq: id, messages: [{ id, from: opts.from || 'Mission Control', kind: opts.kind || 'mc', text, actions: opts.actions || [], read: false, replied: null }, ...(m.messages || [])].slice(0, 40) }
}

function buyPart(s, id, who) {
  const item = ITEMS[id]
  const steps = stepsOf(s)
  const idx = stepIndex(s)
  const step = steps[idx]
  const name = memberName(s, who)
  const me = who === 'me'
  if (s.mission.launched && !s.mission.finished) return fbk(s, 'wrong', 'Your spacecraft has already launched, so it cannot be changed during the mission.')
  if (!item || !step) return fbk(s, 'wrong', 'Nothing more to buy in this level!')
  if (s.installed.includes(item.id)) return fbk(s, 'wrong', 'That part is already installed.') // no duplicate purchases
  if (item.id !== step.target) {
    let why
    if (step.why && step.why[item.id]) why = step.why[item.id]
    else if (s.level === 1) why = `Not that one! Step ${idx + 1} of the book asks for a different part. No credits were taken.`
    else why = `${item.name}: ${item.purpose} That is not the job this step describes. No credits were taken – read the instruction again and try another part!`
    return enc(say(fbk({ ...s, stats: { ...(s.stats || {}), wrongBuys: ((s.stats || {}).wrongBuys || 0) + 1 } }, 'wrong', why), 'wrongBuy'), 'wrong')
  }
  if (s.balance < item.price) {
    const msg = `${me ? 'You need' : 'The team needs'} ${item.price - s.balance} more credits to purchase this component. Visit the Science Academy to earn more!`
    return enc(say(fbk(s, 'poor', msg), 'poor'), 'earn')
  }
  s = addTx(s, 'spend', 'component', item.price, `${item.name} purchased`, name)
  s = { ...s, installed: [...s.installed, item.id] }
  s = feed(s, `${name} purchased & installed the ${item.name}`, who, 0, 'buy')
  s = track(s, who, (st) => ({ ...st, bought: [...st.bought, item.id], installed: [...st.installed, item.id] }))
  if (!me) s = notify(s, `${name} installed the ${item.name}!`)
  if (s.team && s.installed.length === 12) s = feed(s, 'Your spacecraft is almost ready!', 'me', 0, 'almost')
  s = petSet(s, { happiness: clamp(s.pet.happiness + 4) })
  let hurt = false
  // every 4th part something may need checking – gentle, never blocks progress
  if (s.installed.length % 4 === 0 && !s.pet.damaged) {
    hurt = true
    s = petSet(s, { damaged: s.installed[s.installed.length - 2], health: clamp(s.pet.health - 20) })
  }
  s = fbk(s, 'ok', `${item.name} installed${me ? '' : ' by ' + name}! −${item.price} credits.`, { part: item.id })
  s = fx(enc(say(s, 'bought'), 'bought'), 'buy')
  s = completeLevelIfDone(s, s.level)
  if (hurt) s = fx(say(s, 'damaged', { part: ITEMS[s.pet.damaged].name }), 'damage')
  return s
}

/* ---------------- reducer ---------------- */
export function reducer(state, a) {
  let s = state
  switch (a.type) {
    case 'NAV': return { ...s, screen: a.screen, feedback: null }
    case 'RESET': return { ...initialState(), screen: 'welcome' }
    case 'CREATE_PROFILE':
      return { ...s, profile: { id: 'me', name: a.name, avatar: a.avatar, color: a.color }, mode: a.mode, screen: 'adopt', team: a.mode === 'solo' ? null : s.team }
    case 'ADOPT':
      s = { ...s, shipName: a.shipName, shipColor: a.shipColor, adopted: true, screen: s.mode === 'team' ? 'team' : 'dashboard' }
      return say(s, 'named')
    case 'SET_SHIP_COLOR': return { ...s, shipColor: a.color }
    case 'SAY': return say(s, a.pool)
    case 'TAP':
      return fx(say(petSet(s, { happiness: clamp(s.pet.happiness + 1) }), 'tap'), 'tap')
    case 'DISMISS_LEVELUP': return { ...s, levelUp: null }
    case 'CLEAR_FEEDBACK': return { ...s, feedback: null }

    /* ---------- Academy ---------- */
    case 'HINT': {
      // practising an activity that is already completed earns nothing, so a hint there must not cost credits
      // (otherwise repeated hints could drain every credit and leave the player unable to buy parts)
      if (s.academy.done[a.id]) return say(s, 'hint')
      if (s.balance < HINT_COST) return fbk(s, 'poor', `You need ${HINT_COST} credits for a hint. Answer other questions to earn more credits first!`)
      s = addTx(s, 'spend', 'hint', HINT_COST, 'Hint used')
      s = { ...s, hintsUsed: s.hintsUsed + 1, academy: { ...s.academy, hints: { ...s.academy.hints, [a.id]: (s.academy.hints[a.id] || 0) + 1 } } }
      s = feed(s, `${myName(s)} used a hint (−${HINT_COST})`, 'me')
      return say(s, 'hint')
    }
    case 'ANSWER': {
      const act = ACT_BY_ID[a.id]
      if (!a.correct) return enc(say(s, 'wrong'), 'wrong')
      if (s.academy.done[a.id]) return s
      const reward = TIERS[act.tier].reward
      s = addTx(s, 'earn', 'science', reward, `Correct science answer (${act.cat})`)
      s = { ...s, academy: { ...s.academy, done: { ...s.academy.done, [a.id]: true } } }
      s = feed(s, `${myName(s)} completed a ${act.cat} challenge (+${reward})`, 'me', reward, 'science')
      s = track(s, 'me', (st) => ({ ...st, sci: st.sci + 1, earned: st.earned + reward }))
      s = petSet(s, { happiness: clamp(s.pet.happiness + 3) })
      return enc(say(s, 'earn'), 'earn')
    }

    /* ---------- Workshop ---------- */
    case 'BUY': return buyPart(s, a.id, 'me')
    case 'TEAM_BUY': {
      if (!s.team) return s
      const m = s.team.members.find((x) => x.id === a.who && x.id !== 'me')
      if (!m) return s
      const step = stepsOf(s)[stepIndex(s)]
      if (!step) return fbk(s, 'wrong', 'There is nothing left to buy in this level.')
      const mine = statsOf(s.team, m.id).bought.filter((id) => ITEMS[id].level === s.level).length
      if (mine >= SIM_BUY_LIMIT_PER_LEVEL) return fbk(s, 'wrong', `${m.name} has already bought a part for this level. Your turn to build!`)
      return buyPart(s, step.target, m.id)
    }
    case 'ASSEMBLE': {
      if (s.installed.length < COMPONENTS.length || s.assembled || (s.mission.launched && !s.mission.finished)) return s
      s = feed({ ...s, assembled: true }, `${myName(s)} completed final assembly!`, 'me')
      return enc(say(s, 'assembled'), 'launch')
    }

    /* ---------- Crew & training ---------- */
    case 'TOGGLE_CREW': {
      if (s.crewLocked || !s.assembled || (s.mission.launched && !s.mission.finished)) return s
      const has = s.crew.includes(a.id)
      if (!has && s.crew.length >= CREW_SLOTS) return s
      s = { ...s, crew: has ? s.crew.filter((x) => x !== a.id) : [...s.crew, a.id] }
      return s.team ? { ...s, team: { ...s.team, crewReview: null } } : s // a changed crew must be reviewed again
    }
    case 'CONFIRM_CREW': {
      if (s.crew.length !== CREW_SLOTS || s.crewLocked) return s
      if (s.team && s.team.crewReview !== crewKey(s.crew)) return fbk(s, 'wrong', 'Your team needs to review this crew before it can be confirmed.')
      s = feed({ ...s, crewLocked: true }, `${myName(s)} confirmed the astronaut crew`, 'me', 0, 'crew')
      return enc(say(s, 'crew'), 'crew')
    }
    case 'UNLOCK_CREW': {
      if (!s.crewLocked || s.mission.launched) return s
      return feed({ ...s, crewLocked: false }, `${myName(s)} reopened crew selection`, 'me')
    }
    case 'TRAIN_DONE': {
      const idx = TRAINING.findIndex((x) => x.id === a.id)
      if (idx < 0 || !s.crewLocked || s.training[a.id]) return s
      if (TRAINING.slice(0, idx).some((x) => !s.training[x.id])) return s // modules unlock one after another
      const mistakes = a.mistakes || 0
      const xp = XP_PER_MODULE + (mistakes === 0 ? 25 : 0) // small bonus for a flawless run
      s = { ...s, training: { ...s.training, [a.id]: true }, trainingRecord: { ...s.trainingRecord, [a.id]: { xp, mistakes } }, xp: s.xp + xp }
      s = feed(s, `${myName(s)} completed ${a.id} training (+${xp} XP)`, 'me', 0, 'train')
      if (s.team) s.team.members.forEach((m) => { s = track(s, m.id, (st) => ({ ...st, training: st.training.includes(a.id) ? st.training : [...st.training, a.id] })) })
      return certified(s) ? fx(enc(say(s, 'training'), 'launch'), 'level') : s
    }

    /* ---------- Pet ---------- */
    case 'REFUEL': {
      if (s.pet.fuel >= 100) return s
      if (s.balance < FUEL_PRICE) return fbk(s, 'poor', `You need ${FUEL_PRICE - s.balance} more credits for fuel. Visit the Science Academy to earn more!`)
      s = addTx(s, 'spend', 'fuel', FUEL_PRICE, `Refuelled +${FUEL_AMOUNT} fuel`)
      s = petSet(s, { fuel: clamp(s.pet.fuel + FUEL_AMOUNT), happiness: clamp(s.pet.happiness + 2) })
      s = feed(s, `${myName(s)} refuelled the spacecraft`, 'me')
      return fx(say(s, 'refueled'), 'refuel')
    }
    case 'RECHARGE':
      s = feed(petSet(s, { energy: clamp(s.pet.energy + 25), happiness: clamp(s.pet.happiness + 2) }), `${myName(s)} recharged the spacecraft`, 'me')
      return fx(say(s, 'recharged'), 'recharge')
    case 'REPAIR': {
      if (!s.pet.damaged) return s
      if (s.balance < REPAIR_PRICE) return fbk(s, 'poor', `A repair costs ${REPAIR_PRICE} credits. You need ${REPAIR_PRICE - s.balance} more.`)
      s = addTx(s, 'spend', 'repair', REPAIR_PRICE, `Repaired ${ITEMS[s.pet.damaged].name}`)
      s = petSet(s, { damaged: null, health: clamp(s.pet.health + 25) })
      s = feed(s, `${myName(s)} repaired the spacecraft`, 'me')
      return fx(say(s, 'repaired'), 'repair')
    }
    case 'MAINTAIN': {
      if (s.balance < MAINTAIN_PRICE) return fbk(s, 'poor', `Cleaning supplies cost ${MAINTAIN_PRICE} credits. Earn a few more first!`)
      s = addTx(s, 'spend', 'maintenance', MAINTAIN_PRICE, 'Maintenance supplies')
      s = petSet(s, { maintenance: clamp(s.pet.maintenance + 30), health: clamp(s.pet.health + 5), happiness: clamp(s.pet.happiness + 3) })
      s = feed(s, `${myName(s)} did a maintenance check`, 'me')
      return fx(say(s, 'maintained'), 'maintain')
    }
    case 'PLAY':
      s = feed(petSet(s, { happiness: clamp(s.pet.happiness + 20), energy: clamp(s.pet.energy - 5), plays: s.pet.plays + 1 }), `${myName(s)} played with the spacecraft`, 'me')
      return fx(say(s, 'played'), 'play')
    case 'PET_ALERT': {
      if (s.mission.finished || !s.adopted) return s
      const p = s.pet, now = Date.now()
      if (!a.force && now - (s.say.t || 0) < 25000) return s // never chatter
      let key = null
      if (p.damaged) key = 'damaged'
      else if (p.energy < 30) key = 'lowEnergy'
      else if (p.fuel < 25 && s.installed.length > 2) key = 'lowFuel'
      else if (p.maintenance < 40) key = 'maintainLow'
      else if (p.happiness < 40) key = 'lonely'
      else if (p.happiness >= 90) key = 'loved'
      if (!key) return s
      if (!a.force && p.lastAlert && p.lastAlert.key === key && now - p.lastAlert.t < 150000) return s // no repeats
      s = petSet(s, { lastAlert: { key, t: now } })
      return say(s, key, { part: p.damaged ? ITEMS[p.damaged].name : '' })
    }
    // very gentle drift while playing: 1 point per call, never below a comfortable floor
    case 'TICK': {
      if (!s.adopted || s.mission.launched) return s
      const p = s.pet
      return petSet(s, { energy: Math.max(Math.min(p.energy, 40), p.energy - 1), maintenance: Math.max(Math.min(p.maintenance, 40), p.maintenance - 1), happiness: Math.max(Math.min(p.happiness, 40), p.happiness - 1) })
    }

    /* ---------- Team (simulated, local) ---------- */
    case 'CREATE_TEAM': {
      s = { ...s, mode: 'team', team: newTeam(a.code, a.name || 'Mars Crew', a.emblem || '🚀', [{ id: 'me', ...s.profile }], 'me') }
      return notify(feed(s, `${myName(s)} created the team “${s.team.name}”`, 'me', 0, 'join'), `Team “${a.name || 'Mars Crew'}” created!`)
    }
    case 'JOIN_TEAM': {
      const host = SIM_ROSTER[0]
      s = { ...s, mode: 'team', team: newTeam(a.code, 'Crew ' + a.code, '🛰️', [host, { id: 'me', ...s.profile }], host.id) }
      return notify(feed(s, `${host.name} (team captain) welcomed ${myName(s)} to the team`, host.id, 0, 'join'), `You joined team ${a.code}!`)
    }
    case 'ADD_SIM_MEMBER': {
      if (!s.team || s.team.members.length >= MAX_MEMBERS) return s
      const next = SIM_ROSTER.find((m) => !s.team.members.some((x) => x.id === m.id))
      if (!next) return s
      s = { ...s, team: { ...s.team, members: [...s.team.members, next] } }
      s = notify(feed(s, `${next.name} joined using the code ${s.team.code}`, next.id, 0, 'join'), `${next.name} joined your team!`)
      return say(s, 'team')
    }
    // a scripted teammate completes ONE real Academy activity (same rewards, no repeats, limited per teammate)
    case 'TEAM_HELP': {
      if (!s.team) return s
      const m = s.team.members.find((x) => x.id === a.who && x.id !== 'me') || s.team.members.find((x) => x.id !== 'me' && statsOf(s.team, x.id).sci < SIM_SCIENCE_LIMIT)
      if (!m) return fbk(s, 'wrong', 'No teammates are available to help right now.')
      if (statsOf(s.team, m.id).sci >= SIM_SCIENCE_LIMIT) return fbk(s, 'wrong', `${m.name} has already done their share of science challenges. Time to learn something yourself!`)
      const L = Math.min(s.level, 3)
      const pool = ACTIVITIES.filter((x) => TIERS[x.tier].unlockLevel <= L && !s.academy.done[x.id]).sort((p, q) => TIERS[p.tier].reward - TIERS[q.tier].reward)
      if (!pool.length) return fbk(s, 'wrong', 'Every available science challenge is already completed!')
      const act = pool[0]
      const reward = TIERS[act.tier].reward
      s = addTx(s, 'earn', 'science', reward, `${m.name} completed a ${act.cat} challenge`, m.name)
      s = { ...s, academy: { ...s.academy, done: { ...s.academy.done, [act.id]: true } } }
      s = feed(s, `${m.name} completed a science challenge (+${reward})`, m.id, reward, 'science')
      s = track(s, m.id, (st) => ({ ...st, sci: st.sci + 1, earned: st.earned + reward }))
      return enc(say(notify(s, `${m.name} earned ${reward} credits for the team!`), 'team'), 'team')
    }
    case 'TEAM_TIP': {
      if (!s.team) return s
      const m = s.team.members.find((x) => x.id === a.who && x.id !== 'me')
      if (!m) return s
      s = track(s, m.id, (st) => ({ ...st, tips: st.tips + 1 }))
      return feed(s, `${m.name} shared a tip on a team challenge`, m.id, 0, 'tip')
    }
    case 'TEAM_VOTE': {
      const n = s.level
      const d = DECISIONS[n]
      if (!s.team || !d || s.levelsDone.includes(n) || stepIndex(s, n) > Math.min(d.i, d.j)) return s
      if (s.team.decisions?.[n]?.result) return s
      const votes = { me: a.choice }
      s.team.members.forEach((m) => { if (m.id !== 'me') votes[m.id] = SIM_ROSTER.find((r) => r.id === m.id)?.votes[n] || 'A' })
      const tally = { A: 0, B: 0 }
      Object.values(votes).forEach((v) => { tally[v] += 1 })
      // ties are broken by the team captain (the creator of the team)
      const result = tally.A === tally.B ? votes[s.team.hostId || 'me'] : tally.A > tally.B ? 'A' : 'B'
      const decisions = { ...(s.team.decisions || {}), [n]: { votes, result, n } }
      s = { ...s, team: { ...s.team, decisions } }
      s = track(s, 'me', (st) => ({ ...st, votes: st.votes + 1 }))
      s.team.members.forEach((m) => { if (m.id !== 'me') s = track(s, m.id, (st) => ({ ...st, votes: st.votes + 1 })) })
      const chosen = ITEMS[d[result].target].name
      return notify(feed(s, `Team decision made: buy the ${chosen} first (${tally[result]} of ${s.team.members.length} votes${tally.A === tally.B ? ', captain broke the tie' : ''})`, 'me', 0, 'vote'), `Team decision: ${chosen} first!`)
    }
    case 'TEAM_REVIEW_CREW': {
      if (!s.team || s.crew.length !== CREW_SLOTS) return s
      s = { ...s, team: { ...s.team, crewReview: crewKey(s.crew) } }
      return notify(feed(s, 'The team reviewed the crew and agrees with the selection', 'me', 0, 'crew'), 'Your team approved the crew!')
    }
    case 'TEAM_CONFIRM': {
      if (!s.team) return s
      const m = s.team.members.find((x) => x.id === a.id)
      if (!m) return s
      const now = a.value === undefined ? !s.team.confirms[a.id] : a.value
      s = { ...s, team: { ...s.team, confirms: { ...s.team.confirms, [a.id]: now } } }
      return feed(s, `${m.name} ${now ? 'confirmed the launch' : 'withdrew launch confirmation'}`, a.id, 0, 'launch')
    }

    /* ---------- Launch & mission ---------- */
    case 'LAUNCH': {
      if (!isReadyToLaunch(s)) return s
      return say({ ...s, screen: 'launch' }, 'launch')
    }
    case 'LAUNCHED': {
      const m = addMsg({ ...s.mission, launched: true, log: [{ t: 'Launch', text: 'Space Buddy launched successfully from Earth.' }] }, 'Your Mars mission has officially begun! All systems are operating normally.')
      s = { ...s, screen: 'interior', mission: m }
      return say(feed(s, 'The team launched Space Buddy!', 'me', 0, 'launch'), 'space')
    }
    case 'TRAVEL': {
      const m = s.mission
      if (m.pending || m.progress >= 100) return s
      const perLeg = Math.max(3, Math.round(requiredFuel(s) / 10))
      if (m.progress >= 50 && experimentsDone(s) < EXPERIMENTS.length) return fbk(s, 'poor', 'Mission Control: Finish the three science experiments (microgravity, solar energy, planetary observation) in the Science Lab before we continue!')
      let use = perLeg
      let coast = false
      if (s.pet.fuel < perLeg) {
        if (!m.emergencyUsed) return fbk(s, 'poor', 'Not enough fuel for the next leg! Use Mission Control’s emergency supply, or refuel with credits.')
        if (s.balance >= FUEL_PRICE) return fbk(s, 'poor', `Not enough fuel for the next leg! Refuel (💰 ${FUEL_PRICE}) in the cabin.`)
        use = s.pet.fuel; coast = true // never stuck: the crew coasts on momentum with the last of the propellant
      }
      const progress = Math.min(100, m.progress + 10)
      s = petSet(s, { fuel: clamp(s.pet.fuel - use), energy: Math.max(10, clamp(s.pet.energy - 3)) })
      const ch = CHALLENGES.find((c) => !m.challenges[c.id] && progress >= c.at)
      let mm = { ...m, progress, oxygen: Math.max(20, clamp(m.oxygen - 2)), water: Math.max(15, clamp((m.water ?? 100) - (s.installed.includes('recycler') ? 1 : 2))), pending: ch ? ch.id : null }
      if (coast) mm.coasted = true
      mm.comm = ch?.id === 'comm' ? 'LOST' : mm.comm
      mm.navStatus = ch?.id === 'nav' ? 'OFF COURSE' : mm.navStatus
      mm.log = [{ t: `${progress}%`, text: ch ? `Alert: ${ch.title}` : coast ? 'Coasting on momentum with the last of the propellant.' : 'Smooth travel towards Mars.' }, ...m.log]
      if (ch?.onStart) {
        const o = ch.onStart
        if (o.oxygen) mm.oxygen = Math.max(20, clamp(mm.oxygen + o.oxygen))
        if (o.fuel) s = petSet(s, { fuel: clamp(s.pet.fuel + o.fuel) })
      }
      if (ch) mm = addMsg(mm, MC_ALERT(ch.title), { kind: 'alert' })
      MC_SCRIPT.filter((x) => x.at <= progress && !(mm.sent || []).includes(x.at)).forEach((x) => { mm = addMsg({ ...mm, sent: [...(mm.sent || []), x.at] }, x.text, { actions: x.actions }) })
      if (progress === 50 || progress === 80) s.crew.slice(0, 2).forEach((id, k) => { const c = CREW_BY_ID[id]; const line = c && CREW_TALK[c.skill]?.[(progress / 10 + k) % 2]; if (line) mm = addMsg(mm, line.a, { from: c.name.split(' ')[0], kind: 'crew' }) })
      if (progress >= 100) mm = addMsg(mm, 'Mars is now within visual range. Prepare for final mission procedures.', { kind: 'mc' })
      s = { ...s, feedback: null, mission: mm }
      if (!ch && progress === 10) s = sayText(s, "We're really in space! I can't believe it!", 'excited')
      else if (!ch && progress === 70) s = sayText(s, 'Mars is getting closer!', 'excited')
      else if (s.pet.energy < 30) s = say(s, 'lowEnergy')
      else if (mm.oxygen < 50 || mm.water < 40) s = sayText(s, "Let's check our oxygen and water supply.", 'worried')
      return s
    }
    case 'EMERGENCY_FUEL': {
      if (s.mission.emergencyUsed) return s
      s = petSet(s, { fuel: clamp(s.pet.fuel + 25) })
      return sayText({ ...s, mission: { ...s.mission, emergencyUsed: true } }, 'Mission Control sent an emergency fuel supply. Phew!', 'happy')
    }
    case 'CHALLENGE': {
      const ch = ALL_CHALLENGES.find((c) => c.id === a.id)
      const opt = ch.options[a.option]
      if (s.mission.challenges[ch.id]) return s
      let score = Math.max(20, QUALITY_SCORE[opt.q] - 10 * (a.mistakes || 0))
      const bonus = crewHas(s, ch.skill)
      if (bonus) score = Math.min(100, Math.round(score * 1.2))
      const fx = opt.fx || {}
      let fuelGain = fx.fuel || 0
      if (fx.credits && fx.credits < 0) {
        if (s.balance >= -fx.credits) s = addTx(s, 'spend', 'fuel', -fx.credits, 'Extra fuel during the mission')
        else fuelGain = 0 // not enough credits: no fuel delivered
      }
      let m = { ...s.mission }
      m.oxygen = Math.max(20, clamp(m.oxygen + (fx.oxygen || 0)))
      m.water = Math.max(15, clamp((m.water ?? 100) + (fx.water || 0)))
      s = petSet(s, { energy: Math.max(5, clamp(s.pet.energy + (fx.energy || 0))), fuel: clamp(s.pet.fuel + fuelGain), health: Math.max(20, clamp(s.pet.health + (fx.health || 0))) })
      if (a.votes && s.team) s.team.members.forEach((mem) => { s = track(s, mem.id, (st) => ({ ...st, votes: st.votes + 1 })) })
      m.challenges = { ...m.challenges, [ch.id]: { score, quality: opt.q, choice: opt.t, bonus, voted: !!a.votes } }
      m.decisions = [...m.decisions, { title: ch.title, choice: opt.t, quality: opt.q, votes: a.votes || null }]
      m.pending = null
      if (ch.id === 'comm') m.comm = 'Online'
      if (ch.id === 'nav') m.navStatus = opt.q === 'poor' ? 'Drifting' : 'On course'
      m.log = [{ t: `${m.progress}%`, text: `${ch.title}: ${opt.q === 'best' ? 'solved' : opt.q === 'ok' ? 'partly solved' : 'a learning moment'}` }, ...m.log]
      m = addMsg(m, opt.q === 'best' ? 'Excellent handling of that situation, crew!' : 'Situation under control. Remember: every challenge is a chance to learn.', { kind: 'mc' })
      s = { ...s, mission: m }
      return opt.q === 'best' ? sayText(s, 'That was a great decision, astronaut!', 'proud') : sayText(s, 'Mistakes help us learn. We can do this together!', 'curious')
    }
    case 'ACTIVITY': {
      if (s.mission.activities[a.id]) return s
      const xp = EXPERIMENTS.includes(a.id) ? a.xp ?? 50 : a.xp ?? 20
      const m = { ...s.mission, activities: { ...s.mission.activities, [a.id]: { score: a.score } }, sciXp: (s.mission.sciXp || 0) + xp, log: [{ t: `${s.mission.progress}%`, text: `${a.log} (+${xp} science XP)` }, ...s.mission.log] }
      if (a.id === 'research') m.research = a.data || []
      s = petSet({ ...s, mission: m }, { happiness: clamp(s.pet.happiness + 4), energy: a.id === 'solar' ? clamp(s.pet.energy + 10) : s.pet.energy })
      return sayText(s, 'What a great experiment! We are learning together.', 'excited')
    }
    case 'SOLAR_CHARGE': {
      const m = s.mission
      if ((m.solarCharges || 0) >= 3) return fbk(s, 'wrong', 'The batteries are as charged as the panels can make them for now.')
      s = petSet({ ...s, mission: { ...m, solarCharges: (m.solarCharges || 0) + 1, log: [{ t: `${m.progress}%`, text: 'Solar array re-aimed: batteries charged.' }, ...m.log] } }, { energy: clamp(s.pet.energy + 15) })
      return sayText(s, 'Zzzap! Fresh electrical energy from the Sun!', 'happy')
    }
    case 'LIFE_TOPIC': {
      const m = s.mission
      if (m.lifeDone?.[a.id]) return s
      return { ...s, mission: { ...m, lifeDone: { ...(m.lifeDone || {}), [a.id]: true }, sciXp: (m.sciXp || 0) + 10 } }
    }
    case 'TALK': return { ...s, mission: { ...s.mission, talks: { ...(s.mission.talks || {}), [a.id]: ((s.mission.talks || {})[a.id] || 0) + 1 } } }
    case 'MSG_READ': return { ...s, mission: { ...s.mission, messages: s.mission.messages.map((x) => (x.id === a.id ? { ...x, read: true } : x)) } }
    case 'MSG_REPLY': {
      const reply = a.reply === '@energy' ? `Energy at ${Math.round(s.pet.energy)}%. ${s.pet.energy < 40 ? 'Low – use the solar array experiment to recharge.' : 'Looks healthy.'}` : a.reply
      return { ...s, mission: { ...s.mission, messages: s.mission.messages.map((x) => (x.id === a.id ? { ...x, read: true, replied: reply } : x)) } }
    }
    case 'ARRIVE': {
      if (s.mission.approach || s.mission.arrived || s.mission.progress < 100) return s
      return sayText({ ...s, screen: 'mars', mission: { ...s.mission, approach: true } }, 'Mars is getting closer!', 'excited')
    }
    case 'MARS_STEP': {
      const step = Math.max(s.mission.marsStep, a.step)
      if (step >= 2 && !s.mission.arrived) {
        const m = addMsg({ ...s.mission, marsStep: step, arrived: true }, 'WE MADE IT! WELCOME TO MARS! Your crew has completed the journey.', { kind: 'mc' })
        return say(claimBadges(feed({ ...s, mission: m }, 'The team arrived at Mars!', 'me', 0, 'launch')), 'mars')
      }
      return { ...s, mission: { ...s.mission, marsStep: step } }
    }
    case 'MARS_ACT': {
      const m = s.mission
      if (m.marsActs?.[a.id]) return s
      return { ...s, mission: { ...m, marsActs: { ...(m.marsActs || {}), [a.id]: true }, marsData: m.marsData.includes(a.id) ? m.marsData : [...m.marsData, a.id], sciXp: (m.sciXp || 0) + 40 } }
    }
    case 'MARS_DATA': {
      if (s.mission.marsData.includes(a.id)) return s
      return { ...s, mission: { ...s.mission, marsData: [...s.mission.marsData, a.id] } }
    }
    /* ---------- Mars exploration (rover) ---------- */
    case 'BUDDY': return sayText(s, a.text, a.mood || 'happy')
    case 'EXPLORE_MOVE': {
      const e = s.mission.explore
      if (a.to === e.pos || !SITE_BY_ID[a.to]) return s
      const cost = roverCost(e.pos, a.to)
      if (e.battery < cost) return fbk(s, 'poor', `The rover needs ${cost}% battery for that drive but has ${e.battery}%. Return to the spacecraft to recharge!`)
      const ne = { ...e, pos: a.to, battery: e.battery - cost, distance: e.distance + roverKm(e.pos, a.to), visited: { ...e.visited, [a.to]: true } }
      return sayText({ ...s, feedback: null, mission: { ...s.mission, explore: ne } }, a.to === 'base' ? 'Back at the spacecraft!' : `We are at ${SITE_BY_ID[a.to].name}! What will we find?`, 'excited')
    }
    case 'EXPLORE_SCAN': {
      const e = s.mission.explore
      if (e.scanned[e.pos]) return fbk(s, 'wrong', 'You already scanned this location.')
      if (e.battery < ROVER.scan) return fbk(s, 'poor', `Scanning needs ${ROVER.scan}% battery. Return to the spacecraft to recharge.`)
      return { ...s, feedback: null, mission: { ...s.mission, explore: { ...e, battery: e.battery - ROVER.scan, scanned: { ...e.scanned, [e.pos]: true } } } }
    }
    case 'EXPLORE_PHOTO': {
      const e = s.mission.explore
      if (e.photos.includes(e.pos)) return fbk(s, 'wrong', 'You already photographed this location – move on to a new one for a new picture!')
      if (e.battery < ROVER.photo) return fbk(s, 'poor', `A photograph needs ${ROVER.photo}% battery. Return to the spacecraft to recharge.`)
      return sayText({ ...s, feedback: null, mission: { ...s.mission, explore: { ...e, battery: e.battery - ROVER.photo, photos: [...e.photos, e.pos] } } }, 'Click! A great photo for the science team.', 'happy')
    }
    case 'EXPLORE_COLLECT': {
      const e = s.mission.explore
      const site = SITE_BY_ID[e.pos]
      if (!site?.sample) return fbk(s, 'wrong', 'There is nothing to collect at this location.')
      if (e.samples.includes(site.sample)) return fbk(s, 'wrong', 'You already collected the sample from this location.')
      if (e.battery < ROVER.collect) return fbk(s, 'poor', `Collecting needs ${ROVER.collect}% battery. Return to the spacecraft to recharge.`)
      return sayText({ ...s, feedback: null, mission: { ...s.mission, explore: { ...e, battery: e.battery - ROVER.collect, samples: [...e.samples, site.sample] } } }, 'We collected a sample! (A simulated one, for learning.)', 'excited')
    }
    case 'EXPLORE_ANSWER': {
      const e = s.mission.explore
      if (e.q[a.qid]) return s // each question is recorded once
      return { ...s, mission: { ...s.mission, explore: { ...e, q: { ...e.q, [a.qid]: a.attempts }, analysed: a.sample ? { ...e.analysed, [a.sample]: true } : e.analysed } } }
    }
    case 'EXPLORE_HINT': return sayText({ ...s, mission: { ...s.mission, explore: { ...s.mission.explore, hints: s.mission.explore.hints + 1 } } }, a.text, 'curious')
    case 'EXPLORE_ACT': {
      const m = s.mission, e = m.explore
      if (e.acts[a.id]) return s
      s = { ...s, mission: { ...m, explore: { ...e, acts: { ...e.acts, [a.id]: true } }, marsActs: { ...(m.marsActs || {}), [a.id]: true }, marsData: m.marsData.includes(a.id) ? m.marsData : [...m.marsData, a.id], sciXp: (m.sciXp || 0) + 60 } }
      s = claimBadges(feed(s, `${myName(s)} completed a Mars exploration activity!`, 'me', 0, 'science'))
      return sayText(s, 'We made a scientific discovery! Great work, astronaut!', 'proud')
    }
    case 'EXPLORE_RETURN': {
      const e = s.mission.explore
      if (e.pos === 'base') return s
      const cost = roverCost(e.pos, 'base')
      const towed = e.battery < cost
      const ne = { ...e, pos: 'base', battery: ROVER.fullBattery, distance: e.distance + roverKm(e.pos, 'base'), recharges: e.recharges + 1, towed: e.towed || towed, visited: { ...e.visited, base: true } }
      return sayText({ ...s, feedback: null, mission: { ...s.mission, explore: ne } }, towed ? 'The battery ran low, so the crew towed the rover home. Next time, return a little earlier!' : 'Rover home! The solar panels recharged its battery.', towed ? 'curious' : 'happy')
    }
    case 'FINISH': {
      const m = s.mission, e = m.explore
      if (m.finished) return { ...s, screen: 'report' }
      if (!['terrain', 'samples', 'water'].every((id) => e.acts[id])) return fbk(s, 'wrong', 'Finish the three exploration activities first.')
      if (e.pos !== 'base') return fbk(s, 'wrong', 'Return the rover to the spacecraft first.')
      let n = { ...s, mission: { ...m, finished: true } }
      const before = Object.keys(n.claimed || {})
      n = claimBadges(n)
      const result = { ...computeScore(n), badgesNow: Object.keys(n.claimed).filter((id) => !before.includes(id)), attempt: n.attempt || 1, at: Date.now() }
      n = { ...n, screen: 'report', mission: { ...n.mission, result }, history: [...(n.history || []), { attempt: result.attempt, score: result.score, cats: result.cats, ship: n.shipName, crew: n.crew, at: result.at }] }
      return sayText(n, "Mission complete! I'm so proud of us!", 'proud')
    }
    // fly the same Earth-to-Mars mission again (same ship, or rebuilt with a refund)
    case 'REPLAY': {
      if (!s.mission.finished) return s
      const base = initialState()
      const achieved = { ...(s.achieved || {}), ...Object.fromEntries(ACHIEVEMENTS.filter((x) => x.test(s)).map((x) => [x.id, true])) }
      let n = { ...s, achieved, attempt: (s.attempt || 1) + 1, mission: base.mission, crewLocked: false, levelUp: null, feedback: null, stats: a.mode === 'redesign' ? { wrongBuys: 0 } : (s.stats || { wrongBuys: 0 }), pet: { ...s.pet, fuel: 20, energy: 70, health: 100, maintenance: 60, damaged: null, fx: { kind: '', n: 0 } } }
      if (n.team) n.team = { ...n.team, confirms: {}, crewReview: null }
      if (a.mode === 'redesign') {
        const refundable = s.tx.filter((x) => x.cat === 'component' && !x.refunded)
        const refund = refundable.reduce((acc, x) => acc + x.amount, 0)
        n = { ...n, tx: n.tx.map((x) => (x.cat === 'component' ? { ...x, refunded: true } : x)), installed: [], assembled: false, level: 1, levelsDone: [] }
        if (n.team) n.team = { ...n.team, decisions: {} }
        if (a.name) n.shipName = a.name.slice(0, 16)
        if (a.color) n.shipColor = a.color
        n = addTx(n, 'earn', 'refund', refund, 'Refund for rebuilding the spacecraft')
        n.screen = 'workshop'
      } else n.screen = 'mission'
      return sayText(n, a.mode === 'redesign' ? "A new design! Let's build something even better!" : 'Round two! Let us try a new strategy.', 'excited')
    }
    default: return s
  }
}

/* ---------------- persistence ---------------- */
const KNOWN_SCREENS = ['welcome', 'profile', 'adopt', 'team', 'dashboard', 'workshop', 'book', 'academy', 'bank', 'crew', 'training', 'mission', 'pet', 'launch', 'interior', 'mars', 'report', 'teamlaunch']
export function sanitizeScreen(s) {
  const m = s.mission || {}
  if (!s.profile) return 'welcome'
  if (!KNOWN_SCREENS.includes(s.screen)) return 'dashboard'
  if (!s.adopted) return ['profile', 'adopt', 'welcome'].includes(s.screen) ? s.screen : 'adopt'
  if (['team', 'teamlaunch'].includes(s.screen) && !s.team) return 'dashboard'
  if (['interior', 'mars'].includes(s.screen) && !m.launched) return 'dashboard'
  if (s.screen === 'mars' && !(m.approach || m.arrived)) return 'interior'
  if (s.screen === 'report' && !m.finished) return resumeScreen(s)
  if (s.screen === 'launch' && m.launched) return resumeScreen(s)
  return s.screen
}
export function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return initialState()
    const saved = JSON.parse(raw)
    const base = initialState()
    const s = { ...base, ...saved, pet: { ...base.pet, ...saved.pet }, mission: { ...base.mission, ...saved.mission }, academy: { ...base.academy, ...saved.academy } }
    // gentle time-based drift; never below 25 so a forgotten spacecraft is never "broken"
    const mins = Math.max(0, (Date.now() - (s.pet.lastTick || Date.now())) / 60000)
    const drop = Math.min(20, Math.floor(mins / 10)) // 1 point per 10 minutes away, at most 20
    if (drop > 0 && s.adopted && !s.mission.launched) {
      s.pet.energy = Math.min(s.pet.energy, Math.max(40, s.pet.energy - drop))
      s.pet.maintenance = Math.min(s.pet.maintenance, Math.max(40, s.pet.maintenance - drop))
      s.pet.happiness = Math.min(s.pet.happiness, Math.max(35, s.pet.happiness - drop))
    }
    s.pet.fx = { kind: '', n: 0 }
    if (!saved.levelPaid) s.levelPaid = Object.fromEntries((s.levelsDone || []).map((n) => [n, true])) // older saves: bonuses already paid
    if (s.team) s.team = { stats: {}, decisions: {}, crewReview: null, notice: { text: '', n: 0 }, rev: 0, emblem: '🚀', hostId: s.team.host ? 'me' : 'sim1', ...s.team, notice: { text: '', n: 0 } }
    // older saves used different training ids – keep that progress
    const tr = s.training || {}
    if (tr.controls || tr.comm || tr.life) {
      s.training = { ops: !!(tr.ops || (tr.controls && tr.comm)), micro: !!(tr.micro || tr.life), emergency: !!tr.emergency, science: !!tr.science }
    }
    s.xp = s.xp || Object.values(s.training).filter(Boolean).length * XP_PER_MODULE
    s.pet.lastTick = Date.now()
    s.feedback = null
    s.levelUp = null
    // repair damaged data instead of crashing
    s.installed = (Array.isArray(s.installed) ? s.installed : []).filter((id, i, arr) => ITEMS[id] && arr.indexOf(id) === i)
    s.crew = (Array.isArray(s.crew) ? s.crew : []).filter((id) => CREW_BY_ID[id]).slice(0, CREW_SLOTS)
    ;['messages', 'log', 'decisions', 'sent', 'research', 'marsData'].forEach((k) => { if (!Array.isArray(s.mission[k])) s.mission[k] = [] })
    if (!Number.isFinite(s.balance) || s.balance < 0) s.balance = Math.max(0, Number(s.balance) || 0)
    if (s.team && !Array.isArray(s.team.members)) { s.team = null; if (s.mode === 'team') s.mode = 'solo' }
    s.screen = sanitizeScreen(s) // an inconsistent save can never open a screen that cannot work
    return s
  } catch (e) {
    // an unreadable save is never thrown away: keep a copy so it can be restored from the welcome screen
    try { const raw = localStorage.getItem(SAVE_KEY); if (raw) localStorage.setItem(SAVE_KEY + '.backup', raw) } catch (e2) { /* ignore */ }
    return initialState()
  }
}
export function saveState(s) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ ...s, pet: { ...s.pet, lastTick: Date.now() } })) } catch (e) { /* storage unavailable */ }
}
export { WEIGHT_LIMIT, ESSENTIALS, LEVELS, HINT_COST }
