import express from "express"
import cors from "cors"
import deepl from "deepl-node"
import 'dotenv/config'


const app = express()
app.use(express.json())
app.use(cors())

const authKey = process.env.DEEPL_API_KEY
const translator = new deepl.Translator(authKey)

app.post("/translate", async (req, res) => {
  const { text, sourceLang, targetLang } = req.body
  console.log (sourceLang,targetLang)
  try {
    const result = await translator.translateText(text,  sourceLang, targetLang)
    res.json({ translation: result.text})
  } catch (err) {
    console.error("Translation error:", err)
    res.status(500).json({ error: err.message })
  }
})

app.listen(3001, () => console.log("Backend running on port 3001"))
