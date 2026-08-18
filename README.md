# UZB ROLE

Mobile-first 3D open-world RP prototype for the Android browser.

## Current build
- Custom WebGL renderer; no external CDN dependency.
- Mobile joystick + action controls.
- Procedural city blocks, roads and central boulevard.
- Player movement, sprint and vehicle enter/exit state.
- Money, health, wanted level and in-game clock HUD.
- Mission progression and local NPC-style AI dialogue.
- PWA manifest and fullscreen mobile presentation.

## Direction
The project is intentionally built in layers: renderer -> world -> player/vehicle -> RP systems -> multiplayer/backend -> assets/audio -> Android packaging.

The next production layers should add authoritative multiplayer, persistent accounts, inventory, jobs, police/EMS, vehicle ownership, buildings/interiors, NPC schedules, quests, voice/chat, anti-cheat and optimized 3D assets.
