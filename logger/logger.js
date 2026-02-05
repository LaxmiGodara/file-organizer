import fs from "fs";
import path from "path";
import { downloadsPath } from "../config/paths.js";
import { getTodayDate } from "../utils/date.js";


const logFileName = `log_${getTodayDate()}.log`;
const logFilePath = path.join(downloadsPath, logFileName);

export function logError(message) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${message}\n`;

  fs.appendFile(logFilePath, entry, (err) => {
    if (err) {
      console.log("CRITICAL: Failed to write log file", err);
    }
  });
}
