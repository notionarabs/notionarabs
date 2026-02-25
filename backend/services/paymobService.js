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
        this.secretKey = process.env.PAYMOB_SECRET_KEY;
        this.publicKey = process.env.PAYMOB_PUBLIC_KEY;
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
            redirection_url: redirectionUrl || 'https://www.notionarabs.com/payment/callback'
        };

        // Only specify payment_methods if we have valid IDs
        // If omitted, Paymob will show ALL available methods for this account
        if (integrationIds.length > 0) {
            requestBody.payment_methods = integrationIds.map(Number);
            console.log('💳 Payment methods (integration IDs):', requestBody.payment_methods);
        } else {
            console.log('💳 No integration IDs specified — Paymob will show all available methods');
        }

        try {
            console.log('📤 Sending Intention API request to Paymob...');
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
            console.error('❌ Paymob Intention API Failed:', error.response?.data || error.message);
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
        const hmacSecret = process.env.PAYMOB_HMAC_SECRET;

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
