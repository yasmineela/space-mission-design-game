// Component catalogue, decoys and the three instruction books.
export const CORE_WEIGHT = 500
export const WEIGHT_LIMIT = 10000

export const COMPONENTS = [
  // ---------- LEVEL 1 – Recognition ----------
  { id: 'capsule', level: 1, name: 'Basic Crew Capsule', emoji: '🧑‍🚀', color: '#e8ecff', price: 50, weight: 900,
    purpose: 'Protects and accommodates astronauts.',
    desc: 'A small pressurised cabin where astronauts live, sleep and work. It keeps them safe inside.' },
  { id: 'engine', level: 1, name: 'Basic Rocket Engine', emoji: '🔥', color: '#ff8a4c', price: 60, weight: 1400,
    purpose: 'Provides thrust.',
    desc: 'Burns propellant and shoots hot gas backwards. The push forward is called thrust!' },
  { id: 'tank', level: 1, name: 'Fuel Tank', emoji: '🛢️', color: '#ffb35c', price: 40, weight: 1100,
    purpose: 'Stores propellant.',
    desc: 'A strong tank that holds the propellant (rocket fuel) until the engine needs it.' },
  { id: 'antenna', level: 1, name: 'Communication Antenna', emoji: '📡', color: '#ffd166', price: 30, weight: 120,
    purpose: 'Enables communication with Earth.',
    desc: 'Sends and receives radio signals so the crew can talk to Mission Control.' },
  { id: 'power', level: 1, name: 'Basic Power System', emoji: '🔋', color: '#7cffb2', price: 40, weight: 350,
    purpose: 'Provides electrical energy.',
    desc: 'Batteries and wiring that give the spacecraft electricity for lights and computers.' },
  // ---------- LEVEL 2 – Understanding ----------
  { id: 'thermal', level: 2, name: 'Thermal Protection System', emoji: '🛡️', color: '#ff8a4c', price: 80, weight: 700,
    purpose: 'Protects the spacecraft from extreme temperatures.',
    desc: 'Heat-resistant tiles that protect the spacecraft from extreme heat and cold (like a heat shield).' },
  { id: 'life', level: 2, name: 'Life-Support System', emoji: '🌬️', color: '#7cffb2', price: 70, weight: 450,
    purpose: 'Maintains breathable air and suitable cabin conditions.',
    desc: 'Makes sure there is oxygen to breathe, removes carbon dioxide and keeps the cabin comfortable.' },
  { id: 'nav', level: 2, name: 'Navigation System', emoji: '🧭', color: '#5ee3ff', price: 60, weight: 200,
    purpose: 'Helps determine position and direction.',
    desc: 'Uses star trackers and sensors to work out where the spacecraft is and which way it is heading.' },
  { id: 'solar', level: 2, name: 'Solar Panels', emoji: '☀️', color: '#4d7dff', price: 65, weight: 300,
    purpose: 'Convert sunlight into electricity.',
    desc: 'Big wings of special cells that turn sunlight into electrical energy.' },
  { id: 'radiation', level: 2, name: 'Radiation Shielding', emoji: '☢️', color: '#b47cff', price: 75, weight: 500,
    purpose: 'Helps protect astronauts from harmful radiation.',
    desc: 'Dense material around the crew cabin that blocks harmful particles from the Sun and deep space.' },
  // ---------- LEVEL 3 – Application ----------
  { id: 'adv_prop', level: 3, name: 'Advanced Propulsion System', emoji: '⚡', color: '#5ee3ff', price: 110, weight: 1500,
    purpose: 'More efficient propulsion for long-distance travel.',
    desc: 'An efficient engine that gets much more push from each bit of fuel – perfect for a long trip.' },
  { id: 'adv_comm', level: 3, name: 'Advanced Communication System', emoji: '🛰️', color: '#ffd166', price: 90, weight: 250,
    purpose: 'Supports communication over long distances.',
    desc: 'A big, powerful dish that can send a strong signal across millions of kilometres.' },
  { id: 'lab', level: 3, name: 'Scientific Research Equipment', emoji: '🔬', color: '#b47cff', price: 100, weight: 400,
    purpose: 'Allows astronauts to conduct experiments.',
    desc: 'Microscopes, sample boxes and sensors so the crew can run experiments and study Mars.' },
  { id: 'recycler', level: 3, name: 'Water Recycling System', emoji: '💧', color: '#2ea8ff', price: 95, weight: 350,
    purpose: 'Helps reuse water.',
    desc: 'Cleans used water so the crew can drink and use it again and again.' },
  { id: 'backup', level: 3, name: 'Emergency Backup System', emoji: '🛟', color: '#ff5c7a', price: 105, weight: 300,
    purpose: 'Provides backup support when essential systems fail.',
    desc: 'A spare set of critical controls that switches on if a main system stops working.' },
]

