/** @type {import('tailwindcss').Config} */
module.exports = {

  content: [
    "./index.html",             
    "./{id,en,jp,cn}/**/*.html", 
    "./assets/js/**/*.tsx",     
    "./assets/js/**/*.js",     
  ],
  darkMode: 'class', 
  theme: {
    extend: {
     
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}