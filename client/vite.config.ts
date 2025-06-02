import { transform } from "esbuild";
import fs from "fs";
import mime from "mime-types";
import path from "path";
import { defineConfig, Plugin } from "vite";
import { visualizer } from "rollup-plugin-visualizer";
import vue from "@vitejs/plugin-vue";
import pkg from "../package.json";

const ROOT_DIR = path.join(__dirname, "../");
const DIST_DIR = path.join(ROOT_DIR, "dist");

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

function nodeRedPrepareLocales(options: {
  outDir: string;
  docsDir: string;
  labelsDir: string;
}): Plugin {
  return {
    name: "node-red-localization",
    apply: "build",
    enforce: "post",
    async closeBundle() {
      const SUPPORTED_LANGUAGES = [
        "en-US",
        "de",
        "es-ES",
        "fr",
        "ko",
        "pt-BR",
        "ru",
        "ja",
        "zh-CN",
        "zh-TW",
      ];

      function validateLanguage(lang: string, filePath: string) {
        if (!SUPPORTED_LANGUAGES.includes(lang)) {
          throw new Error(
            `[node-red-localization] Invalid language code "${lang}" in file "${filePath}".\n` +
              `Supported languages are: ${SUPPORTED_LANGUAGES.join(", ")}.`,
          );
        }
      }

      function forEachFile(
        baseDir: string,
        fileExtensions: string[],
        processFile: (params: {
          ext: string;
          filePath: string;
          nodeType: string;
        }) => string[] | string | null,
      ) {
        const langMap = new Map();

        if (!fs.existsSync(baseDir)) return langMap;

        const nodeDirs = fs
          .readdirSync(baseDir, { withFileTypes: true })
          .filter((d) => d.isDirectory());

        for (const nodeDir of nodeDirs) {
          const nodeType = nodeDir.name;
          const nodePath = path.join(baseDir, nodeType);
          const files = fs.readdirSync(nodePath);

          for (const file of files) {
            const ext = path.extname(file);
            if (!fileExtensions.includes(ext)) continue;

            const lang = path.basename(file, ext);
            const filePath = path.join(nodePath, file);
            validateLanguage(lang, filePath);

            const value = processFile({ ext, filePath, nodeType });
            if (value == null) continue;

            if (!langMap.has(lang)) {
              langMap.set(lang, Array.isArray(value) ? [] : {});
            }

            if (Array.isArray(value)) {
              langMap.get(lang).push(...value);
            } else {
              langMap.get(lang)[nodeType] = value;
            }
          }
        }

        return langMap;
      }

      function writeOutput<T>(
        langMap: Map<string, T>,
        fileName: string,
        serialize: (value: T) => string,
      ) {
        for (const [lang, data] of langMap.entries()) {
          const outDir = path.join(options.outDir, lang);
          fs.mkdirSync(outDir, { recursive: true });

          const content = serialize(data);
          fs.writeFileSync(path.join(outDir, fileName), content, "utf-8");
        }
      }

      const docLangs = forEachFile(
        options.docsDir,
        [".html", ".md"],
        ({ ext, filePath, nodeType }) => {
          const type =
            ext === ".html"
              ? "text/html"
              : ext === ".md"
                ? "text/markdown"
                : null;
          if (!type) return null;

          const content = fs.readFileSync(filePath, "utf-8");
          return [
            `<script type="${type}" data-help-name="${nodeType}">\n${content}\n</script>`,
          ];
        },
      );

      writeOutput(docLangs, "index.html", (value: string[]) =>
        value.join("\n"),
      );

      const labelLangs = forEachFile(
        options.labelsDir,
        [".json"],
        ({ filePath }) => JSON.parse(fs.readFileSync(filePath, "utf-8")),
      );

      writeOutput(
        labelLangs,
        "index.json",
        (value: { [key: string]: string }) => JSON.stringify(value, null, 2),
      );

      console.log(
        `[node-red-localization] Generated help files in dist/locales/*`,
      );
    },
  };
}

function nodeRedPrepareHtml(options: { licensePath: string }): Plugin {
  return {
    name: "node-red-html",
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

          // TODO: maybe there is a more reliable way to generate these tags?
          function getHtmlTag(
            filePath: string,
            srcPath: string,
          ): string | null {
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

  const plugins = [
    vue(),
    nodeRedPrepareHtml({
      licensePath: path.join(ROOT_DIR, "LICENSE"),
    }),
    nodeRedPrepareLocales({
      outDir: path.join(DIST_DIR, "locales"),
      docsDir: path.join(ROOT_DIR, "locales/docs"),
      labelsDir: path.join(ROOT_DIR, "locales/labels"),
    }),
  ];

  if (!isDev) {
    plugins.push(minify());
  } else {
    plugins.push(
      visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: "treemap",
      }),
    );
  }

  return {
    base: `resources/${pkg.name}`,
    resolve: {
      alias: {
        "@": path.resolve(__dirname),
      },
    },
    plugins,
    css: {
      devSourcemap: isDev,
    },
    build: {
      lib: {
        entry: path.resolve(ROOT_DIR, "client", "index.ts"),
        name: "NRG",
        fileName: "index",
        formats: ["es"],
      },
      sourcemap: "inline",
      minify: !isDev,
      keepNames: isDev,
      outDir: DIST_DIR,
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
