import { makeSpreader } from './learn.js'
// ===================== MARS MISSION CONTENT (scripted for the prototype) =====================
export const MISSION_STAGES = [
  'Earth launch', 'Leaving Earth’s atmosphere', 'Entering space', 'Spacecraft operations',
  'Scientific experiments', 'Mission challenges', 'Mars approach', 'Mars arrival',
]
export const EXPERIMENTS = ['gravity', 'solar', 'planet'] // required experiments
export const QUALITY_SCORE = { best: 100, ok: 60, poor: 25 }

// Journey challenges appear when the journey reaches `at` %. Each has an optional INSPECT table and an
// optional IDENTIFY step, then 2–4 actions. No answer ends the mission – mistakes are learning moments.
export const CHALLENGES = [
  { id: 'comm', at: 20, emoji: '📡', title: 'COMMUNICATION FAILURE', skill: 'operations',
    story: 'Beep-beep! The spacecraft has suddenly lost contact with Mission Control. The signal light on the panel is red.',
    why: 'Without communication, Mission Control cannot send instructions or receive your data.',
    identify: { q: 'First, identify the system: which part of your spacecraft is used to talk with Earth?', options: [
      { t: 'The communication antenna', ok: true, why: 'Yes! The antenna sends and receives radio signals.' },
      { t: 'The solar panels', ok: false, why: 'Solar panels make electricity – they do not carry radio signals.' },
      { t: 'The fuel tank', ok: false, why: 'The tank stores propellant for the engine.' },
      { t: 'The life-support system', ok: false, why: 'Life support keeps the air breathable.' } ] },
    options: [
      { t: 'Check the antenna alignment, then switch to the backup communication link.', q: 'best', fx: {}, res: 'The antenna had drifted slightly. After re-pointing it at Earth and switching links, the signal came back. Great engineering thinking!' },
      { t: 'Re-point the antenna towards Earth and wait for a reply.', q: 'ok', fx: { energy: -4 }, res: 'That helped, but it took a while and used extra power. A backup link would have been faster.' },
      { t: 'Shout louder into the microphone.', q: 'poor', fx: { energy: -6, health: -3 }, res: 'Radio waves do not care how loud you are! Volume does not change how far a radio signal travels. The crew fixed it the right way afterwards.' },
      { t: 'Switch off the radio and hope the problem fixes itself.', q: 'poor', fx: { energy: -6 }, res: 'Without a radio, Mission Control cannot help. Problems rarely solve themselves – always investigate. The crew restarted the link later.' },
    ],
    learn: 'Spacecraft antennas must point at Earth, and many spacecraft carry backup communication systems.' },
  { id: 'robot', at: 30, emoji: '🦾', title: 'ROBOTIC ARM CHALLENGE', skill: 'robotics',
    story: 'A supply container has come loose outside the spacecraft and is slowly drifting away. You must catch it before it is lost.',
    why: 'Equipment outside the spacecraft is hard to replace on a long journey.',
    options: [
      { t: 'Move the robotic arm slowly, line it up with the grapple point, then close the gripper.', q: 'best', fx: {}, res: 'Slow and careful! In microgravity a moving object keeps moving, so gentle, precise movements work best. The container is safely back on board.' },
      { t: 'Send a crew member on an immediate spacewalk to grab it.', q: 'ok', fx: { energy: -4, health: -2 }, res: 'It worked, but a spacewalk is slower and riskier than using the robotic arm that is built for the job.' },
      { t: 'Swing the arm quickly to snatch it.', q: 'poor', fx: { energy: -5 }, res: 'The fast swing bumped the container and sent it spinning away! In microgravity, hard bumps keep things moving. The crew recovered it later with a careful second try.' },
    ],
    learn: 'Robotic arms like Canadarm2 on the space station move cargo using slow, precise control.' },
  { id: 'power', at: 40, emoji: '🔋', title: 'ENERGY SHORTAGE', skill: 'engineering',
    story: 'Warning! A solar panel is partly in shadow and electrical energy is running low. You must decide which systems keep their power.',
    why: 'Electrical energy runs life support, navigation and communication. Fuel is different: it is only for the engine.',
    inspect: { title: '🔍 Energy consumption', rows: [['Life support', '30%', 'ok'], ['Navigation', '15%', 'ok'], ['Radio', '10%', 'ok'], ['Science lab', '20%', 'warn'], ['Cabin lights', '10%', 'warn'], ['Entertainment screen', '15%', 'bad']], note: 'Available energy is low: total demand is more than we can supply.' },
    options: [
      { t: 'Keep life support, navigation and the radio ON. Switch off the entertainment screen and extra lights, and pause the science lab.', q: 'best', fx: { energy: 12 }, res: 'Perfect priorities! Essential systems keep the crew alive and on course. Non-essential items can wait until the solar panels recover.' },
      { t: 'Switch off the radio and navigation to save energy for the science lab.', q: 'ok', fx: { energy: -6 }, res: 'The crew is safe, but now you cannot communicate or steer. Science can wait – safety and navigation come first.' },
      { t: 'Turn off life support to keep the lab running.', q: 'poor', fx: { energy: -8, oxygen: -8, health: -8 }, res: 'Oh no! Life support keeps the air fresh. The crew switched it back on quickly, but never turn it off to save energy for an experiment.' },
    ],
    learn: 'Engineers rank systems by importance: life support first, then communication and navigation.' },
  { id: 'damage', at: 50, emoji: '🔧', title: 'DAMAGED EQUIPMENT', skill: 'engineering',
    story: 'A warning light! Sensors say one component is not working properly. Find the damaged part and repair it.',
    why: 'A damaged component can affect other systems. Engineers find the fault first, then fix only that part.',
    inspect: { title: '🔍 Component readings', rows: [['Solar panels output', '22%', 'bad'], ['Communication antenna', '98%', 'ok'], ['Life-support system', '100%', 'ok'], ['Navigation system', '97%', 'ok']], note: 'Normal readings are above 90%.' },
    identify: { q: 'Which component is damaged?', options: [
      { t: 'Solar panels', ok: true, why: 'Correct! Their output is far below normal.' },
      { t: 'Communication antenna', ok: false, why: 'The antenna reads 98% – that is normal.' },
      { t: 'Life-support system', ok: false, why: 'Life support reads 100% – it is working perfectly.' },
      { t: 'Navigation system', ok: false, why: 'Navigation reads 97% – that is normal.' } ] },
    options: [
      { t: 'Isolate the damaged panel, run on batteries, then follow the repair checklist to replace the broken connector.', q: 'best', fx: { health: 6 }, res: 'Safe and systematic! You isolated the fault, protected the other systems and repaired the connector. Solar output is back to normal.' },
      { t: 'Ask Mission Control to repair it remotely and wait.', q: 'ok', fx: { energy: -5 }, res: 'Mission Control cannot touch your spacecraft! They sent a checklist, and the crew had to do the repair anyway – with less energy left.' },
      { t: 'Ignore it – the panel will fix itself.', q: 'poor', fx: { energy: -8, health: -8 }, res: 'Machines do not repair themselves! The problem got worse until the crew repaired it. Always respond to warnings.' },
    ],
    learn: 'Spacecraft carry spare parts and tools so that crews can repair equipment during the mission.' },
  { id: 'nav', at: 70, emoji: '🧭', title: 'NAVIGATION ERROR', skill: 'navigation',
    story: 'The star tracker shows we are slightly off course! Mars is not exactly where we are heading. How should we fix it?',
    why: 'A tiny error grows over millions of kilometres. We would miss Mars completely!',
    options: [
      { t: 'Measure our position with the star tracker, then fire a small correction burn.', q: 'best', fx: {}, res: 'A short, precise burn nudged the spacecraft back on course using very little fuel. Real missions do this – it is called a trajectory correction manoeuvre.' },
      { t: 'Ask Mission Control to calculate it and wait for their reply.', q: 'ok', fx: { energy: -3 }, res: 'The correction was right, but waiting for signals to travel back and forth cost time and energy.' },
      { t: 'Fire the main engine at full power in a random direction.', q: 'poor', fx: { fuel: -10 }, res: 'Random burns waste a lot of fuel and can push you further off course. The crew corrected it carefully afterwards. Always measure first!' },
    ],
    learn: 'Navigators measure their position first, then make small, careful corrections.' },
  { id: 'fuel', at: 80, emoji: '⛽', title: 'LOW FUEL', skill: 'physics',
    onStart: { fuel: -8 },
    story: 'The propellant gauge is lower than expected! Review the fuel log and decide how to manage the rest of the journey.',
    why: 'Propellant is only for the engine. If it runs out we cannot change direction or slow down at Mars. (Energy and water are different resources.)',
    inspect: { title: '🔍 Fuel consumption log', rows: [['Planned use per leg', '5 units', 'ok'], ['Actual use per leg', '6 units', 'warn'], ['Extra thruster firings', '3 unneeded', 'bad'], ['Fuel remaining', 'lower than planned', 'bad']], note: 'Hint: what costs the most fuel – and which burns are really necessary?' },
    options: [
      { t: 'Review the log, cancel unnecessary thruster firings and plan the remaining legs carefully.', q: 'best', fx: { fuel: 6 }, res: 'Smart mission management! Cutting unnecessary burns saved propellant. Every kilogram of fuel counts on a long trip.' },
      { t: 'Buy extra fuel with the team credits (💰 15).', q: 'ok', fx: { fuel: 20, credits: -15 }, res: 'That works – extra fuel was delivered. But planning better would have saved your credits.' },
      { t: 'Ignore it and hope there is enough.', q: 'poor', fx: { fuel: -5 }, res: 'Hoping is not a plan! Mission Control helped the crew recalculate. Always check fuel against what the journey still needs.' },
    ],
    learn: 'Engineers always compare the propellant they have with what the rest of the mission needs.' },
  { id: 'life', at: 90, emoji: '🌬️', title: 'LIFE-SUPPORT WARNING', skill: 'medicine',
    onStart: { oxygen: -10 },
    story: 'ALERT! A warning about cabin air. The crew feel sleepy and have headaches. Inspect the life-support system.',
    why: 'The crew need breathable air. Life-support systems keep oxygen at healthy levels and remove carbon dioxide.',
    inspect: { title: '🔍 Life-support readings', rows: [['Oxygen level', 'normal', 'ok'], ['Carbon dioxide (CO₂)', 'HIGH', 'bad'], ['Cabin temperature', 'comfortable', 'ok'], ['Cabin pressure', 'normal', 'ok']], note: 'One reading is outside the safe range.' },
    identify: { q: 'Which reading is the problem?', options: [
      { t: 'Carbon dioxide (CO₂) is too high', ok: true, why: 'Correct! Too much CO₂ causes headaches and sleepiness. The CO₂ scrubbers may be clogged.' },
      { t: 'The cabin temperature is too hot', ok: false, why: 'Temperature reads comfortable.' },
      { t: 'The cabin pressure is too low', ok: false, why: 'Pressure reads normal.' } ] },
    options: [
      { t: 'Swap the clogged CO₂ filter cartridge and check the air again.', q: 'best', fx: { oxygen: 12 }, res: 'The filters were clogged! Swapping the cartridge cleaned the air and everyone is feeling better.' },
      { t: 'Put on emergency masks and ask Mission Control for advice.', q: 'ok', fx: { oxygen: -2, health: -2 }, res: 'The crew is safe for now, but the root cause still needs fixing.' },
      { t: 'Open a window to let in fresh air.', q: 'poor', fx: { oxygen: -6, health: -6 }, res: 'There is no air outside! A spacecraft cannot open a window. The crew fixed the air system instead.' },
      { t: 'Ignore the alarm and keep working.', q: 'poor', fx: { oxygen: -5, health: -6 }, res: 'Alarms are there for a reason. Too much CO₂ is harmful. Always respond.' },
    ],
    learn: 'Life-support systems remove carbon dioxide and keep oxygen at healthy levels.' },
]
// Final procedure before arrival (Mars approach)
export const ORBIT = { id: 'calc', emoji: '⚛️', title: 'ORBIT INSERTION', skill: 'physics',
  story: 'Mars is getting close, but the spacecraft is moving very fast. To be captured into orbit around Mars, you must slow down. How should the engine fire?',
  why: 'If we do not slow down, we fly straight past Mars!',
  options: [
    { t: 'Turn the spacecraft around and fire the engine against the direction of travel.', q: 'best', fx: { fuel: -3 }, res: 'A "retro burn" pushes against your motion and slows you down – Newton’s third law at work! Mars’ gravity can now capture the spacecraft.' },
    { t: 'Do nothing and hope Mars’ gravity catches us.', q: 'ok', fx: { fuel: -6, energy: -3 }, res: 'Mars’ gravity helped a little, but we were too fast and needed an emergency burn using extra fuel.' },
    { t: 'Fire the engine forwards at full power.', q: 'poor', fx: { fuel: -10 }, res: 'Firing forwards speeds you up, making it even harder to be captured! The crew fixed it with a big correcting burn.' },
  ],
  learn: 'To slow down in space you push against your direction of travel.' }
