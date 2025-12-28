/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-primary': 'var(--bg-primary)',
                'bg-secondary': 'var(--bg-secondary)',
                'bg-tertiary': 'var(--bg-tertiary)',
                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',
                'text-tertiary': 'var(--text-tertiary)',
                'accent-primary': 'var(--accent-primary)',
                'accent-hover': 'var(--accent-hover)',
                'accent-text': 'var(--accent-text)',
                'status-success': 'var(--status-success)',
                'status-warning': 'var(--status-warning)',
                'status-error': 'var(--status-error)',
            },
            borderRadius: {
                'sm': 'var(--radius-sm)',
                'md': 'var(--radius-md)',
                'lg': 'var(--radius-lg)',
                'full': 'var(--radius-full)',
            }
        },
    },
    plugins: [],
}
