/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9eaff",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
        },
        demo: {
          400: "#5cc8ef",
          500: "#2eb9e7",
          600: "#1ba8d6",
        },
      },
      keyframes: {
        marqueeLtr: {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        demoFloat: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      animation: {
        "marquee-ltr": "marqueeLtr 45s linear infinite",
        "demo-float": "demoFloat 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
