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
        // Reverting to Test Mode for now (Ticket #1976916 needs further merchant verification)
        const isLive = false;
        this.secretKey = isLive
            ? process.env.PAYMOB_SECRET_KEY_LIVE
            : (process.env.PAYMOB_SECRET_KEY_TEST || 'egy_sk_test_8b1bd62800c456156d4f199f8e5ef2ddb5eafa744d47c18a5f376b41871c4097');
        this.publicKey = isLive
            ? process.env.PAYMOB_PUBLIC_KEY_LIVE
            : (process.env.PAYMOB_PUBLIC_KEY_TEST || 'egy_pk_test_YL3u4OZI0Q5tiCc3CNt4ZglCD2BKxhK0');
        this.cardIntegrationId = isLive
            ? parseInt(process.env.PAYMOB_CARD_INTEGRATION_ID_LIVE || '5550521', 10)
            : parseInt(process.env.PAYMOB_CARD_INTEGRATION_ID_TEST || '5555012', 10);
        this.walletIntegrationId = isLive
            ? parseInt(process.env.PAYMOB_WALLET_INTEGRATION_ID_LIVE || '5550523', 10)
            : parseInt(process.env.PAYMOB_WALLET_INTEGRATION_ID_TEST || '5560369', 10);
        this.hmacSecret = isLive
            ? process.env.PAYMOB_HMAC_SECRET_LIVE
            : (process.env.PAYMOB_HMAC_SECRET_TEST || 'F90FD1AA9AAA628C36F247CA0914EDD3');
        this.isLive = isLive;
        this.intentionBaseUrl = 'https://accept.paymob.com/v1/intention/';
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
    async createIntention({ amountCents, currency = 'EGP', integrationIds = [], billingData = {}, itemName = 'Purchase', redirectionUrl }) {
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
            redirection_url: redirectionUrl || 'https://www.notionarabs.com/payment/callback',
            notification_url: process.env.BACKEND_URL
                ? `${process.env.BACKEND_URL}/api/payments/callback`
                : 'https://notion-arabs-fe5b3f214071.herokuapp.com/api/payments/callback'
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

        try {
            console.log('📤 Sending Intention API request to Paymob...');
            console.log('🔹 Environment:', process.env.NODE_ENV || 'development');

            const logSafe = (val) => {
                if (!val) return 'MISSING';
                const s = String(val);
                if (s.length <= 8) return s;
                return `${s.substring(0, 4)}...${s.substring(s.length - 4)}`;
            };

            console.log('🔹 Config Debug:');
            console.log('  - Secret Key:', logSafe(this.secretKey));
            console.log('  - Public Key:', logSafe(this.publicKey));
            console.log('  - Card ID:', this.cardIntegrationId);
            console.log('  - Wallet ID:', this.walletIntegrationId);
            console.log('  - HMAC Secret:', logSafe(this.hmacSecret));
            console.log('  - Integration IDs sent:', requestBody.payment_methods);

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
            console.error('❌ Paymob Intention API Failed');
            if (error.response) {
                console.error('🔹 Status:', error.response.status);
                console.error('🔹 Response Data:', JSON.stringify(error.response.data, null, 2));
            } else {
                console.error('🔹 Error:', error.message);
            }
            const apiError = new Error('Failed to create Paymob payment intention');
            apiError.response = error.response;
            throw apiError;
        }
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
