import { defineRuntimeSettings } from "@bonsae/nrg/vite/utils";
import moment from "moment";
import os from "os";
import path from "path";

export default defineRuntimeSettings({
  userDir: path.resolve("./node-red-3"),
  logging: {
    console: {
      level: "debug",
    },
  },
  functionGlobalContext: {
    moment,
    os,
  },
  contextStorage: {
    default: { module: "memory" },
    memory: { module: "memory" },
    file: { module: "localfilesystem" },
  },
  yourNodeTest: 1000,
  yourNodeTransform: (data: string) => data.toUpperCase(),
});
