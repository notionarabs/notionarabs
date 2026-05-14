require('dotenv').config();
const supabase = require('../utils/supabase');

async function clearTemplateRecords() {
    try {
        console.log('🔍 Searching for exact template "العقل الثاني + مركز المال - النسخة المتقدمة"...');
        const { data: templates, error: searchErr } = await supabase
            .from('Template')
            .select('*')
            .eq('title', 'العقل الثاني + مركز المال - النسخة المتقدمة');

        if (searchErr) {
            throw searchErr;
        }

        if (!templates || templates.length === 0) {
            console.log('⚠️ No matching template found.');
            return;
        }

        for (const template of templates) {
            console.log(`\n==================================================`);
            console.log(`🎯 Found Template: "${template.title}" (ID: ${template.id})`);

            // 1. Clear DownloadLogs
            console.log(`🗑️ Deleting DownloadLogs for template ID: ${template.id}...`);
            const { error: dlErr } = await supabase
                .from('DownloadLog')
                .delete()
                .eq('templateId', template.id);
            if (dlErr) console.error('Error deleting DownloadLog:', dlErr);
            else console.log('✅ DownloadLogs deleted successfully.');

            // 2. Clear Notifications
            console.log(`🗑️ Deleting Notifications mentioning template...`);
            // Delete by title/message matching
            const { error: notifErr } = await supabase
                .from('Notification')
                .delete()
                .ilike('message', `%${template.title}%`);
            if (notifErr) console.error('Error deleting Notifications:', notifErr);
            else console.log('✅ Notifications deleted successfully.');

            // Also try deleting by metadata->templateId if possible
            try {
                // In Supabase JSONB filtering: metadata->>'templateId'
                const { error: notifMetaErr } = await supabase
                    .from('Notification')
                    .delete()
                    .eq('metadata->>templateId', template.id);
                if (!notifMetaErr) console.log('✅ Additional metadata notifications checked.');
            } catch (e) {
                // Ignore if jsonb syntax not supported or no matching rows
            }

            // 3. Clear OrderItems
            console.log(`🗑️ Deleting OrderItems for template ID: ${template.id}...`);
            const { data: orderItems, error: oiErr } = await supabase
                .from('OrderItem')
                .delete()
                .eq('templateId', template.id)
                .select();
            if (oiErr) console.error('Error deleting OrderItems:', oiErr);
            else {
                console.log(`✅ OrderItems deleted (${orderItems?.length || 0} items).`);
                // If there were order items, check if any parent Orders are now empty
                if (orderItems && orderItems.length > 0) {
                    for (const oi of orderItems) {
                        if (oi.orderId) {
                            // Check if order has any remaining items
                            const { data: remainingItems } = await supabase
                                .from('OrderItem')
                                .select('id')
                                .eq('orderId', oi.orderId);
                            if (!remainingItems || remainingItems.length === 0) {
                                console.log(`🗑️ Deleting empty Order ID: ${oi.orderId}...`);
                                await supabase.from('Order').delete().eq('id', oi.orderId);
                            }
                        }
                    }
                }
            }

            // 4. Reset Template Downloads and Views
            console.log(`🔄 Resetting downloads count on Template ID: ${template.id}...`);
            const { error: updateErr } = await supabase
                .from('Template')
                .update({ downloads: 0 })
                .eq('id', template.id);
            if (updateErr) console.error('Error updating template:', updateErr);
            else console.log('✅ Template downloads reset to 0.');
            console.log(`==================================================\n`);
        }

        console.log('🎉 Cleanup process completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
}

clearTemplateRecords();
