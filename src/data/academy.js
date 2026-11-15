import { makeSpreader } from './learn.js'
// Science Academy: 5 categories, 40+ activities of different types.
export const CATEGORIES = [
  { id: 'space', name: 'SPACE SCIENCE', emoji: '🌌', color: '#7c5cff' },
  { id: 'physics', name: 'PHYSICS', emoji: '⚛️', color: '#35d0ff' },
  { id: 'planets', name: 'PLANETS & SOLAR SYSTEM', emoji: '🪐', color: '#ff9f43' },
  { id: 'eng', name: 'SPACECRAFT ENGINEERING', emoji: '🛠️', color: '#ff5ca8' },
  { id: 'astro', name: 'ASTRONAUT KNOWLEDGE', emoji: '🧑‍🚀', color: '#7cffb2' },
]
export const TIERS = {
  easy: { label: 'Level 1 · Discover', reward: 20, unlockLevel: 1 },
  inter: { label: 'Level 2 · Understand', reward: 35, unlockLevel: 2 },
  adv: { label: 'Level 3 · Investigate', reward: 50, unlockLevel: 3 },
}
export const HINT_COST = 10

const mcq = (id, cat, tier, q, options, answer, hints, explain, art) =>
  ({ id, cat, tier, type: 'mcq', q, options, answer, hints, explain, art })

