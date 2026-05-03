# 🤖 Upscayl Bot

Automated batch image upscaling bot powered by [Playwright](https://playwright.dev/) and [Upscayl](https://upscayl.org/). This tool automates the Upscayl desktop application to process multiple image folders in sequence — no manual clicks required.

## 📖 About

Upscayl Bot launches the Upscayl Electron app via Playwright, automates the UI to enable batch mode, selects each folder, configures the upscaling model and scale, and waits for completion. Once done, it cleans up Upscayl's output subfolder, moves the processed folder to an `upscaled/` directory, and tracks progress in a JSON file so it can safely resume if interrupted.

### Key Features

- **Fully Automated** — Launches Upscayl, configures settings, and processes folders without any manual interaction.
- **Batch Processing** — Automatically iterates through all subfolders inside `base_folder/`.
- **Resume Support** — Tracks completed folders in `processed_folders.json` so you can stop and restart without reprocessing.
- **Auto Cleanup** — Moves upscaled images back into the original folder structure and removes Upscayl's temporary output directories.
- **High Fidelity Model** — Automatically selects the "High Fidelity" AI model for best quality results.
- **2x Upscale** — Configured to upscale images to 2× resolution by default.

---

## ✅ Prerequisites

Before running the bot, make sure you have the following installed:

### 1. Node.js (v18+)

Download and install from [https://nodejs.org/](https://nodejs.org/)

Verify installation:

```bash
node -v
npm -v
```

### 2. Upscayl Desktop App

Download and install from **[https://upscayl.org/download](https://upscayl.org/download)**

> [!IMPORTANT]
> The bot expects Upscayl to be installed at the default path:
> `C:\Program Files\Upscayl\Upscayl.exe`
>
> If your installation path is different, update `APP_PATH` in `upscale.js`.

### 3. Playwright

Playwright is included as a project dependency. After running `npm install`, you also need to install the Electron browser bindings:

```bash
npx playwright install
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/upscayl-bot.git
cd upscayl-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Playwright Browsers

```bash
npx playwright install
```

### 4. Add Your Image Folders

Place your image folders inside the `base_folder/` directory. Each subfolder should contain the images you want to upscale:

```
base_folder/
├── Landscape Photos/
│   ├── photo1.png
│   ├── photo2.jpg
│   └── photo3.png
├── Product Shots/
│   ├── item1.png
│   └── item2.png
└── Portraits/
    ├── portrait1.png
    └── portrait2.png
```

### 5. Run the Bot

```bash
node upscale.js
```

The bot will:

1. Scan `base_folder/` for unprocessed subfolders
2. Launch Upscayl for each folder
3. Enable Batch mode and select the folder
4. Set the model to **High Fidelity** and scale to **2×**
5. Wait for upscaling to complete
6. Clean up output files and move the folder to `upscaled/`
7. Update `processed_folders.json` with the completed folder name

---

## 📁 Project Structure

```
upscayl-bot/
├── base_folder/          # Input — place your image folders here
│   └── .gitkeep
├── upscaled/             # Output — processed folders are moved here
│   └── .gitkeep
├── upscale.js            # Main automation script (batch processor)
├── upscayl.js            # Standalone test script (launch & screenshot)
├── inspector.js          # Playwright Inspector for exploring Upscayl UI
├── processed_folders.json           # Tracks which folders have been processed
├── package.json          # Project dependencies
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

### File Descriptions

| File | Purpose |
|---|---|
| `upscale.js` | **Main script.** Automates the full batch upscaling pipeline. |
| `upscayl.js` | **Test script.** Launches Upscayl, takes a screenshot, and closes. Useful for verifying Playwright can connect to the app. |
| `inspector.js` | **Debug tool.** Opens the Playwright Inspector so you can click around Upscayl and discover UI selectors. |
| `processed_folders.json` | **Progress tracker.** JSON array of folder names that have been successfully processed. |

---

## ⚙️ Configuration

All configuration is defined at the top of `upscale.js`:

```javascript
const APP_PATH = "C:\\Program Files\\Upscayl\\Upscayl.exe";  // Path to Upscayl
const BASE_FOLDER = path.join(__dirname, 'base_folder');       // Input folder
const DONE_FOLDER = path.join(__dirname, 'upscaled');          // Output folder
const TRACKER_FILE = path.join(__dirname, 'processed_folders.json');      // Progress tracker
```

| Setting | Default | Description |
|---|---|---|
| `APP_PATH` | `C:\Program Files\Upscayl\Upscayl.exe` | Full path to the Upscayl executable |
| `BASE_FOLDER` | `./base_folder` | Directory containing image subfolders to process |
| `DONE_FOLDER` | `./upscaled` | Directory where processed folders are moved |
| `TRACKER_FILE` | `./processed_folders.json` | JSON file tracking completed folders |

---

## 🛠️ Utility Scripts

### Test Connection

Verify Playwright can launch and connect to Upscayl:

```bash
node upscayl.js
```

This will launch the app, take a screenshot (`upscayl_ready.png`), wait 10 seconds, and close.

### Inspect UI Elements

Open the Playwright Inspector to discover button names, roles, and selectors:

```bash
node inspector.js
```

This opens an interactive recorder — click around in Upscayl to see the generated selectors. Useful when Upscayl updates break existing selectors.

### Generate Playwright Code

Use Playwright's built-in codegen tool to record interactions:

```bash
npx playwright codegen --target electron "C:\Program Files\Upscayl\Upscayl.exe"
```

---

## 🔄 Resuming / Reprocessing

### Resume After Interruption

Simply run `node upscale.js` again. The bot reads `status.json` and skips any folders already listed there.

### Reprocess a Specific Folder

1. Open `status.json`
2. Remove the folder name from the array
3. Move the folder back from `upscaled/` to `base_folder/`
4. Run `node upscale.js`

### Reprocess Everything

Delete or empty `status.json` and move all folders back to `base_folder/`:

```bash
echo [] > status.json
```

---

## ⚠️ Troubleshooting

| Issue | Solution |
|---|---|
| `TimeoutError: waiting for button` | Upscayl UI may have changed. Run `node inspector.js` to check current button names/roles. |
| Bot can't find Upscayl | Verify `APP_PATH` in `upscale.js` matches your Upscayl install location. |
| `No new folders to process` | All folders in `base_folder/` are already listed in `status.json`. Remove entries to reprocess. |
| Upscaling seems stuck | The bot polls every 5 seconds. Large batches may take a long time. Check Upscayl's progress bar. |
| `ENOENT` file errors | Ensure `base_folder/` and `upscaled/` directories exist. |

---

## 📦 Dependencies

| Package | Version | Purpose |
|---|---|---|
| [playwright](https://playwright.dev/) | ^1.59.1 | Electron app automation |
| [fs-extra](https://github.com/jprichardson/node-fs-extra) | ^11.3.4 | Enhanced file system operations |

---

## 📄 License

ISC
