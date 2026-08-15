import { translate } from "../lib/translate.js"

// Deployed by Vercel as a function at /api/translate.
export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed." }, { status: 405 })
    }

    let payload
    try {
      payload = await request.json()
    } catch {
      return Response.json({ error: "Invalid JSON body." }, { status: 400 })
    }

    const { status, body } = await translate(payload ?? {})
    return Response.json(body, { status })
  },
}
