import fs from "fs";
import path from "path";
import os from "os";

const processingFiles = new Set();

const configPath = path.join(process.cwd(), "config.json");

const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

const downloadsPath = path.join(os.homedir(), "Downloads");

// Maximum retry attempts for file operations
const MAX_RETRIES = 3;

// Delay (ms) between retries
const RETRY_DELAY = 2000;

// Returns today's date in ddmmyyyy format
function getTodayDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${day}${month}${year}`;
}

// Daily log file name
const logFileName = `log_${getTodayDate()}.log`;

// Full path of daily log file
const logFilePath = path.join(downloadsPath, logFileName);

// Defines which extensions belong to which folder
const FILE_CATEGORIES = config;

// Writes a message to today's log file
function logError(message) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${message}\n`;

  fs.appendFile(logFilePath, entry, (err) => {
    if (err) {
      console.log("CRITICAL: Failed to write log file", err);
    }
  });
}

const DRY_RUN = false;

// Attempts to move a file with retry logic
function moveFileWithRetry(sourcePath, destinationPath, filename, attempt = 1) {
  if (DRY_RUN) {
    console.log(`[DRY RUN] would move: ${filename}`);
    console.log(`[DRU RUN] from: ${sourcePath}`);
    console.log(`[DRY RUN ] To: ${destinationPath}`);
    return;
  }
  console.log("after dry run code ");

  // Copy file first (safe operation)
  fs.copyFile(sourcePath, destinationPath, (copyErr) => {
    if (copyErr) {
      // If copy fails but retries remain → retry
      if (attempt < MAX_RETRIES) {
        setTimeout(() => {
          moveFileWithRetry(sourcePath, destinationPath, filename, attempt + 1);
        }, RETRY_DELAY);
        return;
      }

      // Final failure after retries → log error
      logError(`FAILED to copy after ${MAX_RETRIES} attempts: ${filename}`);
      return;
    }

    // Delete original only after copy success
    fs.unlink(sourcePath, (deleteErr) => {
      if (deleteErr) {
        // Deletion failure is critical after successful copy
        logError(`COPIED but FAILED to delete original: ${filename}`);
        return;
      }

      // Successful move
      console.log(`Successfully moved: ${filename}`);
    });
  });
}


// Watches the Downloads folder continuously
fs.watch(downloadsPath, (eventType, filename) => {
  if (!filename) return;

  // Ignore noise
  if (filename.endsWith(".crdownload")) return;
  if (filename.endsWith(".tmp")) return;
  if (filename.startsWith("log_")) return;

  //  Ignore if already being processed
  if (processingFiles.has(filename)) return;

  const sourcePath = path.join(downloadsPath, filename);

  // Mark as processing
  processingFiles.add(filename);

  setTimeout(() => {
    fs.stat(sourcePath, (statErr, stats) => {
      if (statErr) {
        processingFiles.delete(filename);
        return;
      }

      if (stats.isDirectory() || stats.size === 0) {
        processingFiles.delete(filename);
        return;
      }

      const extension = path.extname(filename).toLowerCase();

      let category = null;
      for (const key in FILE_CATEGORIES) {
        if (FILE_CATEGORIES[key].includes(extension)) {
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

      if (sourcePath === destinationPath) {
        processingFiles.delete(filename);
        return;
      }

      console.log(`Preparing to move: ${filename} → ${category}/`);

      fs.mkdir(destinationDir, { recursive: true }, (mkdirErr) => {
        if (mkdirErr) {
          logError(`FAILED to create folder ${category} for ${filename}`);
          processingFiles.delete(filename);
          return;
        }

        moveFileWithRetry(sourcePath, destinationPath, filename);

        //  Release lock after DRY_RUN or real move
        setTimeout(() => {
          processingFiles.delete(filename);
        }, 1000);
      });
    });
  }, 3000);
});
