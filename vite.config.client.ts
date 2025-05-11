import fs from "fs";
import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import banner from "vite-plugin-banner";
import pkg from "./package.json" assert { type: "json" };
import type { OutputBundle, NormalizedOutputOptions, Plugin } from "rollup";
import { visualizer } from "rollup-plugin-visualizer";
import mime from "mime-types";
import crypto from "crypto";
import { viteStaticCopy } from "vite-plugin-static-copy";

// TODO: add docs to .html
// TODO: build locales and copy to dist/locales

function generateSha(content: Buffer): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

// NOTE: maybe there is a more reliable way to generate these tags?
function getHtmlTag(
  filePath: string,
  srcPath: string,
  assetContent: Buffer
): string | null {
  const mimeType = mime.lookup(filePath);
  const shaHash = generateSha(assetContent);

  switch (mimeType) {
    case "application/javascript":
    case "text/javascript":
      return `<script src="${srcPath}" integrity="${shaHash}"></script>`;

    case "text/css":
      return `<link rel="stylesheet" href="${srcPath}" integrity="${shaHash}">`;

    case "font/woff":
    case "font/woff2":
    case "application/font-woff":
    case "application/font-woff2":
    case "application/x-font-ttf":
    case "application/x-font-opentype":
    case "font/ttf":
    case "font/otf":
      return `<link rel="preload" as="font" href="${srcPath}" integrity="${shaHash}" type="${mimeType}" crossorigin="anonymous">`;

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
      appendSourceURLPlugin("src/client.js"),
      visualizer({
        open: isDev,
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
    ],
    css: {
      devSourcemap: isDev,
    },
    build: {
      lib: {
        entry: "src/client.ts",
        name: "NRG",
        fileName: "index",
        formats: ["iife"],
      },
      sourcemap: isDev ? "inline" : false,
      minify: !isDev,
      keepNames: isDev,
      outDir: "dist",
      copyPublicDir: false,
      rollupOptions: {
        external: ["jquery", "node-red"],
        treeshake: true,
        output: {
          entryFileNames: "resources/index.[hash].js",
          chunkFileNames: "resources/index.[hash].js",
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