export const ACTIVITIES = [
  // ------------- SPACE SCIENCE -------------
  mcq('ss1', 'space', 'easy', 'What force keeps planets in orbit around the Sun?', ['Magnetism', 'Gravity', 'Friction', 'Electricity'], 1,
    ['Think about the invisible force that attracts objects with mass.', 'It is the same force that makes an apple fall from a tree.'],
    "Gravity! The Sun's gravity constantly pulls on the planets, bending their paths into orbits.", '🪐'),
  mcq('ss2', 'space', 'easy', 'What do we call the curved path an object takes around a planet or star?', ['Trail', 'Orbit', 'Tunnel', 'Equator'], 1,
    ['Satellites and the Moon follow this kind of path.', 'It rhymes with "sport it"!'],
    'An orbit! Things in orbit are falling around a planet but moving sideways so fast that they keep missing it.', '🛰️'),
  mcq('ss3', 'space', 'easy', 'What is the Sun?', ['A planet', 'A moon', 'A star', 'A comet'], 2,
    ['It makes its own light and heat.', 'Planets and moons do not make their own light.'],
    'The Sun is a star – a giant ball of hot gas that makes its own light and heat.', '☀️'),
  mcq('ss4', 'space', 'inter', 'Why do we see different phases of the Moon?', ['Earth’s shadow covers it in different ways each night', 'We see different amounts of its sunlit side as it orbits Earth', 'The Moon switches its light on and off', 'Clouds cover parts of it'], 1,
    ['The Moon does not make its own light.', 'Half of the Moon is always lit by the Sun. What changes is our viewing angle.'],
    'The Moon orbits Earth, so we see more or less of its Sun-lit half as the month goes by.', '🌙'),
  mcq('ss5', 'space', 'inter', 'Why does the Sun shine?', ['It is burning like a giant campfire', 'It joins hydrogen atoms together in its core, releasing energy', 'It reflects light from other stars', 'It is full of electric lamps'], 1,
    ['Think about tiny atoms being squeezed together by huge pressure.', 'The process is called fusion.'],
    'In the Sun’s core, hydrogen atoms fuse into helium and release huge amounts of energy – this is nuclear fusion.', '☀️'),
  mcq('ss6', 'space', 'adv', 'Why can astronauts not hear sounds in the vacuum of space?', ['Space is too cold', 'There is no air for sound waves to travel through', 'Sound is too fast', 'Space is too bright'], 1,
    ['Sound is a vibration that has to travel through something.', 'On Earth, that "something" is the air around you.'],
    'Sound needs a medium such as air to travel through. Space is almost empty, so sound cannot travel across it. Radio waves can, because they are not sound.', '🔇'),
  mcq('ss7', 'space', 'adv', 'What is a light-year?', ['A year with extra sunlight', 'The distance light travels in one year', 'The time light takes to cross a room', 'A very light spacecraft'], 1,
    ['The name has "year" in it, but it measures something else.', 'Light travels about 300,000 km every single second.'],
    'A light-year is a distance: how far light travels in one year – about 9.5 trillion kilometres!', '💫'),

  // ------------- PHYSICS -------------
  mcq('ph1', 'physics', 'easy', 'What is the main purpose of a rocket engine?', ['To provide thrust', 'To produce oxygen', 'To communicate with Earth', 'To protect astronauts from radiation'], 0,
    ['It makes the spacecraft go forwards.', 'The push that moves a rocket is called…'],
    'A rocket engine provides thrust – a powerful push that moves the spacecraft.', '🔥'),
  mcq('ph2', 'physics', 'easy', 'You travel from Earth to the Moon. What happens to your mass and your weight?', ['Both stay the same', 'Mass stays the same, weight gets smaller', 'Mass gets bigger, weight gets smaller', 'Both get bigger'], 1,
    ['Mass is how much "stuff" you are made of.', 'The Moon has weaker gravity than Earth.'],
    'Your mass (the amount of matter in you) does not change. But the Moon’s gravity is weaker, so you weigh about six times less!', '⚖️'),
  { id: 'ph3', cat: 'physics', tier: 'inter', type: 'slider', kind: 'thrust',
    q: 'LIFT-OFF PUZZLE: A rocket weighs 60 units. Every engine gives 20 units of thrust. What is the SMALLEST number of engines that can lift it off the ground?',
    min: 1, max: 6, step: 1, init: 1, goal: [4, 4],
    hints: ['Thrust must be bigger than the weight to lift off – not just equal.', 'Try the slider and watch whether the rocket lifts.'],
    explain: '4 engines give 80 units of thrust, which beats the weight of 60 units. 3 engines (60) only balance the weight, so the rocket stays on the pad.' },
  mcq('ph4', 'physics', 'inter', 'Why do astronauts on the space station float?', ['There is no gravity at all up there', 'They are in constant free-fall around Earth', 'Space pushes them up', 'The station spins fast'], 1,
    ['Gravity on the station is still about 90% as strong as on Earth!', 'The station and everyone on it are falling together, while moving sideways very fast.'],
    'The station and astronauts are in free-fall around Earth. Since they all fall together, they feel weightless. This is called microgravity.', '🫧'),
  mcq('ph5', 'physics', 'adv', 'A rocket moves up because hot gas is pushed down. Which idea explains this?', ['Every action has an equal and opposite reaction', 'Heavy things fall faster', 'Light always travels straight', 'Hot air always rises'], 0,
    ['It is one of Newton’s three laws of motion.', 'Think about letting go of a balloon: the air rushes out one way, the balloon goes the other.'],
    'Newton’s third law: when the engine pushes gas downwards, the gas pushes the rocket upwards.', '🎈'),
  mcq('ph6', 'physics', 'adv', 'A rocket burns fuel and gets lighter, but the engine thrust stays the same. What happens to its acceleration?', ['It gets bigger', 'It gets smaller', 'It stays the same', 'It becomes zero'], 0,
    ['Push a light shopping trolley and a heavy one with the same force. Which speeds up faster?', 'Acceleration = force ÷ mass.'],
    'Same push on less mass means more acceleration. That is why rockets speed up faster as they use up fuel.', '🚀'),

  // ------------- PLANETS & SOLAR SYSTEM -------------
  mcq('pl1', 'planets', 'easy', 'Which planet is known as the Red Planet?', ['Venus', 'Jupiter', 'Mars', 'Saturn'], 2,
    ['It is our mission destination!', 'Its dusty surface contains a lot of rust.'],
    'Mars! Its surface dust is full of iron oxide (rust), which gives it a red-orange colour.', '🔴'),
  mcq('pl2', 'planets', 'easy', 'Which is the largest planet in our Solar System?', ['Earth', 'Saturn', 'Neptune', 'Jupiter'], 3,
    ['It is a gas giant with a famous Great Red Spot storm.', 'More than 1,000 Earths could fit inside it.'],
    'Jupiter is the biggest planet – more than 1,000 Earths would fit inside it!', '🟠'),
  { id: 'pl3', cat: 'planets', tier: 'easy', type: 'match',
    q: 'PLANET MATCH: Drag each planet name onto the clue that describes it.',
    pairs: [
      { label: '🔴 Mars', clue: 'Called the Red Planet because of rusty dust' },
      { label: '🪐 Saturn', clue: 'Famous for its beautiful rings' },
      { label: '🌍 Earth', clue: 'Our home, with liquid water on the surface' },
      { label: '🔥 Venus', clue: 'Hottest planet, wrapped in thick clouds' },
    ],
    hints: ['Start with the one you know best – where do you live?', 'All four giant planets have rings, but one planet’s rings are the brightest and most famous – you can see them with a small telescope.'],
    explain: 'Mars is rusty red, Saturn has bright rings, Earth has oceans of liquid water and Venus has a thick, hot atmosphere.' },
  mcq('pl4', 'planets', 'easy', 'Which planet is closest to the Sun?', ['Mercury', 'Earth', 'Mars', 'Neptune'], 0,
    ['It is also the smallest planet.', 'It is named after the fast-moving messenger of the Roman gods.'],
    'Mercury is the closest planet to the Sun, and the smallest.', '☿️'),
  mcq('pl5', 'planets', 'inter', 'About how long is one day on Mars?', ['6 hours', 'A little over 24 hours', '48 hours', '10 days'], 1,
    ['It is surprisingly similar to a day on Earth.', 'Martian days are called "sols".'],
    'A Martian day (a sol) lasts about 24 hours and 40 minutes – very close to an Earth day.', '🕒'),
  mcq('pl6', 'planets', 'inter', 'What is Olympus Mons on Mars?', ['A deep ocean', 'The tallest known volcano in the Solar System', 'A Martian city', 'A frozen moon'], 1,
    ['It is about two and a half times taller than Mount Everest.', 'The word "Mons" is Latin for mountain.'],
    'Olympus Mons is a giant volcano about 22 km high – roughly two and a half times taller than Mount Everest (8.8 km).', '🌋'),
  mcq('pl7', 'planets', 'adv', 'Why does Mars look red?', ['It is very hot', 'Its dust contains iron oxide (rust)', 'It reflects Earth’s oceans', 'It is covered in red plants'], 1,
    ['Think about what happens to iron left outside in water and air.', 'The colour comes from the chemical that makes a bike chain turn orange.'],
    'Mars’ soil is rich in iron that has reacted with oxygen, making iron oxide – rust – which colours the planet red.', '🔴'),

  // ------------- SPACECRAFT ENGINEERING -------------
  mcq('en1', 'eng', 'easy', 'Which component protects a spacecraft from extreme heat when re-entering an atmosphere?', ['Heat shield', 'Solar panel', 'Antenna', 'Fuel tank'], 0,
    ['The name tells you what it does: it is a shield against…', 'Meteors glow when they fall through the air for the same reason it is needed.'],
    'The heat shield (thermal protection system) soaks up and blocks heat caused by rushing through an atmosphere.', '🛡️'),
  { id: 'en2', cat: 'eng', tier: 'easy', type: 'match',
    q: 'COMPONENT PUZZLE: Drag each spacecraft part to the job it does.',
    pairs: [
      { label: '🔥 Engine', clue: 'Pushes the spacecraft forward (thrust)' },
      { label: '🛢️ Fuel tank', clue: 'Stores the propellant' },
      { label: '📡 Antenna', clue: 'Talks with Mission Control' },
      { label: '🔋 Power system', clue: 'Gives electricity to the computers and lights' },
    ],
    hints: ['"Antenna" sounds like something you see on a radio or TV.', 'Which part would you need if the lights went out?'],
    explain: 'Engine = thrust, tank = propellant storage, antenna = communication, power system = electricity.' },
  mcq('en3', 'eng', 'easy', 'What is propellant?', ['Material a rocket burns and expels to create thrust', 'A kind of space food', 'The paint on a rocket', 'A rocket’s radio signal'], 0,
    ['The word looks like "propel", which means to push forwards.', 'It is stored in the fuel tank.'],
    'Propellant is the material (fuel and oxidiser) that a rocket pushes out of its engine to create thrust.', '🛢️'),
  { id: 'en4', cat: 'eng', tier: 'inter', type: 'slider', kind: 'solar',
    q: 'SOLAR POWER: The Sun’s light is coming from the upper right. Turn the solar panel until it receives the MOST power (100%).',
    min: 0, max: 180, step: 1, init: 20, goal: [112, 128],
    hints: ['A solar panel collects the most light when it faces the Sun directly.', 'Watch the power meter – it should reach almost 100%.'],
    explain: 'Panels make the most electricity when sunlight hits them straight on. That is why spacecraft turn their solar panels towards the Sun!' },
  mcq('en5', 'eng', 'inter', 'Which spacecraft part is this?', ['Navigation system', 'Water recycler', 'Solar panels', 'Crew capsule'], 2,
    ['It looks like big wings.', 'It turns sunlight into electricity.'],
    'Those wings are solar panels, converting sunlight into electrical energy.', '☀️'),
  mcq('en6', 'eng', 'inter', 'Why do engineers try to keep a spacecraft as light as possible?', ['Light spacecraft look nicer', 'A heavier spacecraft needs more propellant to accelerate', 'Heavy spacecraft cannot have windows', 'Gravity does not affect light spacecraft'], 1,
    ['Think about pushing a heavy trolley vs. a light one.', 'More mass needs more force, and force costs fuel.'],
    'The heavier the spacecraft, the more propellant it needs to speed up. That extra fuel adds even more weight – a real engineering trade-off!', '⚖️'),
  mcq('en7', 'eng', 'adv', 'Why does a crew capsule need radiation shielding?', ['To make it look shiny', 'To block harmful particles from the Sun and deep space', 'To keep the engines cool', 'To help it float'], 1,
    ['Earth’s atmosphere and magnetic field protect us, but not in deep space.', 'Radiation is invisible but can harm living cells.'],
    'Out in space, there is no thick atmosphere to protect astronauts. Shielding helps block harmful radiation.', '☢️'),
  mcq('en8', 'eng', 'adv', 'A spacecraft travels far beyond Mars where sunlight is very weak. Which power source is MOST suitable?', ['Bigger and bigger batteries only', 'A nuclear power generator that works without sunlight', 'A wind turbine', 'A hand-crank generator'], 1,
    ['Solar panels need strong sunlight.', 'Deep-space probes like Voyager use a different kind of power source.'],
    'Far from the Sun, sunlight is too faint for solar panels. Deep-space probes use radioisotope power generators, which make electricity from the heat of decaying material.', '🔋'),

  // ------------- ASTRONAUT KNOWLEDGE -------------
  mcq('as1', 'astro', 'easy', 'Why do astronauts need oxygen systems inside their spacecraft?', ['To keep the spacecraft moving', 'To allow astronauts to breathe', 'To increase the spacecraft’s speed', 'To produce sunlight'], 1,
    ['There is no air in space.', 'It is the gas in the air we breathe in.'],
    'Oxygen lets astronauts breathe. Space has no air, so the spacecraft must make and carry its own.', '🫁'),
  mcq('as2', 'astro', 'easy', 'Who was the first human to walk on the Moon?', ['Buzz Aldrin', 'Neil Armstrong', 'Yuri Gagarin', 'Chris Hadfield'], 1,
    ['It happened in 1969 during the Apollo 11 mission.', 'He said "That’s one small step for man, one giant leap for mankind."'],
    'Neil Armstrong stepped onto the Moon on 20 July 1969 during Apollo 11.', '🌙'),
  mcq('as3', 'astro', 'easy', 'What is it called when an astronaut goes outside the spacecraft?', ['A spacewalk', 'A moonwalk', 'A star-jump', 'A splash-down'], 0,
    ['Astronauts wear a special suit and are tied to the spacecraft by a tether.', 'The word has "space" in it!'],
    'A spacewalk (or EVA – extravehicular activity). Astronauts use them to fix or build things outside the station.', '🧑‍🚀'),
  mcq('as4', 'astro', 'inter', 'Why do astronauts exercise for about two hours every day on the space station?', ['To win space races', 'Muscles and bones get weaker in microgravity', 'Because they are bored', 'To make the station spin'], 1,
    ['On Earth, gravity makes our bones and muscles work all day.', 'Without that daily workout, bodies weaken.'],
    'In microgravity, muscles and bones do less work and weaken. Daily exercise helps astronauts stay strong.', '🏋️'),
  mcq('as5', 'astro', 'inter', 'How do astronauts drink on the space station?', ['From open cups', 'From sealed pouches with straws', 'Rain falls in the cabin', 'They do not drink'], 1,
    ['Liquids float in microgravity.', 'Open cups would let drops drift into the air.'],
    'Water forms floating blobs in microgravity, so astronauts drink from sealed pouches with straws.', '🥤'),
  mcq('as6', 'astro', 'adv', 'Why do astronauts practise spacewalks in a giant swimming pool before flying?', ['Water makes them feel weightless like in space', 'To learn how to swim to Mars', 'To clean their suits', 'Because it is cheaper than a spacecraft'], 0,
    ['Think about how it feels when you float in water.', 'The pool is called the Neutral Buoyancy Laboratory.'],
    'Floating in water is a close match for weightlessness, so astronauts can practise tasks safely before flying.', '🏊'),
]
export const ACT_BY_ID = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a]))


