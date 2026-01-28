/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Forsati Brand Colors
        primary: {
          DEFAULT: "#0B74FF",
          50: "#E6F0FF",
          100: "#CCE1FF",
          200: "#99C3FF",
          300: "#66A5FF",
          400: "#3387FF",
          500: "#0B74FF",
          600: "#0060E6",
          700: "#004DB3",
          800: "#003A80",
          900: "#00264D",
        },
        secondary: {
          DEFAULT: "#06B6D4",
          50: "#E6FAFB",
          100: "#CCF4F7",
          200: "#99E9EF",
          300: "#66DEE7",
          400: "#33D3DF",
          500: "#06B6D4",
          600: "#059AAF",
          700: "#047D8A",
          800: "#036065",
          900: "#024340",
        },
        success: {
          DEFAULT: "#10B981",
          50: "#E6F9F3",
          500: "#10B981",
          600: "#059669",
        },
        danger: {
          DEFAULT: "#EF4444",
          50: "#FEE2E2",
          500: "#EF4444",
          600: "#DC2626",
        },
        warning: {
          DEFAULT: "#F59E0B",
          50: "#FFFBEB",
          500: "#F59E0B",
          600: "#D97706",
        },
        // Backgrounds
        background: "#F7FAFC",
        surface: "#FFFFFF",
        // Text
        foreground: "#0F172A",
        muted: {
          DEFAULT: "#64748B",
          foreground: "#94A3B8",
        },
        // Borders
        border: "#E2E8F0",
        input: "#E2E8F0",
        ring: "#0B74FF",
      },
      fontFamily: {
        sans: ["Inter", "Cairo", "sans-serif"],
        arabic: ["Cairo", "Noto Naskh Arabic", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
