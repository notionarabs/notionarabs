const axios = require('axios');
const crypto = require('crypto');

/**
 * Service to handle Paymob payment integration
 * Uses the new Intention API (v1) — iFrames and legacy 3-step flow are deprecated by Paymob.
 *
 * Flow:
 *   1. POST /v1/intention/ → get client_secret
 *   2. Redirect to https://accept.paymob.com/unifiedcheckout/?publicKey=<pk>&clientSecret=<cs>
 */
class PaymobService {

    constructor() {
        const isLive = process.env.NODE_ENV === 'production';
        const suffix = isLive ? 'LIVE' : 'TEST';

        this.apiKey = process.env[`PAYMOB_API_KEY_${suffix}`];
        this.secretKey = process.env[`PAYMOB_SECRET_KEY_${suffix}`];
        this.publicKey = process.env[`PAYMOB_PUBLIC_KEY_${suffix}`];
        this.cardIntegrationId = parseInt(process.env[`PAYMOB_CARD_INTEGRATION_ID_${suffix}`] || '0', 10);
        this.walletIntegrationId = parseInt(process.env[`PAYMOB_WALLET_INTEGRATION_ID_${suffix}`] || '0', 10);
        this.hmacSecret = process.env[`PAYMOB_HMAC_SECRET_${suffix}`];
        this.isLive = isLive;
        this.intentionBaseUrl = 'https://accept.paymob.com/v1/intention/';

        console.log(`💳 Paymob initialised in ${isLive ? '🟢 LIVE' : '🔵 TEST'} mode`);

        const required = [`PAYMOB_SECRET_KEY_${suffix}`, `PAYMOB_PUBLIC_KEY_${suffix}`, `PAYMOB_HMAC_SECRET_${suffix}`];
        const missing = required.filter(k => !process.env[k]);
        if (missing.length) {
            console.error(`❌ Missing required Paymob env vars: ${missing.join(', ')}`);
        }
    }

    /**
     * Sanitize a name to ASCII only (Paymob billing data rejects Arabic characters)
     */
    _sanitizeName(name, fallback) {
        if (!name) return fallback;
        return /[^\x00-\x7F]/.test(name) ? fallback : name;
    }

    /**
     * Create a payment intention using the Paymob Intention API (v1)
     * @param {Object} options
     * @returns {Promise<string>} client_secret for the unified checkout URL
     */
    async createIntention({ amountCents, currency = 'EGP', integrationIds = [], billingData = {}, itemName = 'Purchase', redirectionUrl, extras }) {
        if (!this.secretKey) {
            console.error('❌ PAYMOB_SECRET_KEY is missing in environment variables');
            throw new Error('Paymob configuration error: Secret Key missing');
        }

        if (!this.publicKey) {
            console.error('❌ PAYMOB_PUBLIC_KEY is missing in environment variables');
            throw new Error('Paymob configuration error: Public Key missing');
        }

        const firstName = this._sanitizeName(billingData.firstName, 'Notion');
        const lastName = this._sanitizeName(billingData.lastName, 'Member');
        const phone = (billingData.phone || '01012345678').replace(/\D/g, '');
        const email = billingData.email || 'customer@notionarabs.com';
        const amount = Math.round(amountCents);

        const requestBody = {
            amount: amount,
            currency: currency,
            redirection_url: redirectionUrl,
            items: [
                {
                    name: (itemName || 'Purchase').substring(0, 50),
                    amount: amount,
                    description: 'Digital Template',
                    quantity: 1
                }
            ],
            billing_data: {
                apartment: '1',
                email: email,
                floor: '1',
                first_name: firstName,
                street: 'Nasr Street',
                building: '1',
                phone_number: phone,
                shipping_method: 'PKG',
                postal_code: '11511',
                city: 'Cairo',
                country: 'EG',
                last_name: lastName,
                state: 'Cairo'
            },
            customer: {
                first_name: firstName,
                last_name: lastName,
                email: email
            },
            extras: extras || {}
        };

        // Paymob Intention API (v1) REQUIRES payment_methods to be an array of integration IDs.
        // If integrationIds are passed to this function, use them. Otherwise use the defaults from constructor.
        if (integrationIds && integrationIds.length > 0) {
            requestBody.payment_methods = integrationIds.map(Number);
        } else if (this.cardIntegrationId || this.walletIntegrationId) {
            requestBody.payment_methods = [];
            if (this.cardIntegrationId) requestBody.payment_methods.push(Number(this.cardIntegrationId));
            if (this.walletIntegrationId) requestBody.payment_methods.push(Number(this.walletIntegrationId));
        }

        if (!requestBody.payment_methods || requestBody.payment_methods.length === 0) {
            console.error('❌ No payment methods found. Paymob requires at least one integration ID.');
            throw new Error('Payment configuration error: No integration IDs');
        }

        const logSafe = (val) => {
            if (!val) return 'MISSING';
            const s = String(val);
            if (s.length <= 8) return s;
            return `${s.substring(0, 4)}...${s.substring(s.length - 4)}`;
        };

        console.log('📤 Sending Intention API request to Paymob...');
        console.log('🔹 Environment:', process.env.NODE_ENV || 'development');
        console.log('🔹 Config Debug:');
        console.log('  - Secret Key:', logSafe(this.secretKey));
        console.log('  - Public Key:', logSafe(this.publicKey));
        console.log('  - Card ID:', this.cardIntegrationId);
        console.log('  - Wallet ID:', this.walletIntegrationId);
        console.log('  - HMAC Secret:', logSafe(this.hmacSecret));
        console.log('  - Integration IDs sent:', requestBody.payment_methods);

        const MAX_RETRIES = 2;
        let lastError;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            if (attempt > 0) {
                await new Promise(r => setTimeout(r, 500 * attempt));
                console.warn(`⚠️ Paymob retry attempt ${attempt}/${MAX_RETRIES}...`);
            }
            try {
                const response = await axios.post(this.intentionBaseUrl, requestBody, {
                    headers: {
                        'Authorization': `Token ${this.secretKey}`,
                        'Content-Type': 'application/json'
                    }
                });

                const clientSecret = response.data.client_secret;
                if (!clientSecret) {
                    throw new Error('client_secret not found in Paymob Intention API response');
                }

                console.log('✅ Paymob Intention created. client_secret received.');
                return { clientSecret, publicKey: this.publicKey };

            } catch (error) {
                lastError = error;
                // Don't retry on 4xx — those are configuration/auth errors that won't recover
                if (error.response && error.response.status >= 400 && error.response.status < 500) {
                    break;
                }
            }
        }

