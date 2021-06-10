const brandColor = {
  "orange": { brand: "#F7941D", dark: '#D37F1A', light: '#F7A13A'},
  "black": { brand: "#F7941D", dark: '#D37F1A', light: '#F7A13A'},
  "red": { brand: "#DF4D44", dark: '#CC4840', light: '#F35A51'},
}


const primaryColors = {
  'primary': brandColor[process.env.VUE_APP_BRANDING || 'orange'].brand,
  'primary-dark': brandColor[process.env.VUE_APP_BRANDING || 'orange'].dark,
  'primary-light': brandColor[process.env.VUE_APP_BRANDING || 'orange'].light,
}

module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    textColor: theme => ({
      ...theme('colors'),
      ...primaryColors,
    }),
    backgroundColor: theme => ({
      ...theme('colors'),
      ...primaryColors,
    }),
    borderColor: theme => ({
      ...theme('colors'),
      ...primaryColors,
    }),
    ringColor: theme => ({
      ...theme('colors'),
      ...primaryColors,
    }),
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
      require('@tailwindcss/forms'),
  ],
}
