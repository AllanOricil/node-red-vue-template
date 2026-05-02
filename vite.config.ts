import { defineConfig } from "vite";
import { nodeRed } from "@bonsae/nrg/vite";

export default defineConfig({
  plugins: [
    nodeRed({
      nodeRedLauncherOptions: {
        runtime: {
          settingsFilepath: "./node-red.settings.ts",
          version: "5.0.0-beta.6",
        },
      },
    }),
  ],
});
