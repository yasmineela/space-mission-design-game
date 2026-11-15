import { makeSpreader } from './learn.js'
export const CREW_SLOTS = 3
export const XP_PER_MODULE = 100
export const CERT_XP = 400

// Eight specializations. Each one explains itself in simple language, names the
// FICTIONAL gameplay bonus it grants, and the mission "need" it relates to.
export const SPECS = {
  engineering: { name: 'Engineering', emoji: '🔧', color: '#ff9f43',
    explain: 'Engineers design, build and fix machines. An astronaut with engineering experience could help the crew respond to spacecraft equipment problems.',
    need: 'Power and equipment problems', needText: 'Systems can fail far from Earth. Someone has to diagnose and repair them.',
    bonus: 'Equipment & repair challenges' },
  operations: { name: 'Spacecraft operations', emoji: '🎛️', color: '#35d0ff',
    explain: 'Operating a spacecraft means flying it day to day: reading indicators, using controls and talking with Mission Control.',
    need: 'Communication with Mission Control', needText: 'The spacecraft must keep talking with Earth, even when a link fails.',
    bonus: 'Communication & systems challenges' },
  biology: { name: 'Biology & life sciences', emoji: '🧬', color: '#35e08f',
    explain: 'Biologists study living things. An astronaut with biological research experience could help with experiments involving plants, animals or the human body.',
    need: 'Experiments with living things', needText: 'The crew will grow plants and study how living things behave in space.',
    bonus: 'Biological experiments' },
  physics: { name: 'Physics', emoji: '⚛️', color: '#8b5cf6',
    explain: 'Physics explains motion, forces and energy. It helps with calculations such as engine burns and understanding microgravity.',
    need: 'Engine and orbit calculations', needText: 'To reach orbit around Mars, the crew must work out how and when to fire the engine.',
    bonus: 'Calculations & microgravity science' },
  medicine: { name: 'Medicine & human health', emoji: '🩺', color: '#ff5ca8',
    explain: 'Space doctors keep astronauts healthy. They know how bodies react to weightlessness, radiation and poor air.',
    need: 'Crew health and cabin air', needText: 'If the air or the crew’s health is in danger, a quick correct response matters.',
    bonus: 'Health-related emergencies' },
  robotics: { name: 'Robotics', emoji: '🦾', color: '#c77dff',
    explain: 'Robotic arms and rovers do jobs astronauts cannot easily do. An astronaut with robotics experience could help operate robotic equipment.',
    need: 'Robotic arm operations', needText: 'Cargo can drift loose outside the spacecraft. A robotic arm can grab it safely.',
    bonus: 'Robotic operation challenges' },
  research: { name: 'Scientific research', emoji: '🔬', color: '#ffd166',
    explain: 'Research scientists plan experiments, collect data and make discoveries by studying evidence carefully.',
    need: 'Scientific discoveries', needText: 'On Mars the crew must study rocks and decide what the evidence means.',
    bonus: 'Discovery & sample-analysis challenges' },
  navigation: { name: 'Navigation & piloting', emoji: '🧭', color: '#ff6b6b',
    explain: 'Pilots and navigators work out where the spacecraft is, where it is going and how to steer it there.',
    need: 'Course corrections', needText: 'Tiny errors grow over millions of kilometres. The crew must measure and correct their path.',
    bonus: 'Navigation challenges' },
}
export const SPEC_IDS = Object.keys(SPECS)
// used in challenge pop-ups: "No one on your crew specialises in … problems"
export const SKILL_LABEL = {
  engineering: 'equipment and repair', operations: 'spacecraft operations', biology: 'biology', physics: 'physics',
  medicine: 'health', robotics: 'robotics', research: 'research', navigation: 'navigation',
}

