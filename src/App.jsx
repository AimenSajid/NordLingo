import React, { useState } from "react"

export default function App() {
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [srcLang, setSrcLang] = useState("NB"); 
  const [targtLang, setTargtLang] = useState("en-US"); 
  const [loading, setLoading] = useState(false)

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setOutputText("Please enter some text to translate.")
      return
    }

    setLoading(true)
    setOutputText("")

    try {
    console.log(srcLang, targtLang)
    const response = await fetch("http://localhost:3001/translate", {
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

    const data = await response.json()
    
    setOutputText(data.translation || "Translation failed.")
  } catch (error) {
    console.error(error)
    return "Error: Unable to translate text."
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
          <label className="block mb-1 font-medium">From</label>
          <select
            value={srcLang}
            onChange={(e) => setSrcLang(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-400"
          >
            <option value="DA">Danish</option>
            <option value="EN">English</option>
            <option value="DE">German</option>
            <option value="NB">Norwegian Bokmål</option>
            <option value="SV">Swedish</option>
            
          </select>
        </div>

        <div className="flex-1">
          <label className="block mb-1 font-medium">To</label>
          <select
            value={targtLang}
            onChange={(e) => setTargtLang(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-400"
          >
            <option value="DA">Danish</option>
            <option value="en-US">English</option>
            <option value="DE">German</option>
            <option value="NB">Norwegian Bokmål</option>
            <option value="SV">Swedish</option>
          </select>
        </div>
      </div>

      <textarea
        rows="5"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Enter text here..."
        className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
      ></textarea>

      <button
        onClick={handleTranslate}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
      >
        {loading ? "Translating..." : "Translate"}
      </button>

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
