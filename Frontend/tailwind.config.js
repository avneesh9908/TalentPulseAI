/** @type {import('tailwindcss').Config} */

/** Every token is `rgb(var(--x) / <alpha-value>)` so `/50` opacity works. */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
	darkMode: ["class"],
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Inter Variable"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
				// Kept so existing `font-display` usages keep compiling; now the same face.
				display: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
			},
			// The complete type scale. Pages use these, not ad-hoc clamp() values.
			fontSize: {
				display: ['clamp(2.5rem, 5.5vw, 4rem)', { lineHeight: '1.04', letterSpacing: '-0.032em' }],
				h1: ['clamp(2rem, 3.6vw, 2.75rem)', { lineHeight: '1.1', letterSpacing: '-0.026em' }],
				h2: ['clamp(1.5rem, 2.4vw, 2rem)', { lineHeight: '1.18', letterSpacing: '-0.021em' }],
				h3: ['1.25rem', { lineHeight: '1.35', letterSpacing: '-0.014em' }],
				h4: ['1.0625rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
				lead: ['1.0625rem', { lineHeight: '1.65' }],
				body: ['0.9375rem', { lineHeight: '1.6' }],
				small: ['0.8125rem', { lineHeight: '1.5' }],
				overline: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.11em' }],
			},
			colors: {
				ink: {
					DEFAULT: token('ink'),
					muted: token('ink-muted'),
					subtle: token('ink-subtle'),
					inverse: token('ink-inverse'),
				},
				canvas: token('canvas'),
				surface: {
					DEFAULT: token('surface'),
					strong: token('surface-strong'),
				},
				border: {
					DEFAULT: token('border'),
					strong: token('border-strong'),
				},
				accent: {
					DEFAULT: token('accent'),
					hover: token('accent-hover'),
					text: token('accent-text'),
					soft: token('accent-soft'),
					fg: token('accent-fg'),
				},
				success: { DEFAULT: token('success'), soft: token('success-soft') },
				warning: { DEFAULT: token('warning'), soft: token('warning-soft') },
				danger: { DEFAULT: token('danger'), soft: token('danger-soft') },

				// shadcn primitives still resolve through these.
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))',
				},
			},
			// Four radii. 2xl/3xl collapse into the scale so stray usages stay in system.
			borderRadius: {
				sm: '0.375rem',
				md: '0.5rem',
				lg: '0.75rem',
				xl: '1rem',
				'2xl': '1rem',
				'3xl': '1.25rem',
			},
			// Layered micro-shadows — physical, not glowy.
			boxShadow: {
				e1: '0 0.5px 0.5px -0.25px rgb(var(--overlay) / 0.05), 0 1.5px 1.5px -0.75px rgb(var(--overlay) / 0.05), 0 3px 3px -1.5px rgb(var(--overlay) / 0.04)',
				e2: '0 0.5px 0.5px -0.3px rgb(var(--overlay) / 0.05), 0 2px 2px -0.9px rgb(var(--overlay) / 0.05), 0 5px 5px -1.8px rgb(var(--overlay) / 0.05), 0 10px 10px -3px rgb(var(--overlay) / 0.04)',
				e3: '0 1px 1px -0.4px rgb(var(--overlay) / 0.05), 0 3px 3px -1px rgb(var(--overlay) / 0.05), 0 8px 8px -2px rgb(var(--overlay) / 0.05), 0 18px 18px -4px rgb(var(--overlay) / 0.06)',
				e4: '0 2px 2px -0.6px rgb(var(--overlay) / 0.06), 0 6px 6px -1.4px rgb(var(--overlay) / 0.06), 0 16px 16px -3px rgb(var(--overlay) / 0.07), 0 34px 34px -6px rgb(var(--overlay) / 0.09)',
				none: 'none',
			},
			keyframes: {
				marquee: {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(-50%)' },
				},
				'marquee-reverse': {
					'0%': { transform: 'translateX(-50%)' },
					'100%': { transform: 'translateX(0)' },
				},
				'spin-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' },
				},
				'spin-reverse': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(-360deg)' },
				},
			},
			animation: {
				marquee: 'marquee 28s linear infinite',
				'marquee-reverse': 'marquee-reverse 28s linear infinite',
				'spin-slow': 'spin-slow 45s linear infinite',
				'spin-reverse': 'spin-reverse 45s linear infinite',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
}
