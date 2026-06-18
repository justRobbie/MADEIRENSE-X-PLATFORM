/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "danger": "#ff0000",
                "neutral": "#b9804a",
                "primary": "#ffd700",
                "secondary": "#002f6c",
                "success": "#389b50",
                "warning": "#f0b639"
            }
        }
    },
    plugins: [],
}