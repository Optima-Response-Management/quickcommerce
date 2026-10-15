import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Default to the SAME-ORIGIN "/api" path. Auth cookies are first-party
  // only when the browser talks to the same origin as the page, which is
  // what makes sign-in work on every device/browser (including Safari/iOS).
  const apiBaseUrl = (
    env.VITE_API_BASE_URL ||
    process.env.VITE_API_BASE_URL ||
    "/api"
  ).replace(/\/+$/, "");

  return {
    plugins: [react(), tailwindcss()],

    define: {
      __API_BASE_URL__: JSON.stringify(apiBaseUrl),
    },

    server: {
      host: true, // listen on the network, not just localhost
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,

        },
      },
    },
  };
});
