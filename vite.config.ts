import { transform } from "esbuild";
import fs from "fs";
import path from "path";
import mime from "mime-types";
import { defineConfig, Plugin, UserConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import nodeExternals from "rollup-plugin-node-externals";
import type { PackageJson } from "type-fest";
import { visualizer } from "rollup-plugin-visualizer";
import { viteStaticCopy } from "vite-plugin-static-copy";

import rootPackageJson from "./package.json";
import serverPackageJson from "./src/server/package.json";

const ROOT_DIR = __dirname;
const CLIENT_DIR = path.join(ROOT_DIR, "src", "client");
const SERVER_DIR = path.join(ROOT_DIR, "src", "server");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const LOCALES_DIR = path.join(ROOT_DIR, "locales");
const LOCALES_DOCS_DIR = path.join(LOCALES_DIR, "docs");
const LOCALES_LABELS_DIR = path.join(LOCALES_DIR, "labels");

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

function nodeRedPrepareLocales() {
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

      function validateLanguage(lang, filePath) {
        if (!SUPPORTED_LANGUAGES.includes(lang)) {
          throw new Error(
            `[node-red-localization] Invalid language code "${lang}" in file "${filePath}".\n` +
              `Supported languages are: ${SUPPORTED_LANGUAGES.join(", ")}.`,
          );
        }
      }

      const docLangs = new Map();
      const labelLangs = new Map();

      if (fs.existsSync(LOCALES_DOCS_DIR)) {
        const nodeDirs = fs
          .readdirSync(LOCALES_DOCS_DIR, { withFileTypes: true })
          .filter((d) => d.isDirectory());

        for (const nodeDir of nodeDirs) {
          const nodeType = nodeDir.name;
          const nodePath = path.join(LOCALES_DOCS_DIR, nodeType);
          const files = fs.readdirSync(nodePath);

          for (const file of files) {
            const ext = path.extname(file);
            const lang = path.basename(file, ext);
            validateLanguage(lang, path.join(nodePath, file));
            const type =
              ext === ".html"
                ? "text/html"
                : ext === ".md"
                  ? "text/markdown"
                  : null;
            if (!type) continue;

            const content = fs.readFileSync(path.join(nodePath, file), "utf-8");
            const tag = `<script type="${type}" data-help-name="${nodeType}">\n${content}\n</script>`;

            if (!docLangs.has(lang)) docLangs.set(lang, []);
            docLangs.get(lang).push(tag);
          }
        }
      }

      if (fs.existsSync(LOCALES_LABELS_DIR)) {
        const nodeDirs = fs
          .readdirSync(LOCALES_LABELS_DIR, { withFileTypes: true })
          .filter((d) => d.isDirectory());

        for (const nodeDir of nodeDirs) {
          const nodeType = nodeDir.name;
          const nodePath = path.join(LOCALES_LABELS_DIR, nodeType);
          const files = fs.readdirSync(nodePath);

          for (const file of files) {
            const ext = path.extname(file);
            if (ext !== ".json") continue;

            const lang = path.basename(file, ext);
            validateLanguage(lang, path.join(nodePath, file));
            const jsonPath = path.join(nodePath, file);
            const json = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

            if (!labelLangs.has(lang)) labelLangs.set(lang, {});
            labelLangs.get(lang)[nodeType] = json;
          }
        }
      }

      const allLangs = new Set([...docLangs.keys(), ...labelLangs.keys()]);
      for (const lang of allLangs) {
        const outDir = path.join(DIST_DIR, "locales", lang);
        fs.mkdirSync(outDir, { recursive: true });

        const htmlContent = (docLangs.get(lang) || []).join("\n");
        const jsonContent = JSON.stringify(labelLangs.get(lang) || {}, null, 2);

        fs.writeFileSync(path.join(outDir, "index.html"), htmlContent, "utf-8");
        fs.writeFileSync(path.join(outDir, "index.json"), jsonContent, "utf-8");
      }

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
            rootPackageJson.name,
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

function createPackageJson(): Plugin {
  return {
    name: "create-package-json",
    closeBundle: async () => {
      try {
        const _pkg = {} as PackageJson;
        _pkg.name = rootPackageJson.name;
        _pkg.version = rootPackageJson.version;
        _pkg.description = rootPackageJson.description;
        _pkg.author = rootPackageJson.author;
        _pkg.license = rootPackageJson.license;
        _pkg.engines = rootPackageJson.engines;
        _pkg.private = rootPackageJson.private;
        _pkg.keywords = [...(rootPackageJson.keywords ?? []), "node-red"];
        _pkg.dependencies = serverPackageJson.dependencies;
        _pkg["node-red"] = {
          nodes: {
            nodes: "index.js",
          },
        };

        await fs.promises.writeFile(
          path.resolve("dist/package.json"),
          JSON.stringify(_pkg, null, 2),
          { encoding: "utf-8" },
        );
        console.log("[create-package-json-plugin] package created");
      } catch (err) {
        console.error("[create-package-json-plugin] Error:", err);
      }
    },
  };
}

export default defineConfig(({ mode }: string) => {
  const isDev = mode === "development";
  console.log(`ISDEV: ${isDev}`);

  const clientConfig = {
    root: CLIENT_DIR,
    base: `resources/${rootPackageJson.name}`,
    resolve: {
      alias: {
        "@": CLIENT_DIR,
      },
    },
    plugins: [
      vue(),
      viteStaticCopy({
        targets: [
          {
            src: "public/*",
            dest: "resources",
          },
          {
            src: path.join(ROOT_DIR, "icons"),
            dest: ".",
          },
          {
            src: path.join(ROOT_DIR, "examples"),
            dest: ".",
          },
          {
            src: path.join(ROOT_DIR, "LICENSE"),
            dest: ".",
          },
        ],
      }),
      nodeRedPrepareHtml({
        licensePath: path.join(ROOT_DIR, "LICENSE"),
      }),
      nodeRedPrepareLocales(),
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
  } as UserConfig;

  const serverConfig = {
    root: SERVER_DIR,
    resolve: {
      alias: {
        "@": SERVER_DIR,
      },
    },
    plugins: [
      nodeExternals(),
      dts({
        insertTypesEntry: true,
        rollupTypes: true,
        tsconfigPath: path.resolve(SERVER_DIR, "tsconfig.json"),
      }),
      createPackageJson(),
    ],
    build: {
      lib: {
        entry: path.resolve(SERVER_DIR, "index.ts"),
        formats: ["cjs"],
        fileName: () => "index.js",
      },
      outDir: DIST_DIR,
      sourcemap: true,
      minify: false,
      target: "node18",
      rollupOptions: {
        output: {
          entryFileNames: "index.js",
          format: "cjs",
          exports: "named",
        },
      },
      emptyOutDir: false,
    },
  } as UserConfig;

  switch (process.env.BUILD_TARGET) {
    case "client":
      return clientConfig;

    case "server":
      return serverConfig;

    default:
      throw new Error(`Unknown BUILD_TARGET: ${process.env.BUILD_TARGET}`);
  }
});
