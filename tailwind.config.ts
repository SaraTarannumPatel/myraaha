import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["Poppins", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      fontSize: {
        /* MyRaaha Design System Typography Scale */
        "hero": ["3.5rem", { lineHeight: "1.1", fontWeight: "700" }],
        "section-opener": ["2.75rem", { lineHeight: "1.15", fontWeight: "600" }],
        "reflective": ["2rem", { lineHeight: "1.3", fontWeight: "400" }],
        "h1": ["2.5rem", { lineHeight: "1.1", fontWeight: "700" }],
        "h2": ["2rem", { lineHeight: "1.15", fontWeight: "700" }],
        "h3": ["1.5rem", { lineHeight: "1.2", fontWeight: "600" }],
        "h4": ["1.25rem", { lineHeight: "1.3", fontWeight: "600" }],
        "body-primary": ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-long": ["1rem", { lineHeight: "1.8", fontWeight: "400" }],
        "body-secondary": ["0.9rem", { lineHeight: "1.6", fontWeight: "400" }],
        "prompt": ["1.1rem", { lineHeight: "1.5", fontWeight: "400" }],
        "guidance": ["0.95rem", { lineHeight: "1.6", fontWeight: "400" }],
        "micro-guidance": ["0.8rem", { lineHeight: "1.5", fontWeight: "400" }],
        "ui-button": ["1rem", { lineHeight: "1.2", fontWeight: "600" }],
        "ui-label": ["0.85rem", { lineHeight: "1.4", fontWeight: "500" }],
        "ui-nav": ["0.95rem", { lineHeight: "1.4", fontWeight: "500" }],
        "ui-helper": ["0.8rem", { lineHeight: "1.5", fontWeight: "400" }],
        "ui-meta": ["0.75rem", { lineHeight: "1.4", fontWeight: "600" }],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: {
          DEFAULT: "hsl(var(--background))",
          alt: "hsl(var(--background-alt))",
        },
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },

        /* Extended brand palette */
        green: {
          DEFAULT: "hsl(var(--primary))",
          secondary: "hsl(var(--green-secondary))",
          wash: "hsl(var(--green-wash))",
        },
        blue: {
          DEFAULT: "hsl(var(--blue-primary))",
          secondary: "hsl(var(--blue-secondary))",
          light: "hsl(var(--blue-light))",
        },
        yellow: {
          DEFAULT: "hsl(var(--accent))",
          highlight: "hsl(var(--yellow-highlight))",
          icon: "hsl(var(--yellow-icon))",
        },
        indigo: {
          DEFAULT: "hsl(var(--indigo-deep))",
          analytical: "hsl(var(--indigo-analytical))",
        },
        terracotta: {
          DEFAULT: "hsl(var(--terracotta))",
          light: "hsl(var(--terracotta-light))",
        },
        maroon: {
          DEFAULT: "hsl(var(--maroon))",
          light: "hsl(var(--maroon-light))",
        },

        /* Semantic status colors */
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        ai: {
          DEFAULT: "hsl(var(--ai))",
          foreground: "hsl(var(--ai-foreground))",
        },
        milestone: {
          DEFAULT: "hsl(var(--milestone))",
          foreground: "hsl(var(--milestone-foreground))",
        },
        warmth: {
          DEFAULT: "hsl(var(--warmth))",
          foreground: "hsl(var(--warmth-foreground))",
        },

        /* Grey scale for structure */
        grey: {
          divider: "hsl(var(--grey-divider))",
          disabled: "hsl(var(--grey-disabled))",
          meta: "hsl(var(--grey-meta))",
          label: "hsl(var(--grey-label))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
