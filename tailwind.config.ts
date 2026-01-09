import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				/* Premier ATX Brand Colors */
				premier: {
					ink: 'hsl(var(--premier-ink))',
					'ink-soft': 'hsl(var(--premier-ink-soft))',
					mist: 'hsl(var(--premier-mist))',
					cloud: 'hsl(var(--premier-cloud))',
					accent: 'hsl(var(--premier-accent))',
					'accent-soft': 'hsl(var(--premier-accent-soft))',
					sage: 'hsl(var(--premier-sage))',
					'sage-soft': 'hsl(var(--premier-sage-soft))',
					sand: 'hsl(var(--premier-sand))',
					'sand-dark': 'hsl(var(--premier-sand-dark))',
				},
				/* shadcn/ui compatibility */
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				danger: {
					DEFAULT: 'hsl(var(--danger))',
					foreground: 'hsl(var(--danger-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			fontFamily: {
				'sans': ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
				'display': ['var(--font-dm-sans)', 'DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
				'body': ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
			},
			aspectRatio: {
				'3/2': '3 / 2',
				'4/3': '4 / 3',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'slide-in-right': {
					from: { transform: 'translateX(100%)' },
					to: { transform: 'translateX(0)' }
				},
				'slide-out-right': {
					from: { transform: 'translateX(0)' },
					to: { transform: 'translateX(100%)' }
				},
				'fade-in': {
					from: { opacity: '0', transform: 'translateY(10px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					from: { opacity: '0', transform: 'scale(0.95)' },
					to: { opacity: '1', transform: 'scale(1)' }
				},
				'glow-pulse': {
					'0%, 100%': { boxShadow: '0 0 20px hsl(var(--primary) / 0.3)' },
					'50%': { boxShadow: '0 0 40px hsl(var(--primary) / 0.6)' }
				},
				'slide-diagonal': {
					'0%': { transform: 'translate(-100px, 100vh) rotate(12deg)' },
					'100%': { transform: 'translate(100vw, -100px) rotate(12deg)' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(100vh)' },
					'100%': { transform: 'translateY(-100vh)' }
				},
				'slide-down': {
					'0%': { transform: 'translateY(-100vh)' },
					'100%': { transform: 'translateY(100vh)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-out-right': 'slide-out-right 0.3s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'slide-diagonal': 'slide-diagonal 20s linear infinite',
				'slide-up': 'slide-up 15s linear infinite',
				'slide-down': 'slide-down 18s linear infinite'
			},
			backgroundImage: {
				'gradient-warm': 'linear-gradient(135deg, hsl(var(--premier-sand)) 0%, hsl(var(--premier-mist)) 100%)',
				'gradient-accent': 'linear-gradient(135deg, hsl(var(--premier-accent)) 0%, hsl(var(--premier-accent-soft)) 100%)',
			},
			boxShadow: {
				'sm': 'var(--shadow-sm)',
				'md': 'var(--shadow-md)',
				'lg': 'var(--shadow-lg)',
				'xl': 'var(--shadow-xl)',
				'card': 'var(--shadow-md)',
				'card-hover': 'var(--shadow-lg)',
				'floating': 'var(--shadow-xl)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
