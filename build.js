const esbuild = require("esbuild");
const esbuildPluginTsc = require("esbuild-plugin-tsc");
const { dtsPlugin } = require("esbuild-plugin-d.ts");
const { nodeExternalsPlugin } = require("esbuild-node-externals");

esbuild
  .build({
    entryPoints: ["src/server.ts"],
    outfile: "index.js",
    sourcemap: true,
    bundle: true,
    platform: "node",
    target: "node18",
    format: "cjs",
    plugins: [nodeExternalsPlugin(), esbuildPluginTsc(), dtsPlugin()],
    minify: false,
    keepNames: true,
    treeShaking: true,
  })
  .catch(() => process.exit(1));
