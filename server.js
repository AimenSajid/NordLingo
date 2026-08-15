// Local development server. In production the same logic runs as a Vercel
// Function (see api/translate.js) — both call into lib/translate.js.
import express from "express"
import cors from "cors"
import 'dotenv/config'
import { translate } from "./lib/translate.js"

if (!process.env.DEEPL_API_KEY) {
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

// Same path as the deployed function, so the frontend calls one URL everywhere.
app.post("/api/translate", async (req, res) => {
  const { status, body } = await translate(req.body ?? {})
  res.status(status).json(body)
})

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`))
