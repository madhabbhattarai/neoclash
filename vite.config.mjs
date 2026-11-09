import { cpSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [{
    name: "copy-dynamic-runtime-assets",
    apply: "build",
    closeBundle() {
      cpSync(resolve("assets"), resolve("dist/assets"), { recursive: true });
    }
  }]
});
