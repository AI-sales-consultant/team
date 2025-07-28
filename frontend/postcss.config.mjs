/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // <--- 修改此行
    autoprefixer: {},
  },
}

export default config;
