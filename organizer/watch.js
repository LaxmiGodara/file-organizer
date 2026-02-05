import fs from "fs";
import { downloadsPath } from "../config/paths.js";
import { processFile } from "./processFile.js";

export function watchDownloads(IS_DRY_RUN) {
  fs.watch(downloadsPath, (eventType, filename) => {
    if (!filename) return;

    setTimeout(() => {
      processFile(filename, IS_DRY_RUN);
    }, 3000);
  });
}
