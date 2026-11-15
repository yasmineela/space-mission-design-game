# Space Buddy – Become an Astronaut!

Interactive educational space-mission game for ages 9–13. One mission: **Earth → Mars**.
Built with React + Vite (JavaScript) and plain CSS. Progress is saved in `localStorage`.

## Run it

```bash
brew install node      # only if Node.js is not installed yet
npm install
npm run dev            # open http://localhost:5173
npm run build          # production build into dist/
```

## Game loop

Adopt a spacecraft core → earn credits in the **Science Academy** (41 activities, hints cost 10 credits) →
follow the **Instruction Book** (Level 1 names parts, Level 2 describes functions, Level 3 gives mission scenarios) →
buy parts in the **Workshop** → final assembly → recruit **3 real astronauts** → 4 training activities →
pre-flight check (fuel, energy, health) → launch → interior activities and 4 random-style challenges → Mars → report.

## Structure

- `src/state/game.js` – central state, reducer (all money/progress rules) and derived selectors
- `src/data/` – component catalogue, instruction books, academy questions, astronauts, mission content, companion messages
- `src/components/` – Spacecraft (SVG, 7 expressions, parts grow from the core), Astronaut, Timeline, Companion, activities
- `src/screens/` – one file per screen

## Simulated vs. real

- **Team mode is simulated.** Invite codes, shared bank/spacecraft, activity feed and launch confirmation work, but
  teammates are scripted characters on the same device. `CREATE_TEAM`/`JOIN_TEAM`/`ADD_SIM_MEMBER`/`TEAM_HELP`
  in `game.js` are the seam to replace with Firebase/WebSocket sync.
- Astronaut pictures are illustrations (initials in a helmet), not photographs. Their biographies are real; the
  game bonuses are fictional and labelled as such.
- Physics is deliberately simplified (weight → fuel needed = weight ÷ 160).

## Astronaut Recruitment Centre & Training Academy

- `src/data/crew.js` – 11 real astronauts, 8 specializations (with simple explanations and *fictional* gameplay bonuses), training modules.
- Crew screen: crew-requirements panel, filter by specialization, side-by-side comparison, command + 3 seats, change crew until launch.
- Training screen: 4 sequential modules (operations, microgravity, emergency, scientific), XP, ranks and the Certified Mission Commander badge. All four are required before launch.
- Crew bonuses (rule out one wrong option, +20% score) apply to six mission challenges and the lab activities; no bonus guarantees success.
- Note: no human has travelled to Mars – the game says so wherever astronauts are shown.

## Team Mission (simulated multiplayer)

- `src/state/teamService.js` documents the seam for real multiplayer: one shared `state.team` document, an event feed and a revision counter (`team.rev`).
- Team Hub: lobby & invitation code, contribution board (no ranking), collaborative science challenges (shared tips, one reward per activity), team decisions (vote on which part to buy first – reorders the instruction book/workshop), shared crew review, Team Launch Confirmation with simulated teammates.
- **Simulated:** teammates are scripted characters stored in this browser. No network, accounts or real players.

## Mars Mission Simulator

Mission Control checklist (from real game state) → launch cinematic (skippable) → clickable cabin (cockpit, lab, comm screen, storage, windows, crew, companion) → 8-stage mission timeline with a persistent dashboard (fuel, energy, oxygen, water, health, comms, progress) → 3 experiments (microgravity, solar energy, observing Mars; science XP once, no credits) → 7 journey challenges + orbit insertion (inspect → identify → act; mistakes never end the mission; crew bonuses are fictional) → Mars arrival with 3 surface activities → report.
Scripted for the prototype: Mission Control messages, crew dialogue, team votes. The journey is shortened into stages; resource values are simplified game numbers.

## Mars exploration & final report

- Rover exploration (6 map locations, battery/distance/samples/photos, scan, photograph, collect, return-to-recharge) with three activities: terrain, simulated samples, signs of water. Space Buddy gives free hints and facts.
- Fair 5-category score (knowledge, design, resources, problem-solving, exploration); retries still earn points. Badges pay credits once, ever (`state.claimed`).
- Report is generated from real state (`mission.result`, saved), with team section, journey review and replay (same ship, or redesign with refund). Replays keep earned badges so credits cannot be farmed.
