const { _electron: electron } = require('playwright');

(async () => {
    console.log("🚀 Launching Upscayl...");

    try {
        // 1. Launch the Electron app
        const electronApp = await electron.launch({
            executablePath: "C:\\Program Files\\Upscayl\\Upscayl.exe",
            // These args help Playwright connect to the Chromium engine inside Upscayl
            args: ['--remote-debugging-port=9222']
        });

        // 2. Capture the main window
        const window = await electronApp.firstWindow();

        // Wait for the app to be "stable" (all internal assets loaded)
        await window.waitForLoadState('domcontentloaded');

        const title = await window.title();
        console.log(`✅ Successfully connected to: ${title}`);

        // 3. Example Interaction: Wait for the UI to be ready
        // Upscayl usually has a "Select Image" button or similar.
        // We'll wait for the body to be visible first.
        await window.waitForSelector('body');

        // 4. Take a screenshot to prove it worked
        await window.screenshot({ path: 'upscayl_ready.png' });
        console.log("📸 Screenshot saved as 'upscayl_ready.png'");

        /* 
           Note: If you want to click buttons, use:
           await window.click('text="Select Image"');
        */

        // Keep the app open for 10 seconds so you can see it work
        console.log("Waiting 10 seconds before closing...");
        await new Promise(resolve => setTimeout(resolve, 10000));

        await electronApp.close();
        console.log("👋 Automation finished.");

    } catch (error) {
        console.error("❌ Error launching Upscayl:", error);
    }
})();