// REAL astronauts. No human has travelled to Mars – these people flew in Earth orbit (or, for
// Neil Armstrong, to the Moon). The gameplay bonuses are fictional and not endorsed by them.
export const ASTRONAUTS = [
  { id: 'armstrong', name: 'Neil Armstrong', initials: 'NA', color: '#ff9f43', nationality: 'American 🇺🇸', skill: 'navigation',
    background: 'Naval aviator, test pilot and aerospace engineer',
    bio: 'Neil flew rocket-powered planes before becoming an astronaut. In 1969 he commanded Apollo 11 and became the first person to walk on the Moon.',
    achievements: ['Commander of Apollo 11 and the first person to walk on the Moon (20 July 1969).', 'Commanded Gemini 8 (1966), which achieved the first docking of two spacecraft in orbit.', 'Studied aerospace engineering and worked as a test pilot.'],
    help: 'He would help your crew measure your position and correct the spacecraft’s course.' },
  { id: 'tereshkova', name: 'Valentina Tereshkova', initials: 'VT', color: '#ff6b6b', nationality: 'Russian (Soviet Union at the time) 🇷🇺', skill: 'navigation',
    background: 'Textile worker, skilled parachutist and cosmonaut',
    bio: 'Valentina loved parachute jumping. In 1963 she became the first woman to fly in space, orbiting Earth for almost three days.',
    achievements: ['First woman to fly in space (Vostok 6, 16–19 June 1963).', 'Orbited Earth 48 times in her single spaceflight.', 'Later trained as an engineer.'],
    help: 'Her piloting experience would help the crew stay calm and keep the spacecraft pointed the right way.' },
  { id: 'hadfield', name: 'Chris Hadfield', initials: 'CH', color: '#35d0ff', nationality: 'Canadian 🇨🇦', skill: 'operations',
    background: 'Fighter and test pilot, engineer, ISS commander',
    bio: 'Chris learned to run complicated machines as a pilot. He later commanded the International Space Station and became famous for sharing life in space with the world.',
    achievements: ['Commanded the International Space Station during Expedition 35 (2013).', 'First Canadian to walk in space (2001).', 'Flew three space missions.'],
    help: 'He would help your crew run spacecraft systems and solve communication problems with Mission Control.' },
  { id: 'cristoforetti', name: 'Samantha Cristoforetti', initials: 'SC', color: '#7cffb2', nationality: 'Italian 🇮🇹 (European Space Agency)', skill: 'engineering',
    background: 'Air force fighter pilot and engineer',
    bio: 'Samantha studied engineering and became a pilot before joining the European Space Agency. She has lived on the International Space Station twice.',
    achievements: ['First Italian woman in space (2014–15, a mission of about 200 days).', 'First European woman to command the International Space Station (2022).', 'Studied engineering and trained as a fighter pilot.'],
    help: 'She would help your crew work out what is wrong with a broken machine and how to repair it.' },
  { id: 'wakata', name: 'Koichi Wakata', initials: 'KW', color: '#c77dff', nationality: 'Japanese 🇯🇵 (JAXA)', skill: 'robotics',
    background: 'Aerospace engineer and astronaut',
    bio: 'Koichi is an engineer who is famous for using robotic arms in space. He has flown several missions and spent months on the International Space Station.',
    achievements: ['First Japanese astronaut to operate a Space Shuttle robotic arm (STS-72, 1996).', 'First Japanese commander of the International Space Station (2014).', 'Completed several long stays on the space station.'],
    help: 'He would help your crew steer a robotic arm to grab equipment safely.' },
  { id: 'jemison', name: 'Mae Jemison', initials: 'MJ', color: '#ff5ca8', nationality: 'American 🇺🇸', skill: 'medicine',
    background: 'Medical doctor and engineer',
    bio: 'Mae was a doctor and an engineer who also worked as a medical officer with the Peace Corps in West Africa. In 1992 she flew on the Space Shuttle.',
    achievements: ['First African American woman to travel into space (Space Shuttle Endeavour, STS-47, September 1992).', 'Trained as a medical doctor and holds an engineering degree.', 'Worked on experiments about bone cells and motion sickness in space.'],
    help: 'She would help your crew respond to health problems such as a cabin-air alarm.' },
  { id: 'meir', name: 'Jessica Meir', initials: 'JM', color: '#35e08f', nationality: 'American 🇺🇸', skill: 'biology',
    background: 'Marine biologist and physiologist',
    bio: 'Jessica studied how animals such as penguins and geese cope in extreme places before she became an astronaut. She lived on the International Space Station in 2019–2020.',
    achievements: ['Took part in the first all-woman spacewalk (October 2019).', 'Spent about 205 days on the International Space Station.', 'Studied animal physiology as a scientist before joining NASA.'],
    help: 'She would help your crew run experiments with living things, like growing plants.' },
  { id: 'whitson', name: 'Peggy Whitson', initials: 'PW', color: '#9be86a', nationality: 'American 🇺🇸', skill: 'biology',
    background: 'Biochemist and long-duration astronaut',
    bio: 'Peggy is a scientist who studied how living cells work. She has spent more time in space than any other American astronaut.',
    achievements: ['First woman to command the International Space Station (2007), and she commanded it again in 2017.', 'Has spent well over 600 days in space, a record for an American astronaut.', 'Completed 10 spacewalks.'],
    help: 'Her life-science experience would help your crew carry out careful experiments with living things.' },
  { id: 'ride', name: 'Sally Ride', initials: 'SR', color: '#a78bfa', nationality: 'American 🇺🇸', skill: 'physics',
    background: 'Physicist with a PhD in physics',
    bio: 'Sally was a physicist who studied lasers before becoming an astronaut. In 1983 she became the first American woman in space.',
    achievements: ['First American woman in space (STS-7, June 1983).', 'Flew twice on the Space Shuttle (1983 and 1984).', 'Earned a PhD in physics and used the shuttle’s robotic arm in orbit.'],
    help: 'She would help your crew do the maths for engine burns and understand how things move in microgravity.' },
  { id: 'bondar', name: 'Roberta Bondar', initials: 'RB', color: '#ff8fb3', nationality: 'Canadian 🇨🇦', skill: 'medicine',
    background: 'Neurologist (brain doctor) and scientist',
    bio: 'Roberta is a doctor who studies the brain. In 1992 she flew on the Space Shuttle to learn how weightlessness changes the body.',
    achievements: ['First Canadian woman in space (STS-42, January 1992).', 'First neurologist in space.', 'Studied how weightlessness affects the brain and body.'],
    help: 'She would help your crew keep everyone healthy and spot early signs of trouble.' },
  { id: 'watkins', name: 'Jessica Watkins', initials: 'JW', color: '#b47cff', nationality: 'American 🇺🇸', skill: 'research',
    background: 'Geologist and NASA astronaut',
    bio: 'Jessica is a geologist who studies rocks and planets, including Mars, using data from NASA spacecraft. She lived on the International Space Station in 2022.',
    achievements: ['NASA astronaut selected in 2017; a planetary geologist.', 'Spent about six months on the International Space Station in 2022 (Crew-4).', 'First Black woman to join a long-duration crew on the International Space Station.'],
    help: 'She would help your crew study rock samples and decide what the evidence means.' },
]
export const CREW_BY_ID = Object.fromEntries(ASTRONAUTS.map((a) => [a.id, a]))
// kept for older screens: friendly skill/bonus names derived from the specialization
ASTRONAUTS.forEach((a) => { a.skillName = SPECS[a.skill].name; a.expertise = SPECS[a.skill].name; a.brings = a.help; a.bonus = `+20% score and one wrong option ruled out: ${SPECS[a.skill].bonus.toLowerCase()}` })

