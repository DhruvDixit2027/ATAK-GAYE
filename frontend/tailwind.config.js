/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#14181C",
        card: "#1F2530",
        "card-2": "#262D3A",
        line: "#333B49",
        accent: "#FF6A3D",
        "accent-2": "#FFC145",
        safe: "#2ECC71",
        danger: "#FF4757",
        text: "#F3EFE8",
        "text-dim": "#9AA4B2",
      },
      fontFamily: {
        display: ["Rajdhani", "sans-serif"],
        body: ["Inter", "sans-serif"],
        hindi: ["Noto Sans Devanagari", "Inter", "sans-serif"],
      },
      borderRadius: {
        card: "18px",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0, transform: "translateY(6px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        ring: {
          "0%": { transform: "scale(1)", opacity: 0.8 },
          "100%": { transform: "scale(1.6)", opacity: 0 },
        },
        aiPulse: {
          "0%": { boxShadow: "0 0 0 0 rgba(255,193,69,0.55)" },
          "70%": { boxShadow: "0 0 0 9px rgba(255,193,69,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(255,193,69,0)" },
        },
        candIn: {
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn .35s ease",
        ring: "ring 2.2s ease-out infinite",
        aiPulse: "aiPulse 1.4s infinite",
        candIn: "candIn .4s ease forwards",
      },
    },
  },
  plugins: [],
};