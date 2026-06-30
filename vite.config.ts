import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // SECURITY: fail the build if a server-only / service-role-shaped secret ever
  // gets exposed to the client bundle via a VITE_* env. Pure assert — does not
  // change any runtime behavior.
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const FORBIDDEN = /(SERVICE_ROLE|SECRET_KEY|PRIVATE_KEY|DB_URL)/i;
  for (const [k, v] of Object.entries(env)) {
    if (FORBIDDEN.test(k) || (typeof v === "string" && /eyJ[A-Za-z0-9_-]{40,}\.[A-Za-z0-9_-]{40,}\.[A-Za-z0-9_-]{40,}/.test(v) && /SERVICE/i.test(k))) {
      throw new Error(`[security] refusing to bundle env var "${k}" — service-role / secret-shaped values must stay server-side.`);
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
