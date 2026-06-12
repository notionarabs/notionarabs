'use strict';

/**
 * Unit tests for PaymobService — HMAC verification and retry logic.
 * Axios is mocked; no real HTTP calls are made.
 * setTimeout is spied upon to run instantly so retry delays don't slow tests.
 */

// jest.mock is hoisted before any require() calls, so axios will be mocked
// when paymobService's constructor runs.
jest.mock('axios');

// Set required env vars before paymobService is loaded
process.env.PAYMOB_SECRET_KEY_TEST = 'test-secret-key-1234';
process.env.PAYMOB_PUBLIC_KEY_TEST = 'pk-test-public-key-1234';
process.env.PAYMOB_HMAC_SECRET_TEST = 'hmac-test-secret-5678';
process.env.PAYMOB_CARD_INTEGRATION_ID_TEST = '123456';

const axios = require('axios');
const paymobService = require('../../services/paymobService');

beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // Make setTimeout fire immediately so retry delays don't block tests
    jest.spyOn(global, 'setTimeout').mockImplementation((cb) => { cb(); return 0; });
});

afterEach(() => {
    jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// verifyTransactionHmac()
// ---------------------------------------------------------------------------
describe('verifyTransactionHmac()', () => {
    it('returns true for a valid HMAC', () => {
        const crypto = require('crypto');
        const params = { amount_cents: '100', success: 'true', order: '999' };
        const sorted = Object.keys(params).sort();
        const concatenated = sorted.map(k => params[k]).join('');
        const expected = crypto
            .createHmac('sha512', 'hmac-test-secret-5678')
            .update(concatenated)
            .digest('hex');

        expect(paymobService.verifyTransactionHmac(params, expected)).toBe(true);
    });

    it('returns false for a tampered HMAC', () => {
        const params = { amount_cents: '100', success: 'true' };
        expect(paymobService.verifyTransactionHmac(params, 'bad-hmac-value')).toBe(false);
    });

    it('excludes the "hmac" key from the concatenated string', () => {
        const crypto = require('crypto');
        const params = { amount_cents: '50', success: 'false', hmac: 'should-be-ignored' };
        const dataOnly = { amount_cents: '50', success: 'false' };
        const sorted = Object.keys(dataOnly).sort();
        const concatenated = sorted.map(k => dataOnly[k]).join('');
        const expected = crypto
            .createHmac('sha512', 'hmac-test-secret-5678')
            .update(concatenated)
            .digest('hex');

        expect(paymobService.verifyTransactionHmac(params, expected)).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// createIntention() — retry logic
// ---------------------------------------------------------------------------
describe('createIntention() retry logic', () => {
    const baseArgs = {
        amountCents: 5000,
        currency: 'EGP',
        billingData: { firstName: 'Test', lastName: 'User', email: 'test@example.com', phone: '01012345678' },
        itemName: 'test-template',
        redirectionUrl: 'https://example.com/callback',
        extras: {}
    };

    it('succeeds on first attempt without retrying', async () => {
        axios.post.mockResolvedValueOnce({ data: { client_secret: 'cs_test_abc123' } });

        const result = await paymobService.createIntention(baseArgs);

        expect(result.clientSecret).toBe('cs_test_abc123');
        expect(axios.post).toHaveBeenCalledTimes(1);
    });

    it('retries on 503 and succeeds on the second attempt', async () => {
        const networkError = { response: { status: 503, data: {} }, message: '503' };
        axios.post
            .mockRejectedValueOnce(networkError)
            .mockResolvedValueOnce({ data: { client_secret: 'cs_retry_success' } });

        const result = await paymobService.createIntention(baseArgs);

        expect(result.clientSecret).toBe('cs_retry_success');
        expect(axios.post).toHaveBeenCalledTimes(2);
    });

    it('does NOT retry on 400 (client error)', async () => {
        const clientError = { response: { status: 400, data: { message: 'Bad Request' } }, message: '400' };
        axios.post.mockRejectedValueOnce(clientError);

        await expect(paymobService.createIntention(baseArgs)).rejects.toThrow();
        expect(axios.post).toHaveBeenCalledTimes(1);
    });

    it('exhausts all retries on persistent 503 and throws', async () => {
        const networkError = { response: { status: 503, data: {} }, message: '503' };
        axios.post
            .mockRejectedValueOnce(networkError)
            .mockRejectedValueOnce(networkError)
            .mockRejectedValueOnce(networkError);

        await expect(paymobService.createIntention(baseArgs)).rejects.toThrow();
        expect(axios.post).toHaveBeenCalledTimes(3);
    });
});
