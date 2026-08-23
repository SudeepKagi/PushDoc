/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-raised": "var(--surface-raised)",
        border: "var(--border)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
        },
        success: "var(--success)",
        danger: "var(--danger)",
        warning: "var(--warning)",

        // Standard shadcn semantic aliases mapped to exact spec tokens
        background: "var(--bg)",
        foreground: "var(--text-primary)",
        card: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text-primary)",
        },
        popover: {
          DEFAULT: "var(--surface-raised)",
          foreground: "var(--text-primary)",
        },
        primary: {
          DEFAULT: "var(--accent)",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "var(--surface-raised)",
          foreground: "var(--text-primary)",
        },
        muted: {
          DEFAULT: "var(--surface-raised)",
          foreground: "var(--text-secondary)",
        },
        destructive: {
          DEFAULT: "var(--danger)",
          foreground: "#FFFFFF",
        },
        input: "var(--border)",
        ring: "var(--accent)",
      },
      fontFamily: {
        sans: ["'IBM Plex Sans'", "system-ui", "-apple-system", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg: ["20px", { lineHeight: "28px" }],
        xl: ["28px", { lineHeight: "36px" }],
        "2xl": ["36px", { lineHeight: "44px" }],
      },
      spacing: {
        0: "0px",
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        6: "24px",
        8: "32px",
        12: "48px",
        16: "64px",
      },
      borderRadius: {
        none: "0px",
        sm: "4px",
        DEFAULT: "6px",
        md: "6px",
        lg: "6px",
        full: "9999px",
      },
      boxShadow: {
        DEFAULT: "var(--shadow)",
        sm: "var(--shadow)",
        md: "var(--shadow)",
        lg: "var(--shadow)",
        none: "none",
      },
    },
  },
  plugins: [],
};
