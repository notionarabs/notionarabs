'use strict';

/**
 * Unit tests for PaymentLog.record() — verifies the graceful fallback
 * to console.log when the Supabase insert fails.
 */

jest.mock('../../utils/supabase', () => ({
    from: jest.fn(),
}));

const supabase = require('../../utils/supabase');
const PaymentLog = require('../../models/PaymentLog');

describe('PaymentLog.record()', () => {
    it('inserts a structured log entry into Supabase on success', async () => {
        supabase.from.mockReturnValue({
            insert: jest.fn().mockResolvedValue({ error: null })
        });

        await PaymentLog.record({ event: 'INITIATED', userId: 'u1', orderId: 'o1', amount: 100 });

        expect(supabase.from).toHaveBeenCalledWith('PaymentLog');
    });

    it('falls back to console.log when Supabase insert throws', async () => {
        supabase.from.mockReturnValue({
            insert: jest.fn().mockResolvedValue({ error: new Error('DB down') })
        });

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        await PaymentLog.record({ event: 'COMPLETED', userId: 'u2', orderId: 'o2', amount: 200 });

        expect(consoleSpy).toHaveBeenCalledWith('[PAYMENT_LOG]', expect.stringContaining('COMPLETED'));
        consoleSpy.mockRestore();
    });

    it('includes all required fields in the logged entry', async () => {
        supabase.from.mockReturnValue({
            insert: jest.fn().mockRejectedValue(new Error('connection refused'))
        });

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        await PaymentLog.record({
            event: 'FAILED',
            userId: 'u3',
            orderId: 'o3',
            templateId: 'tmpl-xyz',
            amount: 350,
            reason: 'webhook: success=false'
        });

        const loggedJson = JSON.parse(consoleSpy.mock.calls[0][1]);
        expect(loggedJson.event).toBe('FAILED');
        expect(loggedJson.userId).toBe('u3');
        expect(loggedJson.amount).toBe(350);
        expect(loggedJson.reason).toBe('webhook: success=false');
        expect(loggedJson.createdAt).toBeDefined();

        consoleSpy.mockRestore();
    });
});
