const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["_index.ts"],
    outfile: "index.js",
    bundle: true,
    platform: "node",
    target: "node18",
    format: "cjs",
    plugins: [],
    minify: false,
    loader: { ".js": "jsx" },
    tsconfigRaw: {
      compilerOptions: {
        strict: true,
        noImplicitAny: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        useDefineForClassFields: false,
      },
    },
  })
  .catch(() => process.exit(1));
