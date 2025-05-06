import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import banner from "vite-plugin-banner";
import tsconfigPaths from "vite-tsconfig-paths";
import dts from "vite-plugin-dts";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import pkg from "./package.json" assert { type: "json" };
import { builtinModules } from "module";

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
      nodeResolve({
        preferBuiltins: true,
      }),
      tsconfigPaths(),
      dts({
        outDir: "dist/types",
        logLevel: "info",
      }),
      banner(signature),
    ],
    build: {
      lib: {
        entry: "src/nodes/server.ts",
        fileName: "index",
        formats: ["cjs"],
      },
      sourcemap: true,
      minify: !isDev,
      keepNames: isDev,
      outDir: "dist",
      rollupOptions: {
        external: [...builtinModules, "node-red"],
        treeshake: true,
        output: {
          entryFileNames: "nrg.[hash].js",
          chunkFileNames: "nrg.[hash].js",
          assetFileNames: "nrg.[hash].[ext]",
          globals: {
            "node-red": "RED",
          },
        },
      },
    },
  };
});
