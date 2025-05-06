import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import banner from "vite-plugin-banner";
import pkg from "./package.json" assert { type: "json" };
import type { OutputBundle, NormalizedOutputOptions, Plugin } from "rollup";

function appendSourceURLPlugin(filename: string): Plugin {
  return {
    name: "append-source-url",
    generateBundle(_: NormalizedOutputOptions, bundle: OutputBundle) {
      for (const fileName in bundle) {
        const chunk = bundle[fileName];
        if (chunk.type === "chunk" && chunk.fileName.endsWith(".js")) {
          chunk.code += `\n//# sourceURL=${filename}\n`;
        }
      }
    },
  };
}

const signature = [
  "/**",
  `* name: ${pkg.name}`,
  `* version: v${pkg.version}`,
  `* description: ${pkg.description}`,
  `* author: ${pkg.author}`,
  "*/",
].join("\n");

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    plugins: [
      vue(),
      appendSourceURLPlugin("src/nodes/client.js"),
      banner(signature),
    ],
    build: {
      lib: {
        entry: "src/nodes/client.ts",
        name: "NRG",
        fileName: "nrg",
        formats: ["iife"],
      },
      sourcemap: isDev ? "inline" : false,
      minify: !isDev,
      keepNames: isDev,
      outDir: "dist",
      rollupOptions: {
        external: ["jquery", "node-red"],
        treeshake: false,
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
      "process.env.NODE_ENV": JSON.stringify(mode),
      "process.env": {},
    },
  };
});