// Wrong-but-tempting items that appear in the marketplace.
export const DECOYS = [
  { id: 'wheels', level: 2, name: 'Landing Wheels', emoji: '🛞', color: '#9aa0b8', price: 55, weight: 250, purpose: 'Roll along a runway.', desc: 'Wheels for rolling along the ground.' },
  { id: 'sticker', level: 2, name: 'Sticker & Paint Kit', emoji: '🎨', color: '#ff5ca8', price: 25, weight: 40, purpose: 'Decorate the spacecraft.', desc: 'Makes your spacecraft look cool, but does not do an engineering job.' },
  { id: 'booster', level: 3, name: 'Giant Booster Pack', emoji: '🚀', color: '#ff8a4c', price: 80, weight: 3200, purpose: 'Big, cheap burst of power.', desc: 'A huge, cheap booster that gives a big push – but it is very heavy and burns lots of fuel.' },
  { id: 'parachute', level: 3, name: 'Parachute Pack', emoji: '🪂', color: '#ffd166', price: 45, weight: 200, purpose: 'Slows falling in air.', desc: 'Slows an object that is falling through an atmosphere.' },
  { id: 'walkie', level: 3, name: 'Walkie-Talkie Radio', emoji: '📻', color: '#9aa0b8', price: 30, weight: 20, purpose: 'Short-range radio.', desc: 'A small radio that works over a few kilometres.' },
  { id: 'lamp', level: 3, name: 'Signal Lamp', emoji: '🔦', color: '#ffe38a', price: 20, weight: 30, purpose: 'Flash light signals.', desc: 'A bright lamp for sending light signals.' },
  { id: 'cargo', level: 3, name: 'Extra Cargo Crates', emoji: '📦', color: '#c7a26b', price: 60, weight: 700, purpose: 'Store more stuff.', desc: 'Boxes for carrying extra supplies.' },
  { id: 'barrels', level: 3, name: 'Extra Water Barrels', emoji: '🛢️', color: '#5ab4ff', price: 50, weight: 1500, purpose: 'Carry lots of water.', desc: 'Big barrels filled with fresh water for the whole trip.' },
  { id: 'lights', level: 3, name: 'Party Lights', emoji: '🪩', color: '#ff5ca8', price: 30, weight: 50, purpose: 'Make the cabin sparkle.', desc: 'Colourful lights for fun!' },
  { id: 'paintkit', level: 3, name: 'Spare Paint Pots', emoji: '🪣', color: '#ff9f43', price: 20, weight: 100, purpose: 'Touch up the paint.', desc: 'Paint to keep the outside looking shiny.' },
]

export const ITEMS = Object.fromEntries([...COMPONENTS, ...DECOYS].map((c) => [c.id, c]))
export const compsOfLevel = (n) => COMPONENTS.filter((c) => c.level === n)

