const { _electron: electron } = require('playwright');
const path = require('path');
const fs = require('fs-extra');

// --- CONFIGURATION ---
const APP_PATH = "C:\\Program Files\\Upscayl\\Upscayl.exe";
const BASE_FOLDER = path.join(__dirname, 'base_folder');
const DONE_FOLDER = path.join(__dirname, 'upscaled');
const TRACKER_FILE = path.join(__dirname, 'tracker.json');
const SCALE = '4'; // Upscale factor: '1' to '16'
const MODEL = 'high-fidelity'; // 'standard' or 'high-fidelity'

// Model selector map: selected = button shown when active, option = dropdown item to click
const MODELS = {
    'standard': {
        selected: 'Upscayl Standard',
        option: 'Upscayl Standard Suitable for',
    },
    'high-fidelity': {
        selected: 'High Fidelity',
        option: 'High Fidelity For all kinds',
    },
};

async function runAutomation() {
    // 1. Initialize Tracking & Folders
    if (!fs.existsSync(DONE_FOLDER)) fs.mkdirSync(DONE_FOLDER);
    if (!fs.existsSync(TRACKER_FILE)) fs.writeJsonSync(TRACKER_FILE, [], { spaces: 2 });

    let processedList = fs.readJsonSync(TRACKER_FILE);
    const subfolders = fs.readdirSync(BASE_FOLDER).filter(f =>
        fs.statSync(path.join(BASE_FOLDER, f)).isDirectory() && !processedList.includes(f)
    );

    if (subfolders.length === 0) {
        console.log("🏁 No new folders to process.");
        return;
    }

    console.log(`🚀 Found ${subfolders.length} folders to process.`);

    for (const folderName of subfolders) {
        const currentFolderPath = path.join(BASE_FOLDER, folderName);
        console.log(`\n📂 Starting Batch: ${folderName}`);

        const electronApp = await electron.launch({ executablePath: APP_PATH });
        const window = await electronApp.firstWindow();

        try {
            // --- UI AUTOMATION ---

            // Enable Batch Upscayl
            await window.getByRole('checkbox').first().check();
            await window.waitForTimeout(1500); // Wait for UI to settle after batch toggle

            // Handle "Select Folder" (Bypassing the OS Dialog)
            await electronApp.evaluate(async ({ dialog }, folderPath) => {
                dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [folderPath] });
            }, currentFolderPath);
            await window.getByRole('button', { name: 'Select Folder' }).click();
            await window.waitForTimeout(2000); // Wait for folder selection UI to update

            // Settings: Select the configured model
            const desired = MODELS[MODEL];
            const alreadySelected = await window.getByRole('button', { name: desired.selected }).isVisible({ timeout: 2000 }).catch(() => false);
            if (alreadySelected) {
                console.log(`✅ ${desired.selected} model already selected.`);
            } else {
                // Click whichever model button is currently showing to open the dropdown
                const otherModel = Object.values(MODELS).find(m => m.selected !== desired.selected);
                await window.getByRole('button', { name: otherModel.selected }).click();
                await window.getByRole('button', { name: desired.option }).click();
                console.log(`🔧 Switched to ${desired.selected} model.`);
            }
            await window.waitForTimeout(1000); // Wait for model change to settle

            // Set scale value
            const scaleInput = window.getByPlaceholder('Example:');
            await scaleInput.fill(SCALE);
            console.log(`🔍 Scale set to ${SCALE}x.`);

            // Start Upscayling
            await window.getByRole('button', { name: 'Upscayl 🚀' }).click();
            console.log("⏳ Upscaling in progress...");

            // --- PROGRESS SENSING ---
            let isDone = false;
            while (!isDone) {
                await new Promise(r => setTimeout(r, 5000)); // Check every 2 seconds

                const allDoneVisible = await window.getByText('All done!').isVisible();
                const stopButtonVisible = await window.getByRole('button', { name: 'STOP' }).isVisible();
                const readyButtonVisible = await window.getByRole('button', { name: 'Upscayl 🚀' }).isVisible();

                if (allDoneVisible || (readyButtonVisible && !stopButtonVisible)) {
                    isDone = true;
                }
            }

            console.log(`✅ Upscaling finished for ${folderName}`);

            // --- FILE MANAGEMENT ---
            await manageFiles(currentFolderPath, folderName);

            // Move the root folder to "upscaled" folder
            const destinationPath = path.join(DONE_FOLDER, folderName);
            await fs.move(currentFolderPath, destinationPath, { overwrite: true });

            // Update Tracker
            processedList.push(folderName);
            fs.writeJsonSync(TRACKER_FILE, processedList, { spaces: 2 });
            console.log(`📦 Moved ${folderName} to upscaled and updated tracker.`);

        } catch (err) {
            console.error(`❌ Error processing ${folderName}:`, err);
        } finally {
            await electronApp.close();
        }
    }

    console.log("\n✨ ALL BATCHES COMPLETED.");
}

async function manageFiles(folderPath, folderName) {
    const files = fs.readdirSync(folderPath);
    const outputDirName = files.find(f => f.startsWith('upscayl_png_'));

    if (outputDirName) {
        const outputPath = path.join(folderPath, outputDirName);
        const upscaledFiles = fs.readdirSync(outputPath);

        for (const file of upscaledFiles) {
            const oldPath = path.join(outputPath, file);
            // We replace the original image in the root folder
            const newPath = path.join(folderPath, file);
            await fs.move(oldPath, newPath, { overwrite: true });
        }

        // Remove the empty upscayl output folder
        await fs.remove(outputPath);
        console.log(`🧹 Cleaned up output folder for ${folderName}`);
    }
}

runAutomation();