// ---------------- Astronaut Training Academy ----------------
export const TRAINING = [
  { id: 'ops', emoji: '🎛️', name: 'SPACECRAFT OPERATIONS', blurb: 'Read indicators, watch fuel and energy, talk to Mission Control and steer.' },
  { id: 'micro', emoji: '🫧', name: 'MICROGRAVITY TRAINING', blurb: 'Push floating objects and learn why things float in orbit.' },
  { id: 'emergency', emoji: '🚨', name: 'EMERGENCY TRAINING', blurb: 'Four emergencies – choose the best response.' },
  { id: 'science', emoji: '🔬', name: 'SCIENTIFIC TRAINING', blurb: 'Plan the plant experiment your crew will run on the mission.' },
]
export const RANKS = [['Cadet', 0], ['Trainee Astronaut', 100], ['Flight Trainee', 200], ['Mission Specialist', 300], ['CERTIFIED MISSION COMMANDER', 400]]

export const TRAINING_MODULES = {
  ops: {
    intro: 'Mission Control is training you to fly Space Buddy. Read the clues, then answer each question.',
    rounds: [
      { q: 'Your dashboard shows: Oxygen 92% · Energy 78% · FUEL 9% · Comms Online. Which indicator needs attention first?', options: ['Oxygen', 'Energy', 'Fuel', 'Comms'], answer: 2, why: 'Fuel at 9% is in the danger zone. Indicators help astronauts notice problems early.', gauge: [['Oxygen', 92], ['Energy', 78], ['Fuel', 9]] },
      { q: 'You have 30 fuel units. Each leg of the journey uses 6 units. How many legs can you fly?', options: ['3 legs', '5 legs', '6 legs', '30 legs'], answer: 1, why: '30 ÷ 6 = 5 legs. Astronauts always check that fuel and energy will last the whole trip.' },
      { q: 'A message to Earth takes about 10 minutes to arrive. Why?', options: ['Radio signals take time to cross the huge distance', 'The radio is broken', 'Mission Control is asleep', 'Space is too cold'], answer: 0, why: 'Radio travels at the speed of light, but Mars is so far away that signals still take minutes to arrive.' },
      { q: 'You need to turn the spacecraft slightly to the left. Which control do you use?', options: ['Main engine', 'Small attitude thrusters', 'Solar panels', 'Radio'], answer: 1, why: 'Small thrusters nudge a spacecraft to rotate it. The big main engine is for changing speed.' },
    ],
  },
  emergency: {
    intro: 'Four emergency alarms are about to sound. Stay calm and choose the best response.',
    rounds: [
      { q: '📡 COMMUNICATION FAILURE: the radio has gone silent. What do you do?', options: ['Check the antenna and switch to the backup link', 'Shout louder', 'Turn the radio off for the day', 'Ignore it'], answer: 0, why: 'Check the equipment first, then use the backup. Volume does not change how radio waves travel.' },
      { q: '🫁 LOW OXYGEN WARNING: the oxygen level is dropping. What is the best first step?', options: ['Open the hatch for fresh air', 'Put on emergency masks and check the life-support system', 'Turn off all the lights and rest', 'Wait to see what happens'], answer: 1, why: 'Protect your breathing first, then find the fault in life support. There is no air outside to open a hatch to!' },
      { q: '🔋 POWER SHORTAGE: you must pick what stays on. Which list is best?', options: ['Life support, radio and navigation', 'Lights, music and games', 'Only the science lab', 'Everything off'], answer: 0, why: 'Keep what protects the crew and lets you steer and talk to Earth. Non-essential systems can wait.' },
      { q: '🔧 DAMAGED EQUIPMENT: a part is giving a warning light. What should you do?', options: ['Find which part has the fault, then follow the repair checklist', 'Hit it with a wrench', 'Switch off every system', 'Pretend it is fine'], answer: 0, why: 'Engineers find the faulty part first and fix only that part, following a checklist.' },
    ],
  },
  science: {
    intro: 'On the mission your crew will grow bean seeds to see how light affects plant growth. Plan the experiment!',
    rounds: [
      { q: 'Why do scientists grow plants in space?', options: ['To learn how living things grow in space and how astronauts could grow food', 'Because plants like rockets', 'To decorate the cabin', 'To make oxygen for the engine'], answer: 0, why: 'Learning how plants grow in space helps plan food for long trips like a journey to Mars.' },
      { q: 'You will test three light settings. What must you keep the SAME in a fair experiment?', options: ['Seed type, water and temperature', 'The amount of light', 'Nothing – change everything', 'The names of the plants'], answer: 0, why: 'In a fair test you change only ONE thing (the light) and keep everything else the same.' },
      { q: 'After 3 days you measure growth for each light setting. What is the best thing to do with the numbers?', options: ['Write them in a data table and compare them', 'Throw them away', 'Guess which is best', 'Only measure one plant'], answer: 0, why: 'Scientists record data and compare it before they make a conclusion.' },
    ],
  },
}
export const MICRO_QUIZ = {
  q: 'Why do objects float inside an orbiting spacecraft?',
  options: [
    { t: 'There is no gravity in space at all', ok: false, why: 'Gravity is still there – around 90% as strong as on Earth at the space station’s height!' },
    { t: 'The spacecraft and everything inside are falling around Earth together', ok: true, why: 'Correct! Everything is in free-fall together while moving sideways very fast, so nothing pushes on anything else. We call this microgravity.' },
    { t: 'Air inside the spacecraft lifts things up', ok: false, why: 'Air is far too light to hold things up. The real reason is free-fall.' },
  ],
}


