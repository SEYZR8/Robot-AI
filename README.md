# Robot AI — H-01

Futuristic 3D humanoid AI assistant for mobile and desktop browsers.

## What is included

- High-performance procedural humanoid 3D avatar with human-like proportions
- Head, eyes, blink, mouth/lip movement, shoulders, articulated arms, hands, legs and feet
- Idle, listening, thinking and speaking avatar states
- Drag-to-rotate and wheel/pinch-friendly camera controls
- High-FPS renderer with capped device pixel ratio
- Premium responsive HUD and chat interface
- Uzbek voice input where supported by the browser
- Female/male voice profiles using available system speech voices
- Local conversation memory in browser storage
- Server-side AI bridge using the OpenAI Responses API
- Local fallback mode when no API key is configured
- Health endpoint for deployment checks
- No API secret is stored in frontend code

## Run locally

Requirements: Node.js 18+.

```bash
npm start
```

Open `http://127.0.0.1:3000`.

## Enable the AI brain

Set the API key only in the server environment:

```bash
export OPENAI_API_KEY="your-key"
export OPENAI_MODEL="gpt-5.6"
npm start
```

Never put the real key into GitHub or browser JavaScript. `.env.example` documents the configuration shape.

## Architecture

- `app/index.html` — product shell and controls
- `app/styles.css` — responsive visual system
- `app/app.js` — 3D engine, avatar animation, voice, memory and chat client
- `server.js` — static server, `/api/chat` and `/api/health`
- `docs/` — architecture and product notes

## Next production layers

The project is structured so provider adapters, durable memory, authenticated users, vision input, realtime audio, tool execution, observability and a production-grade facial rig can be added without exposing secrets to the browser.
