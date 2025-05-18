/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./apps/web/src/**/*.{js,ts,jsx,tsx}", // Include all relevant files
    ],
    theme: {
        extend: {
            colors: {
                gallery: "var(--gallery)", // Map CSS variable to Tailwind color
                "rangoon-green": "var(--rangoon-green)", // Map CSS variable to Tailwind color
                supernova: "var(--supernova)", // Map CSS variable to Tailwind color
                "yukon-gold": "var(--yukon-gold)", // Map CSS variable to Tailwind color
            },
        },
    },
    plugins: [],
};