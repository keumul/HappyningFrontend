import type { Config } from 'tailwindcss'

export default {
  // purge: {
  //   enabled: true,
  //   content: [
  //     '*.html',
  //     './assets/js/main.js'
  //   ]
  // },
  content: [
    "./src/**/*.html", 
    "./src/**/*.ts",
  ],
  theme: {
    extend: {
        fontFamily: {
          sans: ['Poppins', 'sans-serif']
        }
    }
  },
  
  plugins: [],
} satisfies Config

