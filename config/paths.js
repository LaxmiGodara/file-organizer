import fs from "fs";
import path from "path";
import os from "os";

export const downloadsPath = path.join(os.homedir(), "Downloads");
export const MAX_RETRIES = 2;
export const RETRY_DELAY = 2000;
