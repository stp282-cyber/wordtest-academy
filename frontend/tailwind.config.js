/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Keep it clean for readability
                display: ['Outfit', 'sans-serif'], // Bold headings
                mono: ['JetBrains Mono', 'monospace'], // Tech/Raw feel
            },
            colors: {
                // Neo-brutalism Palette
                bg: '#f0f0f0', // Light grey background
                paper: '#ffffff',
                primary: '#3b82f6', // Bright Blue
                secondary: '#a855f7', // Purple
                accent: '#f43f5e', // Pink/Red
                success: '#22c55e', // Green
                warning: '#eab308', // Yellow
                dark: '#1e293b',
                black: '#000000',
            },
            boxShadow: {
                // Hard shadows (no blur)
                'neo': '4px 4px 0px 0px rgba(0,0,0,1)',
                'neo-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
                'neo-lg': '8px 8px 0px 0px rgba(0,0,0,1)',
                'neo-hover': '2px 2px 0px 0px rgba(0,0,0,1)', // For pressed state
            },
            borderWidth: {
                '3': '3px',
            },
            translate: {
                'box': '4px',
            }
        },
    },
    plugins: [],
}
