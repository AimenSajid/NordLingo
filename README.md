# NordLingo

A translator for the Nordic languages, built with React and backed by the DeepL
API. Translate between Danish, English, German, Norwegian Bokmål, and Swedish.

The API key lives on a small Express backend rather than in the browser, so it
is never exposed to the client — the React app talks to the backend, and the
backend talks to DeepL.

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

`VITE_API_URL`, `ALLOWED_ORIGIN`, and `PORT` are also configurable there; all
three have sensible localhost defaults, so the key is the only one you must set.

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
server.js            Express backend — POST /translate, proxies to DeepL
.env.example         Template for the environment variables
src/
  main.jsx           React entry point
  App.jsx            The whole UI — language pickers, input, output, state
  index.css          Tailwind directives and body styling
vite.config.js       Vite + React plugin
tailwind.config.js   Tailwind content paths
postcss.config.js    Tailwind and autoprefixer
```

## How it works

`App.jsx` holds the source language, target language, input text, output text,
and loading flag in React state. Translating POSTs the text and both language
codes to the backend, then writes the response into a read-only textarea.

`server.js` exposes a single `POST /translate` route. It reads
`DEEPL_API_KEY` from the environment, hands the text and language codes to
`deepl-node`, and returns `{ translation }` — or a 500 with `{ error }` if
DeepL rejects the request.

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

**`POST /translate`**

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
with status 400 for a bad request (missing text, unsupported language code) or
500 for anything else.

## Credits

Built as a solo project. Translations powered by the
[DeepL API](https://www.deepl.com/pro-api). All application code written by me.
