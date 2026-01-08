/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#09090b', // Zinc 950
                surface: '#18181b', // Zinc 900
                primary: '#3b82f6', // Blue 500
                secondary: '#8b5cf6', // Violet 500
                accent: '#f472b6', // Pink 400
            }
        },
    },
    plugins: [],
}
