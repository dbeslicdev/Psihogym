import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { programi } from "./server/program-catalog.mjs";

const publicCatalog = "virtual:psihogym-programs";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "public-program-catalog",
      resolveId(id) { if (id === publicCatalog) return "\0" + publicCatalog; },
      load(id) {
        if (id === "\0" + publicCatalog) return "export default " + JSON.stringify(programi);
      },
    },
  ],
  server: {
    // xfwd: API vidi stvarnu adresu klijenta (X-Forwarded-For) za ograničenje pokušaja prijave.
    proxy: {"/api": {target: "http://127.0.0.1:4183", xfwd: true}},
    port: Number(process.env.PORT) || 4182,
    strictPort: true,
    fs: {
      // Keep Vite's default exclusions, plus the account store and local logs.
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**",
        "**/server/**", "**/.vite-temp/**", "**/vite.config.*", "**/supabase/**", "**/*.sqlite*", "**/*.log"],
    },
    host: "127.0.0.1",
    watch: {
      // Avoid Windows EBUSY when a build rewrites copied public assets.
      ignored: (path) => /(?:^|[/\\])dist(?:[/\\]|$)/.test(path),
    },
  },
});
