# File Organizer (Node.js)

A safe and automatic file organizer that watches the Downloads folder
and organizes files into folders based on file type.

---

## Important Safety Information (Read First)

- This app moves certain files into specific folders (Images, Documents, Videos, etc.).
- This app **never deletes the original file until it is successfully copied**.
- The app starts in **Dry-Run mode**, so no files are moved initially.
- One can preview all actions safely before enabling real file movement.

---

## What This Project Does

- Watches the Downloads folder in real time
- Detects new, fully downloaded files
- Classifies files by extension
- Moves files safely using copy-then-delete
- Logs only real failures (not temporary issues)
- Ignores unknown and unsafe files

---

## Performance Considerations

This tool is designed for correctness and safety first.

Potential performance touchpoints:

- Large Downloads folders
- High-frequency file events
- Long-running watch mode

These were consciously accepted trade-offs to avoid premature optimization.


## Known Limitations & Trade-offs

- Files are categorized based on extension only.
- The tool prioritizes safety and sequential processing over performance.
- Designed primarily for a single OS environment.
- Manual testing was used to simulate real file system behavior.

These trade-offs were intentional to keep the system reliable and understandable.

## Requirements

- Node.js (version 18 or above recommended)

Check Node version:

```bash
node -v
```
