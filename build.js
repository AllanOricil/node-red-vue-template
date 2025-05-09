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
  external: ["*.node", "aws-cdk-lib", "constructs", "@aws-cdk"],
  loader: { ".js": "jsx" },
};

esbuild
  .build({
    entryPoints: ["src/server.ts"],
    outfile: "index.js",
    treeShaking: false,
    ...common,
  })
  .catch(() => process.exit(1));