export const ALL_CHALLENGES = [...CHALLENGES, ORBIT]

// ---------- Mission Control messages (scripted). `at` = journey % when delivered ----------
export const MC_SCRIPT = [
  { at: 10, text: 'Your spacecraft systems are operating normally.', actions: [{ label: 'Copy that, Mission Control', reply: 'Roger. Enjoy the view, crew!' }] },
  { at: 30, text: 'We have received your latest scientific data. Great work, crew!', actions: [{ label: 'Thank you!', reply: 'Keep the experiments coming.' }] },
  { at: 40, text: 'Please check your remaining energy supply.', actions: [{ label: 'Report energy level', reply: '@energy' }, { label: 'Not now', reply: 'Understood. Please check soon.' }] },
  { at: 60, text: 'Reminder: fuel, energy, oxygen and water are DIFFERENT resources. Watch all four on your dashboard.', actions: [{ label: 'Will do', reply: 'Thank you, commander.' }] },
  { at: 70, text: 'Please confirm that the water recycler and life-support system are running.', actions: [{ label: 'Confirmed – both running', reply: 'Excellent. Recycling water means carrying less weight!' }] },
]
export const MC_ALERT = (title) => `An unexpected technical issue has been detected: ${title.toLowerCase()}.`

// ---------- Crew dialogue (fictional gameplay chatter inspired by each specialization) ----------
export const CREW_TALK = {
  engineering: [
    { q: 'How do you fix things in space?', a: 'We find the faulty part first, follow a checklist, and use the right tool – and make sure no tiny screw floats away!' },
    { q: 'Why carry spare parts?', a: 'Nobody can bring a part from the shop on a trip to Mars, so we pack spares for the important systems.' } ],
  operations: [
    { q: 'What do you watch most closely?', a: 'The indicators. Fuel, energy, oxygen and communication – a good operator checks them regularly.' },
    { q: 'What if the radio fails?', a: 'We check the antenna, then switch to the backup link. Calm, step by step.' } ],
  biology: [
    { q: 'Why grow plants in space?', a: 'To learn how living things grow without normal gravity – and one day, to grow food on long journeys.' },
    { q: 'How do plants know which way is up?', a: 'On Earth, gravity tells roots to grow down. In microgravity, light and other signals matter more!' } ],
  physics: [
    { q: 'Why do we float?', a: 'We are falling around Earth together with the spacecraft, so nothing pushes on us. That is microgravity.' },
    { q: 'How do we slow down at Mars?', a: 'We fire the engine against our direction of travel. Push one way, slow down the other!' } ],
  medicine: [
    { q: 'How do you keep the crew healthy?', a: 'Exercise, good air, enough water and regular check-ups. In microgravity muscles and bones weaken without exercise.' },
    { q: 'Why does cabin air matter?', a: 'Too much carbon dioxide makes people sleepy and gives headaches. We watch it carefully.' } ],
  robotics: [
    { q: 'What can a robotic arm do?', a: 'Move cargo, help with repairs and catch visiting spacecraft – slowly and precisely.' },
    { q: 'Why slowly?', a: 'In microgravity a heavy object keeps moving once it starts. Gentle movements keep everything safe.' } ],
  research: [
    { q: 'How do you study Mars?', a: 'We collect evidence – rocks, dust and images – and ask what it tells us about the past.' },
    { q: 'What makes a good scientist?', a: 'Careful observations, honest notes, and never being afraid of a surprising result!' } ],
  navigation: [
    { q: 'How do we know where we are?', a: 'Star trackers measure the stars’ positions, and computers work out our position and direction.' },
    { q: 'Do we aim at Mars?', a: 'We aim at where Mars WILL BE when we arrive – it keeps moving around the Sun!' } ],
}
export const COMMANDER_TALK = [
  { q: 'Commander, how are we doing?', a: 'Great teamwork, everyone! Keep an eye on fuel, energy, oxygen and water – they are all different.' },
  { q: 'Are we really on our way to Mars?', a: 'We are! In this game the trip is shortened into stages – a real journey takes many months.' } ]

