import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        "primary-dark": "var(--primary-dark)",
        card: "var(--card)",
        "card-hover": "var(--card-hover)",
        border: "var(--border)",
        "border-hover": "var(--border-hover)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        '3d-soft': '0 20px 40px -10px var(--shadow-color), 0 0 0 1px var(--glass-edge) inset',
        '3d-heavy': '0 30px 60px -15px var(--shadow-color), 0 0 20px rgba(0,0,0,0.5), 0 0 0 1px var(--glass-edge) inset',
        '3d-pressed': '0 5px 10px -5px var(--shadow-color), 0 0 0 1px var(--glass-edge) inset',
        'inner-glow': 'inset 0 0 20px rgba(255,255,255,0.05)',
      },
      backgroundImage: {
        'premium-gradient': 'var(--premium-gradient)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
