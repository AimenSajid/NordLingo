/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Familjen Grotesk", "Helvetica", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      colors: {
        nordling: {
          bg: "#F2ECEE",
          header: "#123128",
          headertext: "#F4EDF0",
          headersub: "#A6BDB4",
          card: "#FCF9FA",
          panel: "#D9C6D0",
          teal: "#0A6165",
          plum: "#8B5B7A",
          pink: "#DE809D",
          ink: "#0E2A24",
          muted: "#6E4460",
          border: "rgba(18,49,40,.18)",
        },
      },
    },
  },
  plugins: [],
}
