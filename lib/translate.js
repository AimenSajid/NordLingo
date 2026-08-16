import deepl from "deepl-node"

// Keep in sync with MAX_CHARS in src/App.jsx, which enforces the same cap in
// the UI so users see the limit rather than hitting an error.
export const MAX_CHARS = 1000

let translator

function getTranslator() {
  if (!translator) {
    const authKey = process.env.DEEPL_API_KEY
    if (!authKey) {
      throw new Error("DEEPL_API_KEY is not set.")
    }
    translator = new deepl.Translator(authKey)
  }
  return translator
}

/**
 * Shared translation logic, used by both the local Express server and the
 * Vercel Function so the two cannot drift apart.
 *
 * Returns { status, body } rather than touching a response object, so it stays
 * independent of which server is calling it.
 */
export async function translate({ text, sourceLang, targetLang }) {
  if (typeof text !== "string" || !text.trim()) {
    return { status: 400, body: { error: "A non-empty 'text' field is required." } }
  }
  // DeepL's quota is measured in characters, not requests, so capping length
  // per request is what actually protects it. Enforced here rather than in a
  // caller so both the Express server and the Vercel Function are covered.
  if (text.length > MAX_CHARS) {
    return {
      status: 400,
      body: { error: `Text is limited to ${MAX_CHARS} characters.` },
    }
  }
  if (typeof targetLang !== "string" || !targetLang) {
    return { status: 400, body: { error: "A 'targetLang' field is required." } }
  }

  try {
    const result = await getTranslator().translateText(
      text,
      sourceLang || null,
      targetLang
    )
    return { status: 200, body: { translation: result.text } }
  } catch (err) {
    console.error("Translation error:", err)
    // DeepL rejects bad language codes with a 4xx; don't report those as our fault.
    const status = err.message?.includes("Bad request") ? 400 : 500
    return { status, body: { error: err.message } }
  }
}
