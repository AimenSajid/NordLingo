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
  { code: "DA", label: "Danish" },
  { code: "EN", label: "English" },
  { code: "DE", label: "German" },
  { code: "NB", label: "Norwegian Bokmål" },
  { code: "SV", label: "Swedish" },
]

const TARGET_LANGS = [
  { code: "DA", label: "Danish" },
  { code: "EN-US", label: "English" },
  { code: "DE", label: "German" },
  { code: "NB", label: "Norwegian Bokmål" },
  { code: "SV", label: "Swedish" },
]

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

  return (
    <div className="w-full max-w-lg mx-auto bg-white shadow-md rounded-2xl p-6 text-center">
      <h1 className="text-2xl font-semibold mb-4">
        NordLingo
      </h1>

      <div className="mb-4 flex gap-4">
        <div className="flex-1">
          <label htmlFor="srcLang" className="block mb-1 font-medium">From</label>
          <select
            id="srcLang"
            value={srcLang}
            onChange={(e) => setSrcLang(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-400"
          >
            {SOURCE_LANGS.map(({ code, label }) => (
              <option key={code} value={code}>{label}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="targtLang" className="block mb-1 font-medium">To</label>
          <select
            id="targtLang"
            value={targtLang}
            onChange={(e) => setTargtLang(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-400"
          >
            {TARGET_LANGS.map(({ code, label }) => (
              <option key={code} value={code}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <textarea
        rows="5"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={onKeyDown}
        maxLength={MAX_CHARS}
        placeholder="Enter text here..."
        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
      ></textarea>

      <p
        className={`mb-4 text-right text-xs ${
          inputText.length >= MAX_CHARS ? "text-red-600" : "text-gray-500"
        }`}
      >
        {inputText.length} / {MAX_CHARS}
      </p>

      <button
        onClick={handleTranslate}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
      >
        {loading ? "Translating..." : "Translate"}
      </button>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600 text-left">
          {error}
        </p>
      )}

      <textarea
        rows="5"
        value={outputText}
        readOnly
        placeholder="Translation result will appear here..."
        className="w-full border border-gray-300 rounded-lg p-3 mt-4 bg-gray-50 text-gray-700"
      ></textarea>
    </div>
  );
}
