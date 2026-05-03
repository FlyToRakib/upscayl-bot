const { _electron: electron } = require('playwright');

(async () => {
    // Launch the app
    const electronApp = await electron.launch({
        executablePath: "C:\\Program Files\\Upscayl\\Upscayl.exe",
    });

    // Get the window
    const window = await electronApp.firstWindow();

    // 1. OPEN THE RECORDER
    // This command opens the "Playwright Inspector" manually
    await window.pause();

    // The script will stay open until you close the app
    console.log("Recorder is open. Click around in Upscayl!");
})();