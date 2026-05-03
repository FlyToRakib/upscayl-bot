# 🤖 Upscayl Bot

Automated batch image upscaling bot powered by [Playwright](https://playwright.dev/) and [Upscayl](https://upscayl.org/). This tool automates the Upscayl desktop application to process multiple image folders in sequence — no manual clicks required.

## 📖 About

Upscayl Bot launches the Upscayl Electron app via Playwright, automates the UI to enable batch mode, selects each folder, configures the AI model and scale factor, and waits for completion. Once done, it cleans up Upscayl's output subfolder, moves the processed folder to `upscaled/`, and tracks progress in `tracker.json` so it can safely resume if interrupted.

### Key Features

- **Fully Automated** — Launches Upscayl, configures settings, and processes folders without any manual interaction.
- **Batch Processing** — Automatically iterates through all subfolders inside `base_folder/`.
- **Resume Support** — Tracks completed folders in `tracker.json` so you can stop and restart without reprocessing.
- **Auto Cleanup** — Moves upscaled images back into the original folder structure and removes Upscayl's temporary output directories.
- **Configurable Model** — Switch between `standard` and `high-fidelity` AI models via a single config line.
- **Configurable Scale** — Set any upscale factor from `1` to `16` via a single config line.

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
git clone https://github.com/FlyToRakib/upscayl-bot.git
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
4. Set the configured AI model and scale factor
5. Wait for upscaling to complete
6. Clean up output files and move the folder to `upscaled/`
7. Update `tracker.json` with the completed folder name

---

## ⚙️ Configuration

All configuration is defined at the top of `upscale.js`:

```javascript
const APP_PATH = "C:\\Program Files\\Upscayl\\Upscayl.exe";  // Path to Upscayl
const BASE_FOLDER = path.join(__dirname, 'base_folder');       // Input folder
const DONE_FOLDER = path.join(__dirname, 'upscaled');          // Output folder
const TRACKER_FILE = path.join(__dirname, 'tracker.json');     // Progress tracker
const SCALE = '2';                                             // Upscale factor: '1' to '16'
const MODEL = 'high-fidelity';                                 // 'standard' or 'high-fidelity'
```

| Setting | Default | Description |
|---|---|---|
| `APP_PATH` | `C:\Program Files\Upscayl\Upscayl.exe` | Full path to the Upscayl executable |
| `BASE_FOLDER` | `./base_folder` | Directory containing image subfolders to process |
| `DONE_FOLDER` | `./upscaled` | Directory where processed folders are moved |
| `TRACKER_FILE` | `./tracker.json` | JSON file tracking completed folders |
| `SCALE` | `'2'` | Upscale factor — any value from `'1'` to `'16'` |
| `MODEL` | `'high-fidelity'` | AI model — `'standard'` or `'high-fidelity'` |

### Available Models

| Model Key | UI Name | Best For |
|---|---|---|
| `'standard'` | Upscayl Standard | General purpose, suitable for most images |
| `'high-fidelity'` | High Fidelity | All kinds of images, highest quality output |

---

## 🛠️ Utility Scripts

### Test Connection

Verify Playwright can launch and connect to Upscayl:

```bash
node upscayl_test.js
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

## 📄 License

ISC
