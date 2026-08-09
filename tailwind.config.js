/** @type {import('tailwindcss').Config} */
module.exports = {

  content: [
    "./*.html",
    "./projects/**/*.html",
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