export const LEVELS = [
  {
    n: 1, title: 'Level 1 – Recognition', tag: 'BASIC SPACECRAFT', reward: 100,
    intro: 'Learn the names and jobs of the five basic spacecraft parts. The book tells you exactly what to buy!',
    steps: [
      { target: 'capsule', text: 'Purchase a basic crew capsule.' },
      { target: 'engine', text: 'Purchase a basic propulsion engine.' },
      { target: 'tank', text: 'Purchase a fuel tank.' },
      { target: 'antenna', text: 'Purchase a basic communication system.' },
      { target: 'power', text: 'Purchase a basic power system.' },
    ],
  },
  {
    n: 2, title: 'Level 2 – Understanding', tag: 'INTERMEDIATE SPACECRAFT', reward: 120,
    intro: 'The book only describes what each part DOES. Read the parts list and match the right component to each job!',
    steps: [
      { target: 'thermal', text: "This component protects the astronauts from extreme temperatures when the spacecraft returns through Earth's atmosphere." },
      { target: 'life', text: 'Astronauts need to breathe! Find the system that keeps the cabin air clean and breathable and the temperature comfortable.' },
      { target: 'nav', text: 'Space is huge and has no road signs. Find the part that works out where the spacecraft is and which way it is pointing.' },
      { target: 'solar', text: 'Far from any power socket, the spacecraft needs a way to turn sunlight into electricity.' },
      { target: 'radiation', text: 'Space is full of invisible harmful particles from the Sun and stars. Find the part that helps block them from reaching the crew.' },
    ],
  },
  {
    n: 3, title: 'Level 3 – Application', tag: 'ADVANCED SPACECRAFT', reward: 60,
    intro: 'Real engineering! Each step is a mission requirement. Think about weight, fuel, energy, crew safety and distance.',
    steps: [
      { target: 'adv_prop', options: ['adv_prop', 'booster', 'parachute'],
        text: 'MISSION NEED: Mars is millions of kilometres away. You need a propulsion system that gets the most push from each bit of fuel. Think about weight and fuel efficiency.',
        why: {
          booster: 'The Giant Booster Pack gives lots of push, but it weighs 3,200 kg and burns fuel fast. A heavier spacecraft needs even more fuel – not efficient for a long trip!',
          parachute: 'A parachute needs air to work. Space has no air to push against, so it cannot speed you up or slow you down there.',
        } },
      { target: 'adv_comm', options: ['adv_comm', 'walkie', 'lamp'],
        text: 'MISSION NEED: Signals take many minutes to reach Earth from Mars. You need to keep talking with Mission Control over a very long distance.',
        why: {
          walkie: 'A walkie-talkie only reaches a few kilometres. Earth will be tens of millions of kilometres away!',
          lamp: 'A lamp is light, but a tiny signal lamp is far too faint to be seen from Earth. We need a powerful radio dish.',
        } },
      { target: 'lab', options: ['lab', 'cargo', 'lights'],
        text: 'MISSION NEED: Scientists want the crew to study Martian rocks, dust and plant growth. What will let them run experiments and analyse samples?',
        why: {
          cargo: 'Cargo crates can store things, but they cannot test or measure anything. They also add 700 kg of weight.',
          lights: 'Party lights are fun, but they do not help scientists measure or analyse anything.',
        } },
      { target: 'recycler', options: ['recycler', 'barrels', 'paintkit'],
        text: 'MISSION NEED: The trip takes months. Water is heavy to carry, and every extra kilogram needs extra fuel. How can the crew have enough water without a heavy load?',
        why: {
          barrels: 'Barrels hold plenty of water, but 1,500 kg is a LOT of extra weight – that means a lot more fuel to carry it. Recycling is smarter.',
          paintkit: 'Paint will not give anyone water to drink! It only adds weight.',
        } },
      { target: 'backup', options: ['backup', 'lights', 'paintkit'],
        text: 'MISSION NEED: Far from Earth, no rescue is possible. If an important system fails, the crew still needs to stay safe. What should you add for crew safety?',
        why: {
          lights: 'Party lights will not keep anyone alive if life support fails.',
          paintkit: 'Fresh paint does not help when a system breaks. Safety first!',
        } },
    ],
  },
]

export const ESSENTIALS = [
  { id: 'capsule', label: 'Crew cabin' },
  { id: 'engine', label: 'Engine (thrust)' },
  { id: 'tank', label: 'Fuel storage' },
  { id: 'antenna', label: 'Communication' },
  { id: 'power', label: 'Power' },
  { id: 'life', label: 'Life support' },
  { id: 'nav', label: 'Navigation' },
]
