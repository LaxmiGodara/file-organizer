import fs from "fs";
import { logError } from "../logger/logger.js";
import { MAX_RETRIES, RETRY_DELAY } from "../config/paths.js";


export function retryMove(
  sourcePath,
  destinationPath,
  filename,
  isDryRun,
  attempt = 1,
) {
  if (isDryRun) {
    console.log(`[DRY RUN] Would move: ${filename}`);
    console.log(`[DRY RUN] From: ${sourcePath}`);
    console.log(`[DRY RUN] To:   ${destinationPath}`);
    return;
  }

  fs.copyFile(sourcePath, destinationPath, (copyErr) => {
    if (copyErr) {
      if (attempt < MAX_RETRIES) {
        setTimeout(() => {
          retryMove(
            sourcePath,
            destinationPath,
            filename,
            isDryRun,
            attempt + 1,
          );
        }, RETRY_DELAY);
        return;
      }

      logError(`FAILED to copy after retries: ${filename}`);
      return;
    }

    fs.unlink(sourcePath, (deleteErr) => {
      if (deleteErr) {
        logError(`COPIED but FAILED to delete original: ${filename}`);
        return;
      }

      console.log(`Successfully moved: ${filename}`);
    });
  });
}
