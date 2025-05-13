import { transform } from "esbuild";
import fs from "fs";
import mime from "mime-types";
import path from "path";
import { defineConfig } from "vite";
import type { OutputBundle, NormalizedOutputOptions, Plugin } from "rollup";
import { visualizer } from "rollup-plugin-visualizer";
import banner from "vite-plugin-banner";
import { viteStaticCopy } from "vite-plugin-static-copy";
import vue from "@vitejs/plugin-vue";
import pkg from "./package.json" assert { type: "json" };

// TODO: add docs to .html
// TODO: build locales and copy to dist/locales

// NOTE: when minifying with esbuild, vite doesn't natively remove line breaks
function minify() {
  return {
    name: "minify",
    renderChunk: {
      order: "post",
      async handler(code, chunk, outputOptions) {
        if (outputOptions.format === "es" && chunk.fileName.endsWith(".js")) {
          const result = await transform(code, { minify: true });
          return result.code;
        }
        return code;
      },
    },
  };
}

// NOTE: maybe there is a more reliable way to generate these tags?
function getHtmlTag(
  filePath: string,
  srcPath: string,
  assetContent: Buffer
): string | null {
  const mimeType = mime.lookup(filePath);

  switch (mimeType) {
    case "application/javascript":
    case "text/javascript":
      return `<script type="module" src="${srcPath}"></script>`;

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

function nodeRedHtmlPlugin(options = {}): Plugin {
  return {
    name: "vite-plugin-node-red-html",
    apply: "build",
    enforce: "post",
    async generateBundle(_, bundle) {
      const nodesDir = path.resolve(process.cwd(), "src/nodes");
      const nodeNames = fs
        .readdirSync(nodesDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

      const templateTags = nodeNames
        .map((nodeName) => {
          return `<script type="text/html" data-template-name="${nodeName}"><div id="app"></div></script>`;
        })
        .join("\n");

      const resourcesTags = Object.keys(bundle)
        .map((fileName) => {
          const asset = bundle[fileName];
          // NOTE: this is done to avoid resources/{pkg.name}/resources/{fileName}
          let _fileName = fileName.replace("resources/", "");
          const filePath = path.join("resources", _fileName);
          const srcPath = path.join("resources", pkg.name, _fileName);
          console.log(filePath);
          console.log(srcPath);
          const content =
            asset.type === "asset"
              ? asset.source
              : asset.type === "chunk"
                ? asset.code
                : null;
          if (typeof content !== "string" && !(content instanceof Uint8Array))
            return null;

          return getHtmlTag(filePath, srcPath, content);
        })
        .filter(Boolean)
        .join("\n");

      let licenseBanner =
        options.licensePath &&
        fs.existsSync(options.licensePath) &&
        `<!--\n${fs.readFileSync(options.licensePath)}\n-->`;

      this.emitFile({
        type: "asset",
        fileName: "index.html",
        source: `${licenseBanner}\n${templateTags}\n${resourcesTags}`,
      });
    },
  };
}

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

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    base: `resources/${pkg.name}`,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    plugins: [
      vue(),
      visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: "treemap",
      }),
      nodeRedHtmlPlugin({ licensePath: path.resolve(__dirname, "LICENSE") }),
      viteStaticCopy({
        targets: [
          {
            src: "public/*",
            dest: "resources",
          },
          {
            src: "icons",
            dest: ".",
          },
          {
            src: "examples",
            dest: ".",
          },
          // TODO: is there a way to remove client dependencies from the package.json? core dependencies will all be under devDependencies
          {
            src: "package.json",
            dest: ".",
          },
          {
            src: "package-lock.json",
            dest: ".",
          },
        ],
      }),
      minify(),
    ],
    css: {
      devSourcemap: isDev,
    },
    build: {
      lib: {
        entry: "src/client.ts",
        name: "NRG",
        fileName: "index",
        formats: ["es"],
      },
      sourcemap: isDev ? "inline" : false,
      minify: !isDev,
      keepNames: isDev,
      outDir: "dist",
      copyPublicDir: false,
      rollupOptions: {
        // NOTE: these are available in Node-RED editor already, so not bundling
        external: ["jquery", "node-red"],
        treeshake: true,
        output: {
          entryFileNames: "resources/index.[hash].js",
          chunkFileNames: "resources/vendor.[hash].js",
          assetFileNames: (assetInfo) => {
            console.log(assetInfo);
            const fileName = assetInfo.name ?? "";
            return "resources/[name].[hash].[ext]";
          },
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

            const parts = id.split("node_modules/")[1].split("/");
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
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
      "process.env": {},
    },
  };
});