// ---------- Experiments ----------
export const GRAVITY_QUIZ = {
  q: 'You gave a floating object a gentle push. What happens next in microgravity?',
  options: [
    { t: 'It stops straight away', ok: false },
    { t: 'It keeps moving in a straight line until it bumps into something', ok: true },
    { t: 'It falls to the floor', ok: false },
  ],
  why: 'In microgravity there is almost no friction or downward pull. An object keeps moving at the same speed in the same direction until something stops it – that is Newton’s first law!',
}
export const MICRO_FACT = 'Objects appear to float because the spacecraft and everything inside it are continuously falling around Earth together. We call this microgravity.'
export const RESCUE_ITEMS = ['🍱', '🔬', '🔧', '📘', '🥤', '🧪']
export const SOLAR_FACT = 'Solar panels contain solar cells that convert sunlight into electrical energy. They work best when facing the Sun directly. Energy is NOT the same as fuel: fuel feeds the engine, energy runs the instruments.'
export const PLANET_TOPICS = [
  { id: 'atmo', emoji: '🌫️', name: 'Atmosphere', fact: 'Mars has a very thin atmosphere, mostly carbon dioxide. It is less than 1% as thick as Earth’s, so humans could not breathe it.' },
  { id: 'surface', emoji: '🏜️', name: 'Surface', fact: 'The surface is covered in rusty red-orange dust and rock. The colour comes from iron that has reacted with oxygen – rust!' },
  { id: 'temp', emoji: '🌡️', name: 'Temperature', fact: 'Mars is cold. The average is about −60 °C, and it can drop much lower at night or near the poles.' },
  { id: 'geo', emoji: '🌋', name: 'Geology', fact: 'Mars has the tallest known volcano (Olympus Mons) and a giant canyon system (Valles Marineris). Rocks show that water once flowed there.' },
]
export const PLANET_QUIZ = {
  q: 'Why would astronauts need a spacesuit and shelter on Mars?',
  options: [
    { t: 'The air is thin, mostly carbon dioxide, and it is very cold', ok: true },
    { t: 'Because Mars has too much oxygen', ok: false },
    { t: 'Because it rains all the time', ok: false },
  ],
  why: 'Right! Mars’ air is too thin and not breathable, and it is very cold – so people would need pressurised suits and habitats.',
}
export const RESEARCH = {
  title: 'PLANT GROWTH EXPERIMENT',
  intro: 'Scientists want to know how much light helps bean seeds sprout in space. Test each light setting and record the growth after 3 days.',
  levels: [
    { id: 'low', label: '💡 Low light', mm: 3, note: 'Slow growth' },
    { id: 'med', label: '🔆 Medium light', mm: 8, note: 'Best growth!' },
    { id: 'high', label: '☀️ Very bright', mm: 5, note: 'The seeds got stressed by too much light' },
  ],
  question: 'Look at your data table. Which light setting grew the plants the most?',
}
export const NAV_ACTIVITY = {
  q: 'NAVIGATION: Earth and Mars both orbit the Sun, and Mars keeps moving! Where should we aim the spacecraft?',
  options: [
    { t: 'Straight at where Mars is right now', ok: false, why: 'Mars will have moved on by the time we get there, and we would miss it!' },
    { t: 'At the spot where Mars WILL BE when we arrive', ok: true, why: 'Correct! Navigators aim for where the planet will be on arrival, like a footballer passing ahead of a running teammate.' },
    { t: 'Towards the Sun', ok: false, why: 'Heading straight into the Sun would take us away from Mars – and it gets very hot!' },
    { t: 'Back towards Earth', ok: false, why: 'That would take us home again. We want Mars!' },
  ],
}

