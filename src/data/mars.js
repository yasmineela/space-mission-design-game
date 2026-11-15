import { makeSpreader } from './learn.js'
// ============ MARS EXPLORATION (scripted for the prototype; all samples are SIMULATED) ============
export const ROVER = { scan: 3, photo: 2, collect: 5, fullBattery: 100, kmPerUnit: 0.6 }

export const SITES = [
  { id: 'base', name: 'Landing site', emoji: '🚀', x: 12, y: 78, blurb: 'Your spacecraft landed here. The rover recharges its battery using solar panels.' },
  { id: 'crater', name: 'Dusty Crater', emoji: '🕳️', x: 32, y: 46, blurb: 'A wide bowl-shaped hole with a raised rim.', task: 'terrain' },
  { id: 'ridge', name: 'Olympus Ridge', emoji: '⛰️', x: 56, y: 18, blurb: 'Tall, gently sloping mountains in the distance.', task: 'terrain' },
  { id: 'plain', name: 'Rocky Plain', emoji: '🪨', x: 52, y: 66, blurb: 'Flat red ground scattered with rocks of many sizes.', task: 'terrain', sample: 'rock' },
  { id: 'dunes', name: 'Dune Field', emoji: '🏜️', x: 80, y: 74, blurb: 'Wind-blown ridges of fine red dust and sand.', sample: 'soil' },
  { id: 'ice', name: 'Polar Ice Edge', emoji: '🧊', x: 86, y: 26, blurb: 'A cold, shadowed place near the pole.', task: 'water', sample: 'ice' },
]
export const SITE_BY_ID = Object.fromEntries(SITES.map((s) => [s.id, s]))
export const distance = (a, b) => { const A = SITE_BY_ID[a], B = SITE_BY_ID[b]; return Math.hypot(A.x - B.x, A.y - B.y) }
export const roverCost = (a, b) => Math.max(1, Math.ceil(distance(a, b) / 5)) // % of battery
export const roverKm = (a, b) => Math.round(distance(a, b) * ROVER.kmPerUnit)

// ---- Activity A: explore the terrain (observe & identify) ----
export const OBSERVATIONS = {
  crater: { qid: 'obs_crater', scene: 'You scan a huge round bowl in the ground with a raised rim. What is it?', options: [
    { t: 'An impact crater, made when a space rock hit Mars', ok: true }, { t: 'A giant swimming pool', ok: false }, { t: 'A volcano', ok: false }],
    why: 'Impact craters form when asteroids or comets crash into a planet. Scientists count craters to estimate how old a surface is – more craters usually means an older surface.', hint: 'Think about what happens when a rock from space smashes into the ground.', caption: 'An impact crater with a raised rim.', learn: 'Impact craters' },
  ridge: { qid: 'obs_ridge', scene: 'You see a very tall mountain with gentle slopes and a hollow at the top. It is much taller than any mountain on Earth. What is it most likely to be?', options: [
    { t: 'A volcano', ok: true }, { t: 'A sand dune', ok: false }, { t: 'A frozen lake', ok: false }],
    why: 'Mars has the tallest known volcano in the Solar System, Olympus Mons. Volcanoes grow when lava builds up over a very long time.', hint: 'Mars’ biggest mountain is famous – the name starts with “Olympus”.', caption: 'A giant volcano on the horizon.', learn: 'Volcanoes' },
  plain: { qid: 'obs_plain', scene: 'The ground is flat and covered with rocks of many sizes. Where might these rocks have come from?', options: [
    { t: 'Volcanoes, impacts, wind and ancient floods broke and moved them', ok: true }, { t: 'The astronauts dropped them', ok: false }, { t: 'They grew like plants', ok: false }],
    why: 'Rocks are shaped by many forces: lava, crashing meteorites, strong winds and – long ago – flowing water. Looking at them closely tells scientists about the planet’s history.', hint: 'Many different natural forces change rocks over millions of years.', caption: 'A plain scattered with rocks.', learn: 'Rocks and erosion' },
}
export const TERRAIN_SITES = ['crater', 'ridge', 'plain']

