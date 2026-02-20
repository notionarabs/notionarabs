require('dotenv').config();
const { upsertWidgetToNotion } = require('../services/notionService');
const fs = require('fs');
const path = require('path');


const screenshotService = require('../services/screenshotService');

async function syncWidgets() {
    console.log('🚀 Starting widget sync to Notion...');

    try {
        const widgetsPath = path.join(__dirname, '../data/widgets.json');
        if (!fs.existsSync(widgetsPath)) {
            console.log('⚠️ Widgets data file not found, skipping sync.');
            return;
        }

        const widgetsData = fs.readFileSync(widgetsPath, 'utf8');
        let widgets = JSON.parse(widgetsData);
        let updatedJson = false;

        for (let i = 0; i < widgets.length; i++) {
            const widget = widgets[i];

            // Automatic Screenshot: If image is missing, generate it
            if (!widget.image) {
                console.log(`📸 Image missing for "${widget.title}", generating automatically...`);
                try {
                    const ssUrl = `${widget.link}/embed?screenshotService=true`;
                    const ssResult = await screenshotService.takeScreenshot(ssUrl);

                    if (ssResult.success) {
                        widgets[i].image = ssResult.screenshotUrl;

                        updatedJson = true;
                        console.log(`✅ Generated screenshot: ${widgets[i].image}`);
                    }
                } catch (ssErr) {
                    console.error(`❌ Failed to auto-generate screenshot: ${ssErr.message}`);
                }
            }

            console.log(`Syncing "${widget.title}"...`);
            const result = await upsertWidgetToNotion(widgets[i]);



            if (result.error) {
                console.error(`❌ Failed to sync "${widget.title}":`, result.error.message || result.error);
            } else {
                const action = result.updated ? 'updated' : 'created';
                console.log(`✅ "${widget.title}" ${action} successfully! (ID: ${result.id})`);
            }
        }

        if (updatedJson) {
            fs.writeFileSync(widgetsPath, JSON.stringify(widgets, null, 4), 'utf8');
            console.log('📝 Updated widgets.json with new screenshots.');
        }
    } catch (error) {

        console.error('❌ Sync failed:', error.message);
    }

    console.log('🏁 Sync finished.');
}

// If run directly via node
if (require.main === module) {
    syncWidgets();
}


module.exports = { syncWidgets };
