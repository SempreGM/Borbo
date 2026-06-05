const tailwindConfig = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./sections/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        borbo: {
          50: "#fff1f4",
          100: "#f8d7dc",
          200: "#f2b1bb",
          300: "#ea8c9d",
          400: "#e9657f",
          500: "#e94e77",
          600: "#d23f6e",
          700: "#aa345f",
          800: "#81284d",
          900: "#5d1d38",
        },
        rose: {
          500: "#d68189",
        },
        sand: {
          50: "#f9f2e8",
          100: "#f4ead5",
        },
      },
      fontFamily: {
        sans: ["'Google Sans'", 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default tailwindConfig;
