import express from "express"
import cors from "cors"
import deepl from "deepl-node"
import 'dotenv/config'

const authKey = process.env.DEEPL_API_KEY
if (!authKey) {
  console.error(
    "Missing DEEPL_API_KEY. Copy .env.example to .env and add your DeepL API key."
  )
  process.exit(1)
}

const PORT = process.env.PORT || 3001
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:5173"

const app = express()
app.use(express.json({ limit: "100kb" }))
app.use(cors({ origin: ALLOWED_ORIGIN }))

const translator = new deepl.Translator(authKey)

app.post("/translate", async (req, res) => {
  const { text, sourceLang, targetLang } = req.body ?? {}

  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "A non-empty 'text' field is required." })
  }
  if (typeof targetLang !== "string" || !targetLang) {
    return res.status(400).json({ error: "A 'targetLang' field is required." })
  }

  try {
    const result = await translator.translateText(text, sourceLang || null, targetLang)
    res.json({ translation: result.text })
  } catch (err) {
    console.error("Translation error:", err)
    // DeepL rejects bad language codes with a 4xx; don't report those as our fault.
    const status = err instanceof deepl.DeepLError && err.message.includes("Bad request")
      ? 400
      : 500
    res.status(status).json({ error: err.message })
  }
})

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`))
