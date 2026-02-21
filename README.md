# MxCrypto Chat Web (MVP)

React + Vite chat-only web app.

## What this app includes

- Smart Money AI chat
- Streaming responses (SSE)
- Follow-up context with `previous_response_id`
- History forwarding (same shape as Flutter)
- Somali/English language auto-detection (same logic style as Flutter)
- Window selector (6h / 24h / 72h)

## What this app does NOT include

- Auth
- Trade/portfolio execution features
- Fake modules

## Run

```bash
cd /Users/mohamedali/Documents/mxcrypto-chat-web
npm install
npm run dev
```

Open: `http://localhost:5173`

## Backend target

By default, the app calls `/api/ai/chat` (use Vite proxy in `vite.config.ts`).

If you want to call live backend directly, set env:

```bash
VITE_API_BASE=https://mxcrypto-backend-1.onrender.com npm run dev
```
