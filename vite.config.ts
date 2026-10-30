import { fileURLToPath } from "node:url";
import { readdir, rm } from "node:fs/promises";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
const path = (relative: string) =>
  fileURLToPath(new URL(relative, import.meta.url));
export default defineConfig(({ mode }) => ({
  root: path("./web"),
  base: "./",
  publicDir: path("./public"),
  plugins: [
    react(),
    {
      name: "workspace-data-only",
      async closeBundle() {
        const root = mode === "client" ? "./dist-client" : "./dist";
        await rm(path(`${root}/branding`), { recursive: true, force: true });
        await rm(path(`${root}/favicon.ico`), { force: true });
        for (const name of await readdir(path(`${root}/models`)))
          if (name.endsWith(".bin")) await rm(path(`${root}/models/${name}`));
      },
    },
  ],
  server: { host: "127.0.0.1", port: 3016, strictPort: true },
  build: {
    outDir: path(mode === "client" ? "./dist-client" : "./dist"),
    emptyOutDir: true,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [{ name: "three", test: /node_modules[\\/]three[\\/]/ }],
        },
      },
    },
  },
}));
