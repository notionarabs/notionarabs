require('dotenv').config();
const { upsertWidgetToNotion } = require('../services/notionService');
const fs = require('fs');
const path = require('path');


const screenshotService = require('../services/screenshotService');

async function syncWidgets() {
    try {
        const widgetsPath = path.join(__dirname, '../data/widgets.json');
        if (!fs.existsSync(widgetsPath)) {
            return;
        }

        const widgetsData = fs.readFileSync(widgetsPath, 'utf8');
        let widgets = JSON.parse(widgetsData);
        let updatedJson = false;

        for (let i = 0; i < widgets.length; i++) {
            const widget = widgets[i];

            // Automatic Screenshot: If image is missing, generate it
            if (!widget.image) {
                try {
                    const ssUrl = `${widget.link}/embed?screenshotService=true`;
                    const ssResult = await screenshotService.takeScreenshot(ssUrl);

                    if (ssResult.success) {
                        widgets[i].image = ssResult.screenshotUrl;
                        updatedJson = true;
                    }
                } catch (ssErr) {
                    console.error(`❌ Failed to auto-generate screenshot for "${widget.title}": ${ssErr.message}`);
                }
            }

            const result = await upsertWidgetToNotion(widgets[i]);

            if (result.error) {
                console.error(`❌ Failed to sync "${widget.title}":`, result.error.message || result.error);
            }
        }

        if (updatedJson) {
            fs.writeFileSync(widgetsPath, JSON.stringify(widgets, null, 4), 'utf8');
        }
    } catch (error) {
        console.error('❌ Widget sync failed:', error.message);
    }
}

// If run directly via node
if (require.main === module) {
    syncWidgets();
}


module.exports = { syncWidgets };