// ---- Activity B: collect and analyse (simulated) samples ----
export const SAMPLE_INFO = {
  rock: { id: 'rock', name: 'Rock sample', emoji: '🪨', site: 'plain', qid: 'smp_rock',
    q: 'Your rock sample is layered, like the pages of a book. What might that suggest?', options: [
      { t: 'It formed in layers over time, perhaps from settling sediment or lava flows', ok: true }, { t: 'Someone built it', ok: false }, { t: 'It is alive', ok: false }],
    why: 'Layers record how a rock formed, like tree rings. Scientists read the layers to learn about the planet’s past.', hint: 'Layers build up one on top of another over a long time.', learn: 'Layered rock tells a story' },
  soil: { id: 'soil', name: 'Soil (dust) sample', emoji: '🟤', site: 'dunes', qid: 'smp_soil',
    q: 'Why do scientists study Martian soil?', options: [
      { t: 'To learn what it is made of and whether it could once have been touched by water', ok: true }, { t: 'To bake Martian cookies', ok: false }, { t: 'To make the rover heavier', ok: false }],
    why: 'Analysing soil shows which minerals and chemicals are present. Some minerals only form when water is around.', hint: 'Soil is made of tiny pieces of rock and minerals. What could they reveal?', learn: 'Soil analysis' },
  ice: { id: 'ice', name: 'Ice sample', emoji: '🧊', site: 'ice', qid: 'smp_ice', q: null },
}
export const SAMPLE_NOTE = 'These are simulated samples for learning – they are not real discoveries.'
export const SAMPLE_REQUIRED = ['rock', 'soil'] // collected AND analysed to complete Activity B

// ---- Activity C: search for signs of water ----
export const WATER_CLUES = [
  { id: 'w1', emoji: '⚪', text: 'Bright white patches in a shadowed spot that stays very cold.' },
  { id: 'w2', emoji: '📡', text: 'The scan shows a layer under the ground that is different from normal rock.' },
  { id: 'w3', emoji: '🔷', text: 'Cracks form many-sided shapes in the ground, like patterns in frozen soil on Earth.' },
]
export const WATER_QUESTIONS = [
  { qid: 'wat_1', q: 'What do these clues suggest?', options: [
    { t: 'Water ice may be present at or just under the surface', ok: true }, { t: 'Mars has big oceans of liquid water today', ok: false }, { t: 'Aliens live here', ok: false }],
    why: 'Together, the clues point to water ice. Scientists would need more evidence – and more missions – to be sure.', hint: 'The place is extremely cold, so water would not be liquid. What form would it take?', learn: 'Water ice on Mars' },
  { qid: 'wat_2', q: 'Why is studying water important when asking whether Mars could support life?', options: [
    { t: 'Life as we know it needs water, so it helps scientists decide where to look – but finding water does not prove life exists', ok: true }, { t: 'Finding water proves that life exists on Mars', ok: false }, { t: 'Water is just pretty', ok: false }],
    why: 'Water is a key ingredient for the life we know. Finding water makes a place more interesting to study, but it does NOT prove that anything lived or lives there.', hint: 'Water is an ingredient for life – not proof of life.', learn: 'Water and the search for life' },
]

// ---- Space Buddy facts (short, accurate) ----
export const BUDDY_FACTS = [
  'A day on Mars (a “sol”) is about 24 hours and 40 minutes – almost like Earth!',
  'Mars looks red because its dust contains iron that has rusted.',
  'Mars has the tallest known volcano in the Solar System: Olympus Mons.',
  'Mars’ air is very thin and mostly carbon dioxide – humans could not breathe it.',
  'Mars has two small moons, Phobos and Deimos.',
  'Mars is cold: the average temperature is about −60 °C.',
  'Mars’ polar caps contain water ice and frozen carbon dioxide.',
  'Robots – rovers – have driven on Mars to study its rocks, dust and sky.',
]

export const CONCEPTS = {
  terrain: ['Impact craters', 'Volcanoes', 'Rocks and erosion'],
  samples: ['Layered rock tells a story', 'Soil analysis', 'How scientists use samples to understand a planet'],
  water: ['Water ice on Mars', 'Water and the search for life (water ≠ proof of life)'],
}
export const EXPLORE_ACTIVITIES = [
  { id: 'terrain', emoji: '🔭', name: 'A · Explore the terrain', how: 'Drive to Dusty Crater, Olympus Ridge and the Rocky Plain. At each place, scan the surface and identify what you see.' },
  { id: 'samples', emoji: '🧪', name: 'B · Collect & analyse samples', how: 'Collect a rock sample at the Rocky Plain and a soil sample at the Dune Field, then analyse each one in the rover lab.' },
  { id: 'water', emoji: '💧', name: 'C · Search for signs of water', how: 'Drive to the Polar Ice Edge, scan for clues and work out what they might mean.' },
]


// answer positions spread evenly (see learn.js)
{
  const sp = makeSpreader(1)
  const okIdx = (o) => o.findIndex((x) => x.ok)
  Object.values(OBSERVATIONS).forEach((q) => { q.options = sp.spread(q.options, okIdx(q.options)).options })
  Object.values(SAMPLE_INFO).forEach((q) => { if (q.options) q.options = sp.spread(q.options, okIdx(q.options)).options })
  WATER_QUESTIONS.forEach((q) => { q.options = sp.spread(q.options, okIdx(q.options)).options })
}

