import { transform } from "esbuild";
import fs from "fs";
import mime from "mime-types";
import path from "path";
import { defineConfig, Plugin } from "vite";
import { visualizer } from "rollup-plugin-visualizer";
import { viteStaticCopy } from "vite-plugin-static-copy";
import vue from "@vitejs/plugin-vue";
import pkg from "../../package.json" assert { type: "json" };

// TODO: add docs to .html
// TODO: build locales and copy to dist/locales

// TODO: maybe there is a more reliable way to generate these tags?
function getHtmlTag(filePath: string, srcPath: string): string | null {
  const mimeType = mime.lookup(filePath);

  switch (mimeType) {
    case "application/javascript":
    case "text/javascript":
      return `<script type="module" src="${srcPath}" defer></script>`;

    case "text/css":
      return `<link rel="stylesheet" href="${srcPath}">`;

    case "font/woff":
    case "font/woff2":
    case "application/font-woff":
    case "application/font-woff2":
    case "application/x-font-ttf":
    case "application/x-font-opentype":
    case "font/ttf":
    case "font/otf":
      return `<link rel="preload" as="font" href="${srcPath}" type="${mimeType}">`;

    default:
      return null;
  }
}

// NOTE: when minifying with esbuild, vite doesn't natively remove line breaks
function minify(): Plugin {
  return {
    name: "minify",
    renderChunk: {
      order: "post",
      async handler(code, chunk, outputOptions) {
        if (outputOptions.format === "es" && chunk.fileName.endsWith(".js")) {
          const result = await transform(code, {
            minify: true,
          });
          return result.code;
        }
        return code;
      },
    },
  };
}

function nodeRed(options: { licensePath: string }): Plugin {
  return {
    name: "vite-plugin-node-red-html",
    apply: "build",
    enforce: "post",
    async generateBundle(_, bundle) {
      const resourcesTags = Object.keys(bundle)
        .map((fileName) => {
          const asset = bundle[fileName];
          const srcPath = path.join(
            "resources",
            pkg.name,
            fileName.replace("resources", ""),
          );

          const content =
            asset.type === "asset"
              ? asset.source
              : asset.type === "chunk"
                ? asset.code
                : null;
          if (typeof content !== "string" && !(content instanceof Uint8Array))
            return null;

          return getHtmlTag(fileName, srcPath);
        })
        .filter(Boolean)
        .join("\n");

      const licenseBanner =
        options.licensePath && fs.existsSync(options.licensePath)
          ? `<!--\n${fs.readFileSync(options.licensePath)}\n-->`
          : "";

      this.emitFile({
        type: "asset",
        fileName: "index.html",
        source: `${licenseBanner}\n${resourcesTags}`,
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  console.log(`ISDEV: ${isDev}`);

  return {
    base: `resources/${pkg.name}`,
    resolve: {
      alias: {
        "@": path.resolve(__dirname),
      },
    },
    plugins: [
      vue(),
      nodeRed({ licensePath: path.resolve(__dirname, "../../LICENSE") }),
      viteStaticCopy({
        targets: [
          {
            src: "public/*",
            dest: "resources",
          },
          {
            src: "../../icons",
            dest: ".",
          },
          {
            src: "../../examples",
            dest: ".",
          },
          {
            src: "../../LICENSE",
            dest: ".",
          },
        ],
      }),
      ...(!isDev
        ? [minify()]
        : [
            visualizer({
              open: false,
              gzipSize: true,
              brotliSize: true,
              template: "treemap",
            }),
          ]),
    ],
    css: {
      devSourcemap: isDev,
    },
    build: {
      lib: {
        entry: "index.ts",
        name: "NRG",
        fileName: "index",
        formats: ["es"],
      },
      sourcemap: "inline",
      minify: !isDev,
      keepNames: isDev,
      outDir: "../../dist",
      emptyOutDir: false,
      copyPublicDir: false,
      rollupOptions: {
        // NOTE: these are available in Node-RED editor already, so not bundling
        external: ["jquery", "node-red"],
        treeshake: true,
        output: {
          entryFileNames: "resources/index.[hash].js",
          chunkFileNames: "resources/vendor.[hash].js",
          assetFileNames: "resources/[name].[hash].[ext]",
          globals: {
            vue: "Vue",
            jquery: "$",
            "node-red": "RED",
          },
          // NOTE: this ensures src/{node-type}/client/index.ts is shown as src/{node-type}/index.ts in devtools
          sourcemapPathTransform: (relativeSourcePath) => {
            return relativeSourcePath.replace(/\/client\//g, "/");
          },
          manualChunks(id) {
            if (!id.includes("node_modules")) return;

            // NOTE: because it is using pnpm I need to disregard the .pnpm prefix
            const parts = id
              .substring(
                id.lastIndexOf("node_modules/") + "node_modules/".length,
              )
              .split("/");

            const packageName = parts[0].startsWith("@")
              ? `${parts[0]}/${parts[1]}`
              : parts[0];

            // NOTE: these dependencies are chuncked together
            if (["vue"].includes(packageName)) return "vendor-vue";
            if (["ajv", "ajv-formats", "ajv-errors"].includes(packageName))
              return "vendor-ajv";
            if (["jsonpointer", "es-toolkit"].includes(packageName))
              return "vendor-utils";
            return "vendor";
          },
        },
      },
    },
    // NOTE: some libraries did not remove references to process.env from their dist so we have to change it at build time
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
      "process.env": {},
    },
  };
});