// ---------- Life in space (short interactive topics) ----------
export const LIFE_TOPICS = [
  { id: 'eat', emoji: '🍱', title: 'Eating', q: 'Why do astronauts often use tortillas instead of sliced bread?', options: ['Crumbs would float around and could get into equipment', 'Tortillas are bigger', 'Bread is too heavy to carry'], answer: 0, fact: 'Astronauts eat packaged food and drink through straws from sealed pouches. Crumbs float, so flat breads work better.' },
  { id: 'sleep', emoji: '😴', title: 'Sleeping', q: 'Why do astronauts sleep in sleeping bags fixed to the wall?', options: ['So they do not float around and bump into things', 'To keep warm in the snow', 'Because there are no beds on Earth'], answer: 0, fact: 'In microgravity there is no "down", so astronauts tie themselves in. They can sleep in any direction!' },
  { id: 'exercise', emoji: '🏋️', title: 'Exercising', q: 'Why do astronauts exercise about two hours a day?', options: ['Muscles and bones get weaker without gravity', 'To win races', 'To make the station spin'], answer: 0, fact: 'They use treadmills and bikes with harnesses that hold them down, which keeps their bodies strong.' },
  { id: 'water', emoji: '💧', title: 'Using water', q: 'Where does much of the drinking water on the space station come from?', options: ['Recycled used water, cleaned by machines', 'Rain falling outside', 'A big lake nearby'], answer: 0, fact: 'Carrying water is heavy and costs fuel, so spacecraft clean and reuse water as much as possible.' },
  { id: 'hygiene', emoji: '🧼', title: 'Staying clean', q: 'Why can astronauts not take a normal shower?', options: ['Water would float in blobs everywhere', 'They do not like showers', 'Space is too cold'], answer: 0, fact: 'They wash with wet cloths and rinseless soap. Floating water could damage electronics!' },
  { id: 'support', emoji: '🫁', title: 'Life support', q: 'What does a life-support system do?', options: ['Keeps air breathable, removes CO₂ and controls temperature', 'Makes the engine go faster', 'Talks to Mission Control'], answer: 0, fact: 'There is no air outside, so the spacecraft must make cabin conditions suitable for people. Life support is essential!' },
]

