import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import banner from "vite-plugin-banner";
import pkg from "./package.json" assert { type: "json" };
import type { OutputBundle, NormalizedOutputOptions, Plugin } from "rollup";
import { visualizer } from "rollup-plugin-visualizer";

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
    base: "/",
    plugins: [
      vue(),
      appendSourceURLPlugin("src/client.js"),
      banner(signature),
      visualizer({
        open: isDev,
        gzipSize: true,
        brotliSize: true,
        template: "treemap",
      }),
    ],
    css: {
      devSourcemap: isDev,
    },
    build: {
      lib: {
        entry: "src/client.ts",
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
        treeshake: true,
        output: {
          entryFileNames: "nrg.[hash].js",
          chunkFileNames: "nrg.[hash].js",
          assetFileNames: "nrg.[hash].[ext]",
          globals: {
            vue: "Vue",
            jquery: "$",
            "node-red": "RED",
          },
          sourcemapPathTransform: (relativeSourcePath) => {
            return relativeSourcePath.replace(/\/client\//g, "/");
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