// answer positions spread evenly (see learn.js)
{
  const sp = makeSpreader(2)
  Object.values(TRAINING_MODULES).forEach((m) => m.rounds.forEach((r) => { const x = sp.spread(r.options, r.answer); r.options = x.options; r.answer = x.index }))
  const y = sp.spread(MICRO_QUIZ.options, MICRO_QUIZ.options.findIndex((o) => o.ok)); MICRO_QUIZ.options = y.options
}


// Clues shown after a wrong answer in training (they point to the idea without giving the answer away)
export const TRAINING_HINTS = {
  ops: ['Look at the gauges: which bar is almost empty? A nearly empty tank is the first thing to fix.', 'Divide: how many groups of 6 fit into 30?', 'Radio waves are very fast – but Mars is tens of millions of kilometres away. What does a long trip need?', 'A big engine changes your speed. Which tool nudges a spacecraft round gently?'],
  emergency: ['Before you fix a radio, what should you check? And what do spacecraft carry in case something fails?', 'You cannot open a hatch in space. What protects your breathing while you find the fault?', 'Which systems keep people alive and let you steer and talk to Earth?', 'Engineers look for the faulty part first. What comes after finding it?'],
  science: ['Think about what the plants and astronauts could use this knowledge for on a long journey.', 'In a fair test you change only ONE thing. Everything else must stay the…', 'What do scientists do with numbers so they can see a pattern?'],
}
