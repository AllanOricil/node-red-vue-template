const esbuild = require("esbuild");
const esbuildPluginTsc = require("esbuild-plugin-tsc");

const common = {
  bundle: true,
  platform: "node",
  target: "node18",
  format: "cjs",
  plugins: [esbuildPluginTsc()],
  minify: false,
  keepNames: true,
  loader: { ".js": "jsx" },
};

esbuild
  .build({
    entryPoints: ["_index.ts"],
    outfile: "index.js",
    ...common,
  })
  .catch(() => process.exit(1));
