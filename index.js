import fs from "fs";
import path from "path";

const downloadsPath = "C:/Users/admin/Downloads";

const FILE_CATEGORIES = {
  Image: [".jpg", "jpeg", ".png", ".gif"],
  Documents: [".pdf", ".docx", ".txt"],
  Videos: [".mp4", ".mkv", ".avi"],
  Archives: [".zip", ".rar"],
};

fs.readdir(downloadsPath, (error, files) => {
  if (error) {
    console.log("error reading the folder:", error);
    return;
  }

  console.log("Classifying files:\n");

  files.forEach((file) => {
    const fullPath = path.join(downloadsPath, file);

    //getting metadata
    fs.stat(fullPath, (err, stats) => {
      if (err) {
        console.log(`Cannot access ${file}`);
        return;
      }
      //ignoring folders
      if (stats.isDirectory()) {
        console.log(`${file} is FOLDER (ignored for safety)`);
      }
      //ignoring empty files
      if (stats.size === 0) {
        console.log(`${file} ,  0 bites file(ignored, possibly incomplete)`);
      }

      //Extracting file extension
      const extension = path.extname(file).toLowerCase();

      let detectedCategory = null;

      for (const category in FILE_CATEGORIES) {
        if (FILE_CATEGORIES[category].includes(extension)) {
          detectedCategory = category;
          break;
        }
      }

      if (!detectedCategory) {
        console.log(`${file}, unknown type`);
      }

      console.log(`${file} , Vaild File, size:${stats.size} bytes`);

      console.log(`${file}, Category: ${detectedCategory}`);
    });
  });
});
