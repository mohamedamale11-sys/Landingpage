# MxCrypto (UI)

Clean MVP crypto news feed UI (mock content + optional RSS metadata).

## Run

```bash
npm install
npm run dev
```

## Live News (Optional)

The UI fetches `/api/news/latest` and `/api/news/item` during development via the Vite proxy.

Run the lightweight news proxy:

```bash
cd /Users/mohamedali/Documents/mx_smartmoney_backend
go run ./cmd/news_proxy
```

## Routes

- `/` latest feed
- `/article/:slug` article page
- `/exchanges` affiliate links
