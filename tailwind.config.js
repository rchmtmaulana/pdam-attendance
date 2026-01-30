/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#1e40af', // blue-800
                secondary: '#0ea5e9', // sky-500
                danger: '#dc2626', // red-600
                success: '#16a34a', // green-600
            }
        },
    },
    plugins: [],
}
