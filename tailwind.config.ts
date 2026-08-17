import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blueprint: {
          bg: "#FFFFFF",
          panel: "#FFF7F7",
          panel2: "#FFECEC",
          grid: "#F1D6D6",
          line: "#C81E3A",
          accent: "#C81E3A",
          accentDeep: "#9E1730",
          amber: "#A8555A",
          green: "#7A1428",
          red: "#9E1730",
          text: "#1A1414",
          muted: "#7A6363",
          faint: "#B99B9B"
        }
      },
      fontFamily: {
        display: ['"Roboto"', "Segoe UI", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ['"Roboto"', "Segoe UI", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: [
          '"Roboto Mono"',
          '"JetBrains Mono"',
          '"SF Mono"',
          "Consolas",
          "ui-monospace",
          "monospace"
        ]
      },
      backgroundImage: {
        "blueprint-grid":
          "linear-gradient(#F1D6D6 1px, transparent 1px), linear-gradient(90deg, #F1D6D6 1px, transparent 1px)"
      },
      backgroundSize: {
        grid: "28px 28px"
      }
    }
  },
  plugins: []
};
export default config;
