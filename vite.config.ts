// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

function appendSourceURLPlugin(filename: string) {
  return {
    name: "append-source-url",
    generateBundle(_, bundle) {
      for (const fileName in bundle) {
        const chunk = bundle[fileName];
        if (chunk.type === "chunk" && chunk.fileName.endsWith(".js")) {
          chunk.code += `\n//# sourceURL=${filename}\n`;
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [vue(), appendSourceURLPlugin("nodes/index.js")],
  build: {
    lib: {
      entry: "nodes/index.ts",
      name: "NRG",
      fileName: "nrg",
      formats: ["iife"],
    },
    sourcemap: "inline",
    minify: true,
    keepNames: true,
    outDir: "dist",
    rollupOptions: {
      external: ["jquery", "node-red"],
      output: {
        entryFileNames: "nrg.[hash].js",
        chunkFileNames: "nrg.[hash].js",
        assetFileNames: "nrg.[hash].[ext]",
        globals: {
          vue: "Vue",
          jquery: "$",
          "node-red": "RED",
        },
      },
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "production"
    ),
    "process.env": {},
  },
});
