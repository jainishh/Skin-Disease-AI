/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--brand-primary)",
          "primary-hover": "var(--brand-primary-hover)",
          secondary: "var(--brand-secondary)",
          "secondary-hover": "var(--brand-secondary-hover)",
          bg: "var(--brand-bg)",
          surface: "var(--brand-surface)",
          "surface-hover": "var(--brand-surface-hover)",
          text: "var(--brand-text)",
          "text-muted": "var(--brand-text-muted)",
          border: "var(--brand-border)",
          success: "var(--brand-success)",
          warning: "var(--brand-warning)",
          error: "var(--brand-error)",
        },
        med: {
          blue: "#0077B6",
          blueDark: "#4DA8DA",
          teal: "#00B4A6",
          tealDark: "#3ED6C4",
          darkBg: "#0F1B24",
          darkCard: "#16232E",
          lightBg: "#FFFFFF",
          lightCard: "#F5F9FC",
          slate: "#1A2B3C",
          slateLight: "#EAF1F5",
          borderLight: "#E1E8ED",
          borderDark: "#243440",
        },
      },
      fontFamily: {
        display: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        body: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        skin: "1.25rem",
      },
      boxShadow: {
        med: "0 4px 20px -2px rgba(0, 119, 182, 0.08), 0 2px 6px -1px rgba(26, 43, 60, 0.04)",
        "med-lg": "0 12px 40px -4px rgba(0, 119, 182, 0.14)",
        "med-dark": "0 8px 32px -4px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
