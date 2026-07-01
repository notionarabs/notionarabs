const cron = require('node-cron');
const supabase = require('../utils/supabase');
const PaymentLog = require('../models/PaymentLog');

const PENDING_TTL_HOURS = 2;

async function expirePendingOrders() {
    try {
        const cutoff = new Date(Date.now() - PENDING_TTL_HOURS * 60 * 60 * 1000).toISOString();

        const { data: expired, error } = await supabase
            .from('Order')
            .update({ status: 'CANCELLED', updatedAt: new Date().toISOString() })
            .eq('status', 'PENDING')
            .lt('createdAt', cutoff)
            .select('id, userId, total');

        if (error) {
            console.error('❌ expirePendingOrders query failed:', error);
            return;
        }

        if (!expired || expired.length === 0) return;

        console.log(`🕐 Expired ${expired.length} stale PENDING order(s)`);

        for (const order of expired) {
            PaymentLog.record({
                event: 'EXPIRED',
                userId: order.userId,
                orderId: order.id,
                amount: order.total,
                reason: `No payment received within ${PENDING_TTL_HOURS}h`
            }).catch(() => {});
        }

    } catch (err) {
        console.error('❌ expirePendingOrders job error:', err);
    }
}

function scheduleOrderExpiry() {
    expirePendingOrders();
    // Check every hour
    cron.schedule('0 * * * *', expirePendingOrders);
    console.log('📅 Pending order expiry job scheduled (hourly)');
}

module.exports = { scheduleOrderExpiry, expirePendingOrders };
