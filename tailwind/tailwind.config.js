/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Escanea todos los archivos React
    "./public/index.html"         // También aplica a tu HTML principal
  ],
  theme: {
    extend: {
      colors: {
        primary: "#002045",   // Azul corporativo
        secondary: "#25D366", // Verde estilo WhatsApp
        accent: "#128C7E",    // Verde oscuro para hover
        neutral: "#f5f5f5",   // Fondo gris claro
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0 4px 10px rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [],
};
