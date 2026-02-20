require('dotenv').config();
const screenshotService = require('../services/screenshotService');
const fs = require('fs');
const path = require('path');

const widgetsPath = path.join(__dirname, '../data/widgets.json');
const publicWidgetsDir = path.join(__dirname, '../../frontend/public/widgets');

async function generateScreenshots() {
    console.log('📸 Starting automatic widget screenshot generation...');

    if (!fs.existsSync(publicWidgetsDir)) {
        fs.mkdirSync(publicWidgetsDir, { recursive: true });
    }

    try {
        const widgetsData = fs.readFileSync(widgetsPath, 'utf8');
        const widgets = JSON.parse(widgetsData);

        for (let i = 0; i < widgets.length; i++) {
            const widget = widgets[i];
            const screenshotUrl = `${widget.link}/embed`;
            console.log(`Processing "${widget.title}" (${screenshotUrl})...`);

            try {
                // Clear existing image to force refresh if needed
                // widgets[i].image = null; 

                // Take screenshot using the existing service
                const result = await screenshotService.takeScreenshot(screenshotUrl);


                if (result.success) {
                    console.log(`✅ Screenshot captured for "${widget.title}"`);

                    // Also save a copy to the frontend public folder for Git/Local use
                    const localPath = path.join(publicWidgetsDir, `${widget.id}.png`);

                    // If it was saved locally in backend/uploads, copy it
                    const backendUploadPath = path.join(__dirname, '../uploads/screenshots', result.filename);
                    if (fs.existsSync(backendUploadPath)) {
                        fs.copyFileSync(backendUploadPath, localPath);
                        console.log(`📂 Saved local copy to frontend/public/widgets/${widget.id}.png`);
                    }

                    // Update widget image field
                    // Priority: Cloudinary URL > Local Relative Path
                    widgets[i].image = result.screenshotUrl.includes('cloudinary')
                        ? result.screenshotUrl
                        : `/widgets/${widget.id}.png`;
                } else {
                    console.error(`❌ Failed to capture "${widget.title}":`, result.error);
                }
            } catch (err) {
                console.error(`❌ Error processing "${widget.title}":`, err.message);
            }
        }

        // Save updated widgets.json
        fs.writeFileSync(widgetsPath, JSON.stringify(widgets, null, 4), 'utf8');
        console.log('✅ Updated widgets.json with new image paths.');

    } catch (error) {
        console.error('❌ Generation process failed:', error.message);
    }

    console.log('🏁 Process complete.');
}

generateScreenshots();