        console.error('❌ Paymob Intention API Failed');
        if (lastError.response) {
            console.error('🔹 Status:', lastError.response.status);
            console.error('🔹 Response Data:', JSON.stringify(lastError.response.data, null, 2));
        } else {
            console.error('🔹 Error:', lastError.message);
        }
        const apiError = new Error(lastError.message || 'Failed to create Paymob payment intention');
        apiError.response = lastError.response;
        apiError.details = lastError.response?.data || lastError.message;
        throw apiError;
    }

    /**
     * Calculate HMAC for Paymob webhook verification
     * @param {Object} data - The data from Paymob webhook (obj)
     * @param {string} hmacSecret - Your Paymob HMAC secret
     * @returns {string} The calculated HMAC
     */
    calculateHmac(data, hmacSecret) {
        const {
            amount_cents,
            created_at,
            currency,
            error_occured,
            has_parent_transaction,
            id,
            integration_id,
            is_3d_secure,
            is_auth,
            is_capture,
            is_refunded,
            is_standalone_payment,
            is_voided,
            order: { id: order_id },
            owner,
            pending,
            source_data: {
                pan: source_pan,
                sub_type: source_sub_type,
                type: source_type
            },
            success
        } = data;

        const concatenatedString =
            amount_cents +
            created_at +
            currency +
            error_occured +
            has_parent_transaction +
            id +
            integration_id +
            is_3d_secure +
            is_auth +
            is_capture +
            is_refunded +
            is_standalone_payment +
            is_voided +
            order_id +
            owner +
            pending +
            source_pan +
            source_sub_type +
            source_type +
            success;

        return crypto
            .createHmac('sha512', hmacSecret)
            .update(concatenatedString)
            .digest('hex');
    }

    /**
     * Verify if the webhook request is valid
     * @param {Object} query - The query parameters from Paymob (for transaction HMAC)
     * @param {string} hmacFromRequest - The HMAC provided by Paymob
     * @returns {boolean} True if verified
     */
    verifyTransactionHmac(query, hmacFromRequest) {
        const hmacSecret = this.hmacSecret;

        if (!hmacSecret) {
            console.error('❌ PAYMOB_HMAC_SECRET is missing');
            return false;
        }

        const keys = Object.keys(query).sort();
        let concatenatedString = '';

        keys.forEach(key => {
            if (key !== 'hmac') {
                concatenatedString += query[key];
            }
        });

        const calculatedHmac = crypto
            .createHmac('sha512', hmacSecret)
            .update(concatenatedString)
            .digest('hex');

        return calculatedHmac === hmacFromRequest;
    }
}

module.exports = new PaymobService();
