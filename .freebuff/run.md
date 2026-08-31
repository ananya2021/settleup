# Split Pay Dev Server

## How to Reproduce Artifacts

1. Copy `.env.local` from the main checkout (this is a secrets file, never symlink):
   ```
   cp <main-checkout>/.env.local .env.local
   ```
2. Install dependencies:
   ```
   npm install
   ```

## How to Run the Server

```
npm run dev
```

Vite defaults to port 5173. If busy, Vite auto-picks the next free port.
