/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/**/*.blade.php',
        './resources/**/*.tsx',
        './resources/**/*.ts',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Space Grotesk', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                stealth: {
                    950: '#050505',
                    900: '#0A0A0A',
                    800: '#0F0F0F',
                    700: '#1A1A1A',
                    border: 'rgba(255, 255, 255, 0.1)',
                    text: '#E5E5E5',
                    muted: 'rgba(255, 255, 255, 0.4)',
                },
            },
            backgroundImage: {
                'mist-gradient': 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 70%)',
            },
        },
    },
    plugins: [],
};
