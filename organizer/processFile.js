import fs from "fs";
import path from "path";
import { retryMove } from "../utils/retryMove.js";
import { downloadsPath } from "../config/paths.js";

const processingFiles = new Set();

const configPath = path.join(process.cwd(), "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

// CORE FILE PROCESSING LOGIC

export function processFile(filename, IS_DRY_RUN) {
  //  If file is already being processed, ignore
  if (processingFiles.has(filename)) return;

  //  Mark file as being processed
  processingFiles.add(filename);

  const sourcePath = path.join(downloadsPath, filename);

  fs.stat(sourcePath, (err, stats) => {
    if (err || stats.isDirectory() || stats.size === 0) {
      processingFiles.delete(filename);
      return;
    }
    const extension = path.extname(filename).toLowerCase();

    let category = null;

    // Find matching category from config
    for (const key in config) {
      if (config[key].includes(extension)) {
        category = key;
        break;
      }
    }

    if (!category) {
      processingFiles.delete(filename);
      return;
    }

    const destinationDir = path.join(downloadsPath, category);
    const destinationPath = path.join(destinationDir, filename);

    // Skip if already organized

    if (sourcePath === destinationPath) {
      processingFiles.delete(filename);
      return;
    }

    console.log(`Preparing: ${filename} → ${category}/`);

    // Ensure destination folder exists
    fs.mkdir(destinationDir, { recursive: true }, (mkdirErr) => {
      if (mkdirErr) {
        logError(`FAILED to create folder ${category}`);
        processingFiles.delete(filename);
        return;
      }

      retryMove(sourcePath, destinationPath, filename, IS_DRY_RUN);

      setTimeout(() => {
        processingFiles.delete(filename);
      }, 5000);
    });
  });
}
