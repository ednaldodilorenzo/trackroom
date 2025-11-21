/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      colors: {
        // Material Design palette
        primary: "#6200ee",
        "on-primary": "#ffffff",

        secondary: "#018786",
        "on-secondary": "#ffffff",

        surface: "#f5f5f5",
        "on-surface": "#333333",

        border: "#ccc",

        success: "#2e7d32",
        "on-success": "#ffffff",

        danger: "#c62828",
        "on-danger": "#ffffff",

        warning: "#f9a825",
        "on-warning": "#000000",

        // Music App additions
        track: {
          DEFAULT: "#3b3939",
          hover: "#4e4c4c",
          active: "#a66646",
        },

        dark: {
          100: "#4c4848",
          200: "#2e2d2d",
          300: "#1e1e1e",
        },
      },

      fontFamily: {
        sans: ["Roboto", "sans-serif"], // Material Design
      },

      borderRadius: {
        md: "6px", // Material token
        card: "12px",
        button: "8px",
        pill: "9999px",
      },

      boxShadow: {
        // Music App + Material elevation system
        low: "0 1px 3px rgba(0,0,0,0.12)",
        medium: "0 3px 6px rgba(0,0,0,0.16)",
        high: "0 6px 20px rgba(0,0,0,0.19)",
      },

      spacing: {
        // Useful for album art & controls
        album: "120px",
        "track-thumbnail": "64px",
      },

      transitionDuration: {
        fast: "150ms",
        normal: "250ms",
        slow: "400ms",
      },
    },
  },

  plugins: [],
};
