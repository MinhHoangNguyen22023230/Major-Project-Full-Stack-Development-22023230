const config = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}'
    ],
    theme: {
        extend: {
            colors: {
                gallery: 'var(--gallery)',
                'rangoon-green': 'var(--rangoon-green)',
                supernova: 'var(--supernova)',
                'yukon-gold': 'var(--yukon-gold)'
            }
        },
    },
    plugins: []
};

export default config;