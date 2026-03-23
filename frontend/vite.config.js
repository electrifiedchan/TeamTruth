import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        ws: true,
        proxyTimeout: 10000,
        configure: (proxy) => {
          proxy.on("error", (err, req, res) => {
            // Backend not ready yet — return a clean 503 instead of crashing
            console.warn("[proxy] Backend not ready yet, retrying on next request...");
            if (!res.headersSent) {
              res.writeHead(503, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Backend starting up, please retry in a moment." }));
            }
          });
        },
      },
    },
  },
});
