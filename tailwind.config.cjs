/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        text: "#1f1a16",
        muted: "#6b5f56",
        ink: "#1d1410",
        cream: "#f8efe6",
        creamLight: "#fff6ec",
        creamDark: "#f2e1d1",
        warm: "#ed6f42",
        warmLight: "#f6b07a",
      },
      fontFamily: {
        sans: ["Sora", "system-ui", "sans-serif"],
        display: ["Fraunces", "Sora", "serif"],
      },
      boxShadow: {
        soft: "0 24px 50px rgba(27, 20, 14, 0.12)",
        glow: "0 12px 28px rgba(237, 111, 66, 0.35)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        rise: "rise 0.6s ease forwards",
      },
    },
  },
  plugins: [],
};
