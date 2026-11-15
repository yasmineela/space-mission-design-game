// ===== Learning helpers shared by all educational content =====

// The three learning levels (they map onto the existing difficulty tiers, so saves and rewards are unchanged).
export const LEARNING_LEVELS = [
  { tier: 'easy', n: 1, name: 'Discover', emoji: '🔭', verb: 'Notice and name', blurb: 'Meet the big ideas. Look, wonder, and learn what things are called and what they do.' },
  { tier: 'inter', n: 2, name: 'Understand', emoji: '💡', verb: 'Explain and apply', blurb: 'Use what you know. Work out cause and effect: if I do this, what happens, and why?' },
  { tier: 'adv', n: 3, name: 'Investigate', emoji: '🧪', verb: 'Compare, decide and justify', blurb: 'Weigh up evidence, compare options, and explain why your choice is the best one.' },
]
export const LEVEL_BY_TIER = Object.fromEntries(LEARNING_LEVELS.map((l) => [l.tier, l]))

// Spread the correct answer evenly over the answer positions (A/B/C/D), in a fixed order that never changes
// between sessions. Without this the right answer was nearly always the first or second choice, so a child
// could score well by guessing the pattern instead of using the science.
const moveTo = (arr, from, to) => { const a = [...arr]; const [x] = a.splice(from, 1); a.splice(to, 0, x); return a }
export function makeSpreader(offset = 1) {
  let k = offset
  return {
    // options is an array, correctIndex says which one is right; returns { options, index }
    spread(options, correctIndex) {
      const n = options.length
      if (n < 2 || correctIndex < 0) return { options, index: correctIndex }
      const to = k++ % n
      return { options: moveTo(options, correctIndex, to), index: to }
    },
  }
}

// Friendly colour names for the colour pickers (so screen readers say "pink", not a hex code)
const COLOR_NAMES = { '#ff5ca8': 'pink', '#35d0ff': 'sky blue', '#ff9f43': 'orange', '#7cffb2': 'mint green', '#a78bfa': 'lilac', '#ffd166': 'yellow', '#7c5cff': 'violet', '#2fd88f': 'green' }
export const colorName = (hex) => COLOR_NAMES[String(hex).toLowerCase()] || 'custom'
