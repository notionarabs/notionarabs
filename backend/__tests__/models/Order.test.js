'use strict';

/**
 * Unit tests for Order model — focused on the payment-critical methods.
 * Supabase is fully mocked; no network calls are made.
 */

// ---------------------------------------------------------------------------
// Mock supabase before importing any model that requires it
// ---------------------------------------------------------------------------
let _tableResults = {};

const makeChain = (tableName) => {
    const chain = {
        select:      () => chain,
        eq:          () => chain,
        in:          () => chain,
        limit:       () => chain,
        order:       () => chain,
        // Terminating calls that resolve the chain
        single:      () => Promise.resolve((_tableResults[tableName] || []).shift() || { data: null, error: null }),
        maybeSingle: () => Promise.resolve((_tableResults[tableName] || []).shift() || { data: null, error: null }),
        // insert/update/delete return chain so callers can do .insert().select().single()
        insert:      () => chain,
        update:      () => chain,
        delete:      () => chain,
        // Makes bare `await supabase.from(...).select(...)` work
        then: (resolve, reject) =>
            Promise.resolve((_tableResults[tableName] || []).shift() || { data: [], error: null })
                .then(resolve, reject),
    };
    return chain;
};

jest.mock('../../utils/supabase', () => ({
    from: jest.fn((table) => makeChain(table)),
}));

jest.mock('../../models/Template', () => ({
    findById: jest.fn().mockResolvedValue(null),
}));

const Order = require('../../models/Order');
const supabase = require('../../utils/supabase');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function queueResult(table, result) {
    if (!_tableResults[table]) _tableResults[table] = [];
    _tableResults[table].push(result);
}

beforeEach(() => {
    _tableResults = {};
    supabase.from.mockClear();
    // Restore default implementation after each test
    supabase.from.mockImplementation((table) => makeChain(table));
});

// ---------------------------------------------------------------------------
// Order.existsForTemplate()
// ---------------------------------------------------------------------------
describe('Order.existsForTemplate()', () => {
    it('returns false when user has no completed orders', async () => {
        queueResult('Order', { data: [], error: null });

        const result = await Order.existsForTemplate('user-1', 'tmpl-1');

        expect(result).toBe(false);
    });

    it('returns false when completed orders exist but none contain the template', async () => {
        queueResult('Order', { data: [{ id: 'order-1' }], error: null });
        queueResult('OrderItem', { data: [], error: null });

        const result = await Order.existsForTemplate('user-1', 'tmpl-1');

        expect(result).toBe(false);
    });

    it('returns true when template is found in a completed order', async () => {
        queueResult('Order', { data: [{ id: 'order-1' }], error: null });
        queueResult('OrderItem', { data: [{ id: 'item-1' }], error: null });

        const result = await Order.existsForTemplate('user-1', 'tmpl-1');

        expect(result).toBe(true);
    });

    it('returns false when Order query returns null data', async () => {
        queueResult('Order', { data: null, error: null });

        const result = await Order.existsForTemplate('user-1', 'tmpl-1');

        expect(result).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Order.create() — rollback on OrderItem failure
// ---------------------------------------------------------------------------
describe('Order.create() rollback', () => {
    it('throws and rolls back the order when OrderItem insert fails', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        // Order insert().select().single() → success
        queueResult('Order', { data: { id: 'new-order-id', userId: 'user-1', status: 'PENDING' }, error: null });
        // OrderItem insert → fails (consumed via `await chain` → chain.then())
        queueResult('OrderItem', { data: null, error: { message: 'DB constraint violation' } });
        // Rollback: Order delete().eq() — no result needed, chain just discards it

        await expect(Order.create({
            user: 'user-1',
            items: [{ templateId: 'tmpl-1', name: 'Test Template', price: 100 }],
            total: 100,
            status: 'PENDING'
        })).rejects.toThrow(/Failed to create order items/);
    });
});

// ---------------------------------------------------------------------------
// Order.completePending()
// ---------------------------------------------------------------------------
describe('Order.completePending()', () => {
    it('returns null if order is not found in PENDING status', async () => {
        queueResult('Order', { data: null, error: null });

        const result = await Order.completePending('non-existent-order', {
            paymentId: 'pay-1',
            paymobOrderId: 'paymob-1'
        });

        expect(result).toBeNull();
    });

    it('updates status and returns a populated Order instance on success', async () => {
        const orderData = { id: 'order-123', userId: 'user-1', status: 'COMPLETED' };
        const itemData = [{ id: 'item-1', orderId: 'order-123', templateId: 'tmpl-1', name: 'Test', price: 10 }];
        
        queueResult('Order', { data: orderData, error: null });
        queueResult('OrderItem', { data: itemData, error: null });

        const result = await Order.completePending('order-123', {
            paymentId: 'pay-123',
            paymobOrderId: 'paymob-123'
        });

        expect(result).toBeInstanceOf(Order);
        expect(result.status).toBe('COMPLETED');
        expect(result.items).toHaveLength(1);
    });
});
