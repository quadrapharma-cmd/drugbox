import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      keyframes: {
        marquee: { from:{transform:'translateX(0)'}, to:{transform:'translateX(-50%)'} }
      },
      animation: {
        marquee: 'marquee 30s linear infinite'
      }
    },
  },
  plugins: [],
}
export default config
