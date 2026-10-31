import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",
        foreground: "#0F172A",
        vit: {
          blue: "#1E3A8A",      // VIT Navy
          accent: "#2563EB",    // Royal Blue
          indigo: "#4338CA",
          slate: "#334155",
        },
        pastel: {
          lavender: "#F3E8FF",  // soft purple/lavender
          "lavender-dark": "#7E22CE",
          blue: "#E0F2FE",      // soft sky blue
          "blue-dark": "#0369A1",
          pink: "#FCE7F3",      // soft rose pink
          "pink-dark": "#BE185D",
          green: "#DCFCE7",     // soft emerald green
          "green-dark": "#15803D",
          yellow: "#FEF9C3",    // soft warm yellow
          "yellow-dark": "#A16207",
          gray: "#F1F5F9",
          "gray-dark": "#475569",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 2px 10px rgba(0, 0, 0, 0.04), 0 10px 25px -5px rgba(0, 0, 0, 0.05)",
        "soft-lg": "0 10px 30px -5px rgba(0, 0, 0, 0.07), 0 4px 12px -2px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;