// ---------- Mars arrival activities ----------
export const MARS_SPOTS = [
  { id: 'olympus', emoji: '🌋', x: 22, y: 40, name: 'Olympus Mons', fact: 'The tallest known volcano in the Solar System, about 22 km high.', clue: 'A huge volcano, about two and a half times taller than Mount Everest.', decoys: ['A giant canyon', 'A polar ice cap'] },
  { id: 'valles', emoji: '🏜️', x: 55, y: 62, name: 'Valles Marineris', fact: 'A giant canyon system about 4,000 km long – much longer than the Grand Canyon!', clue: 'A giant canyon system thousands of kilometres long.', decoys: ['A huge volcano', 'A dry lake'] },
  { id: 'ice', emoji: '🧊', x: 74, y: 20, name: 'North Polar Cap', fact: 'Mars has ice caps made of water ice and frozen carbon dioxide.', clue: 'A white area of frozen water and carbon dioxide near the pole.', decoys: ['A sandy desert', 'A crater lake'] },
]
export const SAMPLES = [
  { id: 'rock', emoji: '🪨', name: 'Rock sample', x: 20, y: 62, fact: 'Rocks can show how Mars formed. Some contain clay minerals that normally form in water.' },
  { id: 'soil', emoji: '🟤', name: 'Soil (regolith) sample', x: 52, y: 40, fact: 'Martian soil is fine red dust full of iron. Scientists test it for chemicals and for signs of past life.' },
  { id: 'ice', emoji: '🧊', name: 'Ice sample', x: 78, y: 70, fact: 'Ice near the poles and under the surface is a clue to where water is stored on Mars.' },
]
export const ROVER_GRID = { w: 6, h: 4, start: [0, 3], flags: [[2, 1], [5, 3], [4, 0]], rocks: [[1, 2], [3, 3], [2, 2], [4, 1]] }
export const MARS_DISCOVERY = {
  q: 'Your rover found rocks with smooth layers and clay minerals that normally form in water. What does that suggest about Mars long ago?',
  options: [
    { t: 'Liquid water once flowed on Mars', ok: true },
    { t: 'Mars was always completely frozen', ok: false },
    { t: 'The rocks fell from Earth', ok: false },
  ],
  why: 'Clay minerals and layered rocks form in water. Scientists think Mars once had rivers and lakes – which is why we search for signs of ancient life there!',
}


// answer positions spread evenly (see learn.js)
{
  const sp = makeSpreader(1)
  const okIdx = (o) => o.findIndex((x) => x.ok)
  ALL_CHALLENGES.forEach((c) => {
    c.options = sp.spread(c.options, c.options.findIndex((x) => x.q === 'best')).options
    if (c.identify) c.identify.options = sp.spread(c.identify.options, okIdx(c.identify.options)).options
  })
  LIFE_TOPICS.forEach((t) => { const r = sp.spread(t.options, t.answer); t.options = r.options; t.answer = r.index })
  GRAVITY_QUIZ.options = sp.spread(GRAVITY_QUIZ.options, okIdx(GRAVITY_QUIZ.options)).options
  PLANET_QUIZ.options = sp.spread(PLANET_QUIZ.options, okIdx(PLANET_QUIZ.options)).options
  MARS_DISCOVERY.options = sp.spread(MARS_DISCOVERY.options, okIdx(MARS_DISCOVERY.options)).options
}

