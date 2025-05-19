import fs from "fs";
import path from "path";
import { defineConfig, Plugin } from "vite";
import dts from "vite-plugin-dts";
import nodeExternals from "rollup-plugin-node-externals";
import pkg from "./package.json";
import type { PackageJson } from "type-fest";

function createPackageJson(): Plugin {
  return {
    name: "create-package-json",
    closeBundle: async () => {
      try {
        const rootPkgPath = path.resolve(__dirname, "../../package.json");
        const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, "utf-8"));

        const _pkg = { ...pkg } as PackageJson;
        delete _pkg.type;
        delete _pkg.scripts;
        delete _pkg.devDependencies;

        _pkg["node-red"] = {
          nodes: {
            nodes: "index.js",
          },
        };

        _pkg.name = rootPkg.name;
        _pkg.version = rootPkg.version;
        _pkg.description = rootPkg.description;
        _pkg.author = rootPkg.author;
        _pkg.license = rootPkg.license;

        await fs.promises.writeFile(
          path.join(__dirname, "../../dist/package.json"),
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

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  console.log(`ISDEV: ${isDev}`);

  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname),
      },
    },
    plugins: [
      nodeExternals(),
      dts({
        insertTypesEntry: true,
        rollupTypes: true,
        tsconfigPath: path.resolve(__dirname, "tsconfig.json"),
      }),
      createPackageJson(),
    ],
    build: {
      lib: {
        entry: path.resolve(__dirname, "index.ts"),
        formats: ["cjs"],
        fileName: () => "index.js",
      },
      outDir: "../../dist",
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
  };
});
