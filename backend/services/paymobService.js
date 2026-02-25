const axios = require('axios');
const crypto = require('crypto');

/**
 * Service to handle Paymob payment integration
 */
class PaymobService {
    constructor() {
        this.apiKey = process.env.PAYMOB_API_KEY;
        this.baseUrl = 'https://accept.paymob.com/api';
        this.token = null;
        this.tokenExpiry = null;
    }

    /**
     * Step 1: Authenticate with Paymob and get an auth token
     * This token is used for subsequent requests.
     * @returns {Promise<string>} The auth token
     */
    async authenticate() {
        if (!this.apiKey) {
            console.error('❌ PAYMOB_API_KEY is missing in environment variables');
            throw new Error('Paymob configuration error: API Key missing');
        }

        try {
            // Check if we have a valid cached token (Paymob tokens are usually valid for 1 hour)
            if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
                return this.token;
            }

            console.log('🔄 Authenticating with Paymob...');
            const response = await axios.post(`${this.baseUrl}/auth/tokens`, {
                api_key: this.apiKey,
            });

            if (response.data && response.data.token) {
                this.token = response.data.token;
                // Cache token for 50 minutes to be safe
                this.tokenExpiry = new Date(new Date().getTime() + 50 * 60 * 1000);
                console.log('✅ Paymob authentication successful');
                return this.token;
            }

            throw new Error('Auth token not found in Paymob response');
        } catch (error) {
            console.error('❌ Paymob Authentication Failed:', error.response?.data || error.message);
            const apiError = new Error('Paymob authentication failed');
            apiError.response = error.response;
            throw apiError;
        }
    }

    /**
     * Step 2: Register an order with Paymob
     * @param {string} authToken - The auth token from authenticate()
     * @param {Object} orderData - Order details
     * @returns {Promise<number>} The Paymob order ID
     */
    async registerOrder(authToken, { amountCents, currency = 'EGP', items = [], merchantOrderId = '' }) {
        try {
            console.log(`🔄 Registering order with Paymob for ${amountCents} cents...`);
            const response = await axios.post(`${this.baseUrl}/ecommerce/orders`, {
                auth_token: authToken,
                delivery_needed: false,
                amount_cents: amountCents,
                currency: currency,
                terminal_id: null,
                merchant_order_id: merchantOrderId || undefined,
                items: items
            });

            console.log('✅ Paymob order registered. ID:', response.data.id);
            return response.data.id;
        } catch (error) {
            console.error('❌ Paymob Order Registration Failed:', error.response?.data || error.message);
            const apiError = new Error('Failed to register order with Paymob');
            apiError.response = error.response;
            throw apiError;
        }
    }

    /**
     * Step 3: Get a payment key for the checkout
     * @param {string} authToken - The auth token from authenticate()
     * @param {number} orderId - The order ID from registerOrder()
     * @param {Object} paymentData - Payment details
     * @returns {Promise<string>} The payment key token (used in the iframe)
     */
    async getPaymentKey(authToken, orderId, { amountCents, currency = 'EGP', expiration = 3600, billingData, integrationId }) {
        try {
            console.log(`🔄 Requesting payment key for order ${orderId}...`);

            const billingDataToUse = billingData || {};

            // Paymob's UI often crashes if billing names contain Arabic characters
            // We sanitize to English placeholders for the gateway only
            const sanitizeName = (name, fallback) => {
                if (!name) return fallback;
                // If contains non-Latin characters, use fallback
                return /[^\x00-\x7F]/.test(name) ? fallback : name;
            };

            const normalizedBillingData = {
                apartment: '1',
                email: billingDataToUse.email || 'customer@notionarabs.com',
                floor: '1',
                first_name: sanitizeName(billingDataToUse.firstName, 'NotionArabs'),
                street: 'StreetName',
                building: '1',
                phone_number: (billingDataToUse.phone || '01012345678').replace(/\D/g, ''),
                shipping_method: 'PKG',
                postal_code: '11511',
                city: 'Cairo',
                country: 'EG',
                last_name: sanitizeName(billingDataToUse.lastName, 'Member'),
                state: 'Cairo'
            };

            const requestBody = {
                auth_token: authToken,
                amount_cents: Number(amountCents),
                expiration: Number(expiration),
                order_id: Number(orderId),
                billing_data: normalizedBillingData,
                shipping_data: normalizedBillingData,
                items: [
                    {
                        name: "Purchase",
                        amount_cents: Number(amountCents),
                        quantity: 1,
                        description: "Digital Template"
                    }
                ],
                currency: currency,
                integration_id: Number(integrationId),
                lock_order_when_paid: false,
                redirection_url: `${process.env.FRONTEND_URL}/payment-success?id=${orderId}`
            };


            console.log('📤 Sending to Paymob /payment_keys:', JSON.stringify(requestBody, null, 2));

            const response = await axios.post(`${this.baseUrl}/acceptance/payment_keys`, requestBody);

            console.log('✅ Paymob payment key generated');
            return response.data.token;
        } catch (error) {
            console.error('❌ Paymob Payment Key Failed:', error.response?.data || error.message);
            const apiError = new Error('Failed to generate Paymob payment key');
            apiError.response = error.response; // Attach original response for the route handler
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

        // Paymob HMAC V1 / V2 fields order is specific
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

        // Sort keys alphabetically as required for transaction HMAC
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
