/** @type {import('tailwindcss').Config} */

export default {
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
				// Stitch dashboard faces.
				'st-display': ['"Space Grotesk Variable"', '"Space Grotesk"', 'system-ui', 'sans-serif'],
				'st-body': ['"Geist Variable"', 'Geist', 'system-ui', 'sans-serif'],
				// Phosphor-terminal mono: every eyebrow, label, tag and meta line.
				'ph-mono': ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
			},
			colors: {
				ph: {
					bg: '#000000',
					surface: 'rgba(134,239,172,0.035)',
					'surface-2': 'rgba(134,239,172,0.055)',
					line: 'rgba(134,239,172,0.10)',
					'line-strong': 'rgba(134,239,172,0.18)',
					'line-bright': 'rgba(134,239,172,0.32)',
					ink: '#f5f1ea',
					'ink-muted': 'rgba(245,241,234,0.82)',
					'ink-soft': 'rgba(245,241,234,0.55)',
					green: '#00ff41',
					'green-soft': '#4ade80',
					'green-deep': '#15803d',
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
