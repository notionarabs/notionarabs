const supabase = require('../utils/supabase');
const crypto = require('crypto');

/**
 * Lightweight payment audit log.
 * Falls back to structured console output if the Supabase table doesn't exist yet,
 * so events are never silently lost.
 *
 * Required Supabase table (create once):
 *   CREATE TABLE "PaymentLog" (
 *     id TEXT PRIMARY KEY,
 *     event TEXT NOT NULL,
 *     "userId" TEXT,
 *     "orderId" TEXT,
 *     "templateId" TEXT,
 *     amount NUMERIC,
 *     reason TEXT,
 *     "createdAt" TIMESTAMPTZ DEFAULT NOW()
 *   );
 */
class PaymentLog {
    static async record({ event, userId = null, orderId = null, templateId = null, amount = null, reason = null }) {
        const entry = {
            id: crypto.randomBytes(12).toString('hex'),
            event,
            userId: userId ? userId.toString() : null,
            orderId: orderId ? orderId.toString() : null,
            templateId: templateId ? templateId.toString() : null,
            amount,
            reason,
            createdAt: new Date().toISOString()
        };

        try {
            const { error } = await supabase.from('PaymentLog').insert([entry]);
            if (error) throw error;
        } catch (_) {
            console.log('[PAYMENT_LOG]', JSON.stringify(entry));
        }
    }
}

module.exports = PaymentLog;
