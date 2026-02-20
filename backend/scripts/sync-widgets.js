require('dotenv').config();
const { upsertWidgetToNotion } = require('../services/notionService');
const fs = require('fs');
const path = require('path');


async function syncWidgets() {
    console.log('🚀 Starting widget sync to Notion...');

    try {
        const widgetsPath = path.join(__dirname, '../data/widgets.json');
        if (!fs.existsSync(widgetsPath)) {
            console.log('⚠️ Widgets data file not found, skipping sync.');
            return;
        }

        const widgetsData = fs.readFileSync(widgetsPath, 'utf8');
        const widgets = JSON.parse(widgetsData);

        for (const widget of widgets) {
            console.log(`Syncing "${widget.title}"...`);
            const result = await upsertWidgetToNotion({
                title: widget.title,
                description: widget.description,
                link: widget.link
            });

            if (result.error) {
                console.error(`❌ Failed to sync "${widget.title}":`, result.error.message || result.error);
            } else {
                const action = result.updated ? 'updated' : 'created';
                console.log(`✅ "${widget.title}" ${action} successfully! (ID: ${result.id})`);
            }
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
