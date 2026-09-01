import React, { useState } from "react"

// Same-origin in both dev and production: Vite proxies /api to the local
// Express server, and Vercel serves it as a function.
const API_URL = "/api/translate"

// Mirrors MAX_CHARS in lib/translate.js, which is the real enforcement point.
// Duplicated rather than imported: importing from lib/ would pull deepl-node
// into the browser bundle. The server rejects anything longer regardless.
const MAX_CHARS = 1000

// DeepL is asymmetric about English: sources take the plain code ("EN"), but a
// bare "EN" target is rejected as deprecated and needs a region ("EN-US").
// Passing "EN-US" as a source is rejected too, so the two lists differ on purpose.
const SOURCE_LANGS = [
  { code: "DA", short: "DA", label: "Danish" },
  { code: "EN", short: "EN", label: "English" },
  { code: "DE", short: "DE", label: "German" },
  { code: "NB", short: "NB", label: "Norwegian Bokmål" },
  { code: "SV", short: "SV", label: "Swedish" },
]

const TARGET_LANGS = [
  { code: "DA", short: "DA", label: "Danish" },
  { code: "EN-US", short: "EN", label: "English" },
  { code: "DE", short: "DE", label: "German" },
  { code: "NB", short: "NB", label: "Norwegian Bokmål" },
  { code: "SV", short: "SV", label: "Swedish" },
]

const diamondClip = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"

function Logo() {
  return (
    <div
      className="flex h-8 w-7 flex-none items-center justify-center bg-nordling-pink"
      style={{ clipPath: diamondClip }}
    >
      <div className="h-[15px] w-[13px] bg-nordling-header" style={{ clipPath: diamondClip }} />
    </div>
  )
}

export default function App() {
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [error, setError] = useState("")
  const [srcLang, setSrcLang] = useState("NB")
  const [targtLang, setTargtLang] = useState("EN-US")
  const [loading, setLoading] = useState(false)

  const handleTranslate = async () => {
    if (loading) return

    if (!inputText.trim()) {
      setError("Please enter some text to translate.")
      setOutputText("")
      return
    }

    setLoading(true)
    setError("")
    setOutputText("")

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: inputText,
          sourceLang: srcLang,
          targetLang: targtLang
        })
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data.error || `Translation failed (${response.status}).`)
        return
      }

      setOutputText(data.translation ?? "")
    } catch (err) {
      console.error(err)
      setError(
        "Could not reach the translation server. Make sure the backend is running."
      )
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleTranslate()
    }
  }

  const nearLimit = inputText.length >= MAX_CHARS * 0.9
  const countColor = nearLimit ? "text-nordling-pink" : "text-[#8FA09B]"

  return (
    <div className="min-h-screen">
      <header className="flex items-center gap-3.5 bg-nordling-header px-6 py-4 sm:px-10">
        <Logo />
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
          <span className="text-lg font-semibold tracking-tight text-nordling-headertext">
            NordLingo
          </span>
          <span className="text-[13px] text-nordling-headersub">
            Simple translations for Nordic languages.
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10 sm:py-12">
        <div className="mb-7 max-w-xl">
          <h1 className="mb-2.5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Translate naturally across the Nordic languages.
          </h1>
          <p className="text-nordling-muted">
            Danish, English, German, Norwegian Bokmål and Swedish — short
            messages, phrases or everyday text.
          </p>
        </div>

        <div className="rounded-2xl border border-nordling-border bg-nordling-card shadow-[0_14px_34px_-26px_rgba(18,49,40,0.5)]">
          {/* language pickers */}
          <div className="grid grid-cols-1 gap-4 border-b border-nordling-border bg-nordling-panel/[.34] p-4 sm:grid-cols-2 sm:p-5">
            <div>
              <label
                htmlFor="srcLang"
                className="mb-1.5 block font-mono text-[10px] uppercase tracking-[.12em] text-nordling-plum"
              >
                From
              </label>
              <select
                id="srcLang"
                value={srcLang}
                onChange={(e) => setSrcLang(e.target.value)}
                className="w-full cursor-pointer rounded-[10px] border border-nordling-border bg-nordling-card px-3.5 py-2.5 font-sans text-base font-medium text-nordling-ink focus:outline-none focus:ring-[3px] focus:ring-nordling-pink/40"
              >
                {SOURCE_LANGS.map(({ code, short, label }) => (
                  <option key={code} value={code}>{short} · {label}</option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="targtLang"
                className="mb-1.5 block font-mono text-[10px] uppercase tracking-[.12em] text-nordling-plum"
              >
                To
              </label>
              <select
                id="targtLang"
                value={targtLang}
                onChange={(e) => setTargtLang(e.target.value)}
                className="w-full cursor-pointer rounded-[10px] border border-nordling-border bg-nordling-card px-3.5 py-2.5 font-sans text-base font-medium text-nordling-ink focus:outline-none focus:ring-[3px] focus:ring-nordling-pink/40"
              >
                {TARGET_LANGS.map(({ code, short, label }) => (
                  <option key={code} value={code}>{short} · {label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* input / output panels */}
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="flex flex-col gap-3.5 border-b border-nordling-border p-5 sm:border-b-0 sm:border-r">
              <textarea
                aria-label="Text to translate"
                rows="6"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={onKeyDown}
                maxLength={MAX_CHARS}
                placeholder="Enter text to translate..."
                className="min-h-[160px] resize-none rounded-lg border-0 bg-transparent p-0.5 text-lg leading-relaxed text-nordling-ink focus:outline-none focus:ring-[3px] focus:ring-nordling-pink/30"
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => { setInputText(""); setError("") }}
                  className="-ml-2 rounded-lg px-2 py-1.5 text-sm text-[#6B807A] hover:bg-nordling-panel/40 hover:text-nordling-plum"
                >
                  Clear
                </button>
                <span className={`font-mono text-xs ${countColor}`}>
                  {inputText.length} / {MAX_CHARS}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3.5 bg-nordling-panel/[.28] p-5">
              <div className="min-h-[160px] flex-1">
                {outputText ? (
                  <p className="text-lg leading-relaxed text-nordling-ink">{outputText}</p>
                ) : (
                  <p className="text-lg leading-relaxed text-[#A9B5B1]">
                    Your translation will appear here.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* action bar */}
          <div className="flex flex-col items-stretch gap-4 border-t border-nordling-border bg-nordling-panel/[.34] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex min-h-[32px] items-center gap-3.5">
              {error ? (
                <div role="alert" className="flex items-center gap-2.5 rounded-[10px] border border-nordling-plum/30 bg-nordling-plum/10 px-3.5 py-2">
                  <span className="h-[7px] w-[7px] flex-none rounded-full bg-nordling-plum" />
                  <span className="text-sm text-nordling-muted">{error}</span>
                </div>
              ) : (
                <span className="font-mono text-xs text-[#8FA09B]">
                  Enter to translate · Shift + Enter for a new line
                </span>
              )}
            </div>
            <button
              onClick={handleTranslate}
              disabled={loading}
              className="flex items-center justify-center gap-2.5 rounded-[11px] bg-nordling-teal px-7 py-3.5 font-semibold text-[#FBF8F8] transition-colors hover:bg-nordling-header disabled:cursor-not-allowed disabled:bg-[#4E6A64] disabled:hover:bg-[#4E6A64]"
            >
              {loading && (
                <span className="h-[15px] w-[15px] animate-spin rounded-full border-2 border-[#FBF8F8]/35 border-t-[#FBF8F8]" />
              )}
              {loading ? "Translating…" : "Translate"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