// answer positions spread evenly (see learn.js)
{
  const sp = makeSpreader(1)
  ACTIVITIES.forEach((a) => { if (a.type === 'mcq') { const r = sp.spread(a.options, a.answer); a.options = r.options; a.answer = r.index } })
}


// ---- Level 3 · Investigate: after answering, players explain HOW they know (bonus thinking – no credits, no risk) ----
const R = (t, ok, why) => ({ t, ok, why })
export const REASONS = {
  ss6: [R('Sound is a vibration that needs something, like air, to travel through – and space is almost empty.', true, 'Yes – that is the evidence. No air means no vibrations can travel, so no sound.'), R('Space is dark, and dark places are quiet.', false, 'Darkness has nothing to do with sound. Think about what sound actually is.'), R('Astronaut helmets block all noise.', false, 'Helmets do not explain it – even with no helmet, sound could not cross empty space.')],
  ss7: [R('Distances in space are so huge that kilometres give enormous numbers, so a bigger unit is easier.', true, 'Exactly. Scientists choose a unit that fits the size of what they measure.'), R('Light is the slowest thing in space.', false, 'Light is the FASTEST thing there is – that is why it makes a good ruler.'), R('Years are shorter in space.', false, 'A year is the same length everywhere we measure it from Earth.')],
  ph5: [R('The engine pushes gas down, so the gas pushes back up on the rocket with an equal force.', true, 'Yes – equal and opposite forces. That is Newton’s third law.'), R('The rocket pushes against the ground.', false, 'Rockets also work in space, where there is no ground to push on.'), R('Hot gas is lighter than air, so it floats the rocket up.', false, 'Rockets work in empty space too, where there is no air to float in.')],
  ph6: [R('The same force pushing less mass gives a bigger acceleration (acceleration = force ÷ mass).', true, 'Yes – like pushing an empty trolley compared with a full one.'), R('Burning fuel makes the engine stronger.', false, 'The thrust stayed the same in the question – what changed was the mass.'), R('Lighter things always travel faster.', false, 'Speed and acceleration are different. Lighter things speed up faster with the same push.')],
  pl7: [R('Iron in the soil has reacted with oxygen, making rust (iron oxide), which is red-orange.', true, 'Yes – the same chemical change that turns an old bike chain orange.'), R('Mars is so close to the Sun that it glows red.', false, 'Mars does not glow – it reflects sunlight, and the dust is what makes it look red.'), R('Red plants cover the surface.', false, 'No plants are known on Mars. The colour comes from the dust.')],
  en7: [R('Deep space has no thick atmosphere or strong magnetic field to block radiation, so the shielding must do that job.', true, 'Yes – on Earth the air and magnetic field protect us, but not out in space.'), R('Radiation makes the capsule too hot to touch.', false, 'The real danger is to living cells, not to the temperature of the capsule.'), R('Shielding makes the spacecraft easier to see.', false, 'Shielding is about protecting the crew, not about being seen.')],
  en8: [R('Sunlight gets weaker the further you are from the Sun, so solar panels would make too little power.', true, 'Yes – at Mars sunlight is already only about 43% as strong as at Earth, and it keeps fading further out.'), R('Solar panels break in cold space.', false, 'Panels work fine in the cold – the problem is how much light reaches them.'), R('There is no Sun in deep space.', false, 'The Sun is still there – it is just much further away and fainter.')],
  as6: [R('Water holds your body up, so you feel almost weightless – even though gravity is still pulling.', true, 'Yes – buoyancy is a close match for floating in orbit, which is why it is good practice.'), R('There is no gravity underwater.', false, 'Gravity still pulls on you in water – the water pushes back up on you.'), R('The pool is cold, just like space.', false, 'Temperature is not the reason. Think about how it feels to float.')],
}
{
  const sp = makeSpreader(2)
  Object.keys(REASONS).forEach((id) => { REASONS[id] = sp.spread(REASONS[id], REASONS[id].findIndex((o) => o.ok)).options })
}
