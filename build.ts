import esbuild, { BuildOptions } from "esbuild";
import esbuildPluginTsc from "esbuild-plugin-tsc";
import fs from "fs-extra";
import * as path from "path";
import type { PackageJson } from "type-fest";
import { build, loadConfigFromFile } from "vite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname);
const SRC_DIR = ROOT_DIR;
const DIST_DIR = path.join(ROOT_DIR, "/dist");

async function copy(options: { targets: { src: string; dest: string } }) {
  for (const { src, dest } of options.targets) {
    await fs.copy(src, dest);
  }
}

async function buildClient(options: { viteConfigFilePath: string }) {
  console.log("Building client...");

  const configFile = await loadConfigFromFile(
    { mode: process.env.NODE_ENV || "production " },
    options.viteConfigFilePath,
  );

  await build(configFile?.config);
  console.log("Client build completed.");
}

async function buildServer(options: BuildOptions) {
  console.log("Building server...");

  await esbuild.build(options);

  console.log("Server build completed.");
}

async function generateDistPackageJson(options: {
  rootPackageJsonPath: string;
  distDir: string;
}) {
  console.log("Generating package.json...");

  const rootPackageJson = JSON.parse(
    fs.readFileSync(options.rootPackageJsonPath, { encoding: "utf-8" }),
  ) as PackageJson;

  // NOTE: dependencies are removed because they are already bundled with esbuild and converted to esm
  const distPackageJson: PackageJson = {
    ...rootPackageJson,
    devDependencies: undefined,
    dependencies: undefined,
    peerDependencies: undefined,
    keywords: [...(rootPackageJson.keywords ?? []), "node-red"],
    "node-red": {
      nodes: {
        nodes: "index.js",
      },
    },
  };

  fs.writeFileSync(
    path.join(options.distDir, "package.json"),
    JSON.stringify(distPackageJson, null, 2),
    {
      encoding: "utf-8",
    },
  );

  console.log("package.json generated.");
}

async function buildProject() {
  const target = process.env.TARGET?.toLowerCase() || "both";

  try {
    await fs.remove(DIST_DIR);

    if (target === "client" || target === "both") {
      await buildClient({
        viteConfigFilePath: path.resolve(SRC_DIR, "client", "vite.config.ts"),
      });
    }

    if (target === "server" || target === "both") {
      const isDev = process.env.NODE_ENV === "development";

      await buildServer({
        entryPoints: [path.resolve(SRC_DIR, "server", "index.ts")],
        outfile: path.join(DIST_DIR, "index.js"),
        sourcemap: isDev ? "external" : false,
        treeShaking: !isDev,
        bundle: true,
        platform: "node",
        target: "node22",
        format: "cjs",
        plugins: [esbuildPluginTsc()],
        minify: !isDev,
        keepNames: true,
      });
    }

    await generateDistPackageJson({
      distDir: DIST_DIR,
      rootPackageJsonPath: path.resolve(ROOT_DIR, "package.json"),
    });
    await copy({
      targets: [
        {
          src: path.join(ROOT_DIR, "examples"),
          dest: path.join(DIST_DIR, "examples"),
        },
        {
          src: path.join(ROOT_DIR, "LICENSE"),
          dest: path.join(DIST_DIR, "LICENSE"),
        },
        {
          src: path.join(ROOT_DIR, "README.md"),
          dest: path.join(DIST_DIR, "README.md"),
        },
      ],
    });

    console.log("All builds completed successfully.");
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

buildProject();
