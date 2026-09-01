# NordLingo

A translator for the Nordic languages, built with React and backed by the DeepL
API. Translate between Danish, English, German, Norwegian Bokmål, and Swedish.

The API key lives on a small Express backend rather than in the browser, so it
is never exposed to the client — the React app talks to the backend, and the
backend talks to DeepL.

Live demo: https://nord-lingo.vercel.app/

## Features

- **Five languages, any direction** — Danish, English, German, Norwegian
  Bokmål, and Swedish, selectable independently for source and target.
- **Translate on Enter** — press Enter to translate, Shift+Enter for a newline.
- **Loading state** — the button reports progress and disables itself while a
  request is in flight.
- **Clear error reporting** — an unreachable backend, a missing key, or a
  rejected language pair each surface their own message instead of failing
  silently.
- **Secure key handling** — the DeepL key stays server-side in `.env`, which is
  gitignored, and CORS is restricted to a single configurable origin.
- **Quota protection** — input is capped at 1,000 characters per request,
  enforced on the server so it holds even if the UI is bypassed.

## Tech stack

| Layer    | Tools                                 |
| -------- | ------------------------------------- |
| Frontend | React 18, Vite, Tailwind CSS          |
| Backend  | Node, Express 5, CORS                 |
| API      | DeepL (`deepl-node`)                  |

## Getting started

### Prerequisites

- Node 18 or newer
- A DeepL API key — the [free tier](https://www.deepl.com/pro-api) allows
  500,000 characters per month, which is plenty for local use

### Setup

```bash
git clone https://github.com/AimenSajid/NordLingo.git
cd NordLingo
npm install
```

Copy the example environment file and add your key:

```bash
cp .env.example .env
```

```
DEEPL_API_KEY=your-key-here
```

`PORT`, `VITE_API_URL`, and `ALLOWED_ORIGIN` are also configurable there, but
all three have sensible localhost defaults — the key is the only one you must
set, locally or in production.

### Running

The app needs both processes running, so use two terminals:

```bash
npm start     # Express backend on http://localhost:3001
```

```bash
npm run dev   # Vite dev server on http://localhost:5173
```

Open `http://localhost:5173`.

## Project structure

```
index.html           Page shell and React mount point
lib/
  translate.js       The DeepL call — shared by both entry points below
api/
  translate.js       Production entry point (Vercel Function at /api/translate)
server.js            Local dev entry point (Express on port 3001)
.env.example         Template for the environment variables
src/
  main.jsx           React entry point
  App.jsx            The whole UI — language pickers, input, output, state
  index.css          Tailwind directives and body styling
vite.config.js       Vite, React plugin, and the /api dev proxy
vercel.json          Deploy config — framework, build output, SPA rewrites
tailwind.config.js   Tailwind content paths
postcss.config.js    Tailwind and autoprefixer
```

## Deploying to Vercel

1. Push the branch and import the repository at
   [vercel.com/new](https://vercel.com/new). `vercel.json` pins the framework
   to Vite, so nothing needs configuring in the dashboard.
2. Under **Settings → Environment Variables**, add `DEEPL_API_KEY` with your
   key. This is the only variable production needs — the rest only affect local
   development.
3. Deploy.

The React app is served from the CDN and `api/translate.js` becomes a function
on the same origin, so there is no CORS configuration and no separate backend
service to keep awake.

## How it works

`App.jsx` holds the source language, target language, input text, output text,
and loading flag in React state. Translating POSTs to `/api/translate` — a
relative URL that resolves correctly in both environments — and writes the
response into a read-only textarea.

The translation itself lives in `lib/translate.js`, which validates the input,
calls DeepL, and returns a status and body rather than touching a response
object. Two thin entry points wrap it:

- **`server.js`** — an Express server for local development, on port 3001.
- **`api/translate.js`** — a Vercel Function, used in production.

Keeping the logic in one module means local and deployed behaviour cannot drift
apart. In development, Vite proxies `/api` to the Express server, so the
frontend calls the same relative URL either way.

### A note on language codes

DeepL is asymmetric about English, and the two dropdowns reflect that:

| Code    | As source | As target                                  |
| ------- | --------- | ------------------------------------------ |
| `EN`    | accepted  | rejected — "deprecated, use EN-GB or EN-US" |
| `EN-US` | rejected — "not supported" | accepted                  |

So the same language needs `EN` in the "From" list and `EN-US` in the "To"
list. Casing does not matter (`en-US` and `EN-US` both work), but the presence
or absence of the region does. The other four languages use the same code in
both directions.

`sourceLang` is optional — omit it and DeepL detects the language automatically.

## API

**`POST /api/translate`**

```json
{
  "text": "Hei, hvordan går det?",
  "sourceLang": "NB",
  "targetLang": "EN-US"
}
```

```json
{
  "translation": "Hi, how are you?"
}
```

`sourceLang` may be omitted for auto-detection. Errors return `{ "error": "..." }`
with status 400 for a bad request (missing text, text over 1,000 characters,
unsupported language code) or 500 for anything else.

### On quota

DeepL's free tier bills by **characters, not requests**, and stops serving at
500,000 per month rather than charging for overage. A request-rate limit alone
would not protect it — one oversized request could consume a fifth of the
monthly allowance — so `lib/translate.js` caps input length, and the textarea
mirrors that cap with a live counter. Pair it with a WAF rate limit rule in the
Vercel dashboard to bound request volume as well.

## Credits

Built as a solo project. Translations powered by the
[DeepL API](https://www.deepl.com/pro-api). All application code written by me.
