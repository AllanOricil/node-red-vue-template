import fs from "fs";
import path from "path";
import { defineConfig, Plugin } from "vite";
import dts from "vite-plugin-dts";
import nodeExternals from "rollup-plugin-node-externals";
import type { PackageJson } from "type-fest";

import rootPackage from "../../package.json";
import packageJson from "./package.json";

function createPackageJson(): Plugin {
  return {
    name: "create-package-json",
    closeBundle: async () => {
      try {
        const _distPackageJson = {} as PackageJson;
        const _packageJson = packageJson as PackageJson;
        const _rootPackage = rootPackage as PackageJson;
        _distPackageJson.name = _rootPackage.name;
        _distPackageJson.version = _rootPackage.version;
        _distPackageJson.description = _rootPackage.description;
        _distPackageJson.author = _rootPackage.author;
        _distPackageJson.license = _rootPackage.license;
        _distPackageJson.engines = _rootPackage.engines;
        _distPackageJson.private = _rootPackage.private;
        _distPackageJson.publishConfig = _rootPackage.publishConfig;
        _distPackageJson.keywords = [
          ...(_rootPackage.keywords ?? []),
          "node-red",
        ];
        _distPackageJson.dependencies = _packageJson.dependencies;
        _distPackageJson["node-red"] = {
          nodes: {
            nodes: "index.js",
          },
        };

        await fs.promises.writeFile(
          path.join(__dirname, "../../dist/package.json"),
          JSON.stringify(_distPackageJson, null, 2),
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
