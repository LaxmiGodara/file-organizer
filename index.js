import fs from "fs";
import path from "path";

// Absolute path to Downloads folder
const downloadsPath = "C:/Users/admin/Downloads";

const logFileName = `log_${getTodayDate()}.log`;

// Log file path
const logFilePath = path.join(downloadsPath, logFileName);

const FILE_CATEGORIES = {
  Images: [".jpg", ".jpeg", ".png", ".gif"],
  Documents: [".pdf", ".docx", ".txt"],
  Videos: [".mp4", ".mkv", ".avi"],
  Archives: [".zip", ".rar"],
};

function getTodayDate() {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  return `${day}${month}${year}`;
}

// This function writes error messages to error.log
function logError(message) {
  // Creating timestamp
  const timestamp = new Date().toISOString();

  // Final log format
  const logEntry = `[${timestamp}] ${message}\n`;

  // Append log entry to file
  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      // If logging fails
      console.log("CRITICAL: Unable to write to error.log", err);
    }
  });
}

// fs.watch listens for file system changes
fs.watch(downloadsPath, (eventType, filename) => {
  if (filename === "error.log") return;
  if (filename.endsWith(".crdownload")) return;

  if (!filename) return;

  const sourcePath = path.join(downloadsPath, filename);

  setTimeout(() => {
    fs.stat(sourcePath, (statErr, stats) => {
      if (statErr) {
        logError(` Cannot access ${filename}`);
        return;
      }

      // Ignoring  folders
      if (stats.isDirectory()) return;

      // Ignoring empty files
      if (stats.size === 0) {
        logError(` Empty  file ${filename}`);
        return;
      }

      // Extracting file extension
      const extension = path.extname(filename).toLowerCase();

      // Determining category
      let category = null;

      // Loop through configuration to find matching category
      for (const key in FILE_CATEGORIES) {
        if (FILE_CATEGORIES[key].includes(extension)) {
          category = key;
          break;
        }
      }

      // Ignoring  unknown file types
      if (!category) {
        return;
      }

      // Building  destination folder path
      const destinationDir = path.join(downloadsPath, category);

      // Building final destination file path
      const destinationPath = path.join(destinationDir, filename);

      // Skipping  if file is already in correct place
      if (sourcePath === destinationPath) return;

      // LOGGING ACTION
      console.log(`Moving ${filename} → ${category}/`);

      // Creating destination folder if it doesn't exist
      fs.mkdir(destinationDir, { recursive: true }, (mkdirErr) => {
        // CRITICAL ERROR
        if (mkdirErr) {
          logError(`CRITICAL: Failed to create folder ${category}`);
          return;
        }

        // Copying  file
        fs.copyFile(sourcePath, destinationPath, (copyErr) => {
          // CRITICAL ERROR
          if (copyErr) {
            logError(`CRITICAL: Failed to copy ${filename}`);
            return;
          }

          // Deleting  original
          fs.unlink(sourcePath, (deleteErr) => {
            // CRITICAL ERROR (data duplication risk)
            if (deleteErr) {
              logError(
                `CRITICAL: Copied but failed to delete original ${filename}`,
              );
              return;
            }

            console.log(`Successfully moved: ${filename}`);
          });
        });
      });
    });
  }, 3000);
});
