const cron = require('node-cron');
const supabase = require('../utils/supabase');
const { invalidateCache } = require('../utils/redis-cache');

async function expireBoosts() {
    try {
        const { data: pinned, error } = await supabase
            .from('Template')
            .select('id, pinnedAt, pinnedById')
            .eq('isPinned', true);

        if (error) {
            console.error('❌ Boost expiry query failed:', error);
            return;
        }

        if (!pinned || pinned.length === 0) return;

        const now = new Date();
        const expiredIds = pinned
            .filter(t => {
                if (!t.pinnedAt || !t.pinnedById) return false;
                const match = String(t.pinnedById).match(/^boost_(\d+)$/);
                if (!match) return false;
                const expiresAt = new Date(t.pinnedAt);
                expiresAt.setDate(expiresAt.getDate() + parseInt(match[1], 10));
                return now >= expiresAt;
            })
            .map(t => t.id);

        if (expiredIds.length === 0) return;

        const { error: updateError } = await supabase
            .from('Template')
            .update({ isPinned: false, pinnedAt: null, pinnedById: null })
            .in('id', expiredIds);

        if (updateError) {
            console.error('❌ Failed to unpin expired boosts:', updateError);
            return;
        }

        console.log(`✅ Unpinned ${expiredIds.length} expired boost(s)`);
        try { await invalidateCache('template'); } catch (_) {}

    } catch (err) {
        console.error('❌ expireBoosts job error:', err);
    }
}

function scheduleBoostExpiry() {
    // Run once at startup to catch anything that expired during downtime
    expireBoosts();
    // Then daily at 00:05
    cron.schedule('5 0 * * *', expireBoosts);
    console.log('📅 Boost expiry job scheduled (daily at 00:05)');
}

module.exports = { scheduleBoostExpiry, expireBoosts };
