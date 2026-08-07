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
			/*
			 * The complete type scale. Pages use these, not ad-hoc clamp() values.
			 * Each step's desktop cap is the measured value from the design doc's
			 * token sheet — display 46 (landing hero), h1 40 (product-page hero),
			 * h2 30, h3 22, h4 17, body 15, small 13, overline 11. The clamps only
			 * scale *down* from those caps, so nothing renders larger than specified.
			 */
			fontSize: {
				display: ['clamp(2rem, 4vw, 2.875rem)', { lineHeight: '1.08', letterSpacing: '-0.03em' }],
				h1: ['clamp(1.75rem, 3.2vw, 2.5rem)', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
				h2: ['clamp(1.375rem, 2.2vw, 1.875rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
				h3: ['1.375rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
				h4: ['1.0625rem', { lineHeight: '1.3', letterSpacing: '-0.005em' }],
				lead: ['1.0625rem', { lineHeight: '1.6' }],
				body: ['0.9375rem', { lineHeight: '1.55' }],
				small: ['0.8125rem', { lineHeight: '1.5' }],
				overline: ['0.6875rem', { lineHeight: '1.1', letterSpacing: '0.08em' }],
			},
			colors: {
				ink: {
					DEFAULT: token('ink'),
					muted: token('ink-muted'),
					subtle: token('ink-subtle'),
					inverse: token('ink-inverse'),
				},
				canvas: token('canvas'),
				// Scrim behind modals. Ink in light, black in dark — always a
				// darkener, which `ink` would not be once the theme inverts.
				overlay: token('overlay'),
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
				danger: {
					DEFAULT: token('danger'),
					soft: token('danger-soft'),
					// Label colour for a *filled* danger control. Not always white:
					// dark mode's danger is a light red and needs a dark label.
					fg: token('danger-fg'),
				},

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
			/*
			 * Elevation, straight from the doc's e1–e4 ramp. Shadows are cast in
			 * --overlay (ink, not pure black) so they read as depth rather than dirt.
			 * e5 is ours: the one step big enough for the tilted 3D product planes
			 * in the landing hero, which the doc draws at 0 32px 64px / 16%.
			 */
			boxShadow: {
				e1: '0 1px 2px rgb(var(--overlay) / 0.06)',
				e2: '0 1px 2px rgb(var(--overlay) / 0.06), 0 2px 6px rgb(var(--overlay) / 0.06)',
				e3: '0 1px 2px rgb(var(--overlay) / 0.06), 0 4px 12px rgb(var(--overlay) / 0.08)',
				e4: '0 2px 4px rgb(var(--overlay) / 0.06), 0 12px 28px rgb(var(--overlay) / 0.12)',
				e5: '0 4px 8px rgb(var(--overlay) / 0.06), 0 32px 64px rgb(var(--overlay) / 0.16)',
				none: 'none',
			},
			keyframes: {
				// Skeleton sweep. Pairs with a 200%-wide background gradient.
				shimmer: {
					'0%': { backgroundPosition: '200% 0' },
					'100%': { backgroundPosition: '-200% 0' },
				},
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
				shimmer: 'shimmer 1.4s linear infinite',
				marquee: 'marquee 28s linear infinite',
				'marquee-reverse': 'marquee-reverse 28s linear infinite',
				'spin-slow': 'spin-slow 45s linear infinite',
				'spin-reverse': 'spin-reverse 45s linear infinite',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
}
