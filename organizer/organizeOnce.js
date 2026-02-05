import fs from "fs";
import { downloadsPath } from "../config/paths.js";
import { processFile } from "./processFile.js";

export function organizeOnce(isDryRun) {
  fs.readdir(downloadsPath, (err, files) => {
    if (err) return;
    files.forEach((file) => processFile(file, isDryRun));
  });
}
