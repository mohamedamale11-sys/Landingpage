# MxCrypto Web Chat (MVP)

Dark dashboard-style React app (Vite) focused on one thing: working AI chat.

## Run

```bash
cd /Users/mohamedali/Documents/mx_smartmoney_backend/web
npm install
npm run dev
```

## Backend requirement

The chat UI posts to `POST /api/ai/chat`.

In local dev, Vite proxies `/api/*` to `http://127.0.0.1:8000`, so start backend first:

```bash
cd /Users/mohamedali/Documents/mx_smartmoney_backend
go run ./cmd/server
```

## Notes

- This web app is now chat-first MVP (news views removed).
- Backend chat contract was not changed, so Flutter clients remain compatible.
