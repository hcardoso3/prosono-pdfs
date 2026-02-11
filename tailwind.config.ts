import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        laranja: "#f1af1b",
        azul: "#7f9dc1",
      },
      fontFamily: {
        "marker-felt": ["var(--font-marker-felt)", "sans-serif"],
        "google-sans": ["Google Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
