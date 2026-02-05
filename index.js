import { organizeOnce } from "./organizer/organizeOnce.js";
import { watchDownloads } from "./organizer/watch.js";

const args = process.argv.slice(2);

const IS_DRY_RUN = !args.includes("--execute");
const IS_WATCH_MODE = args.includes("--watch");

console.log(IS_DRY_RUN, "************* Dry run ")
console.log(IS_WATCH_MODE, "**********  watch mode")

console.log("Mode:", IS_DRY_RUN ? "DRY RUN" : "EXECUTION");
console.log("Run Type:", IS_WATCH_MODE ? "WATCH" : "ONCE");

if (IS_WATCH_MODE) {
  watchDownloads(IS_DRY_RUN);
} else {
  organizeOnce(IS_DRY_RUN);
}
