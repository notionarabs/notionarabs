const express = require('express');
const router = express.Router();
const paymobService = require('../services/paymobService');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Template = require('../models/Template');

/**
 * @route   POST /api/payments/create-checkout-session
 * @desc    Create a Paymob checkout session (Token -> Order -> Payment Key)
 * @access  Private
 */
router.post('/create-checkout-session', auth, async (req, res) => {
    try {
        const { templateId } = req.body;

        // 1. Validate template
        const template = await Template.findById(templateId);
        if (!template) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }

        if (!template.isPaid || !template.price) {
            return res.status(400).json({ success: false, message: 'This template is free' });
        }

        const amountCents = Math.round(template.price * 100); // Paymob works with cents/paisa

        // 2. Paymob Flow - Step 1: Auth
        const authToken = await paymobService.authenticate();

        const paymobOrderId = await paymobService.registerOrder(authToken, {
            amountCents,
            currency: 'EGP',
            merchantOrderId: `${Date.now()}`.slice(-10), // Purely numeric for MIGS
            items: [
                {
                    name: template.title.substring(0, 100),
                    amount_cents: amountCents,
                    quantity: 1,
                    description: `Purchase of ${template.title}`.substring(0, 250)
                }
            ]
        });

        // 4. Paymob Flow - Step 3: Get Payment Key
        // Use the ID from your .env file (e.g., 5550523 for Wallets or 5550521 for Cards)
        const integrationId = process.env.PAYMOB_INTEGRATION_ID_ONLINE || 5550523;

        console.log(`🚀 Initiating payment for Integration ID: ${integrationId}`);

        // Prepare billing data from user profile
        const billingData = {
            firstName: req.user.name?.split(' ')[0] || 'Guest',
            lastName: req.user.name?.split(' ').slice(1).join(' ') || 'User',
            email: req.user.email,
            phone: req.user.phone || '01012345678', // Paymob requires a valid phone number
            itemName: template.title
        };

        const paymentKey = await paymobService.getPaymentKey(authToken, paymobOrderId, {
            amountCents,
            currency: 'EGP',
            integrationId: parseInt(integrationId),
            billingData
        });

        console.log('✅ Payment key received');

        // 5. Create a pending order in our system
        const order = new Order({
            user: req.user.id,
            items: [{
                templateId: template._id,
                name: template.title,
                price: template.price
            }],
            total: template.price,
            status: 'pending',
            paymobOrderId: paymobOrderId.toString(),
            source: 'purchase',
            paymentMethod: 'card'
        });

        await order.save();

        res.json({
            success: true,
            paymentKey,
            paymobOrderId: paymobOrderId.toString(),
            // Unified Checkout REDIRECT flow
            checkoutUrl: `https://accept.paymob.com/unifiedcheckout/?pulse_token=${paymentKey}`
        });


    } catch (error) {
        console.error('Checkout Session Error:', error);

        let errorMessage = error.message;
        let detailedError = error.response?.data;

        // Extract deep error message if available
        let reason = 'Unknown error';
        if (detailedError) {
            if (Array.isArray(detailedError)) reason = detailedError.join(', ');
            else if (typeof detailedError === 'object') reason = JSON.stringify(detailedError);
            else reason = String(detailedError);
        }

        res.status(500).json({
            success: false,
            message: `Payment failed: ${reason}`,
            error: errorMessage,
            details: detailedError,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }

});

/**
 * @route   GET /api/payments/test-auth
 * @desc    Test Paymob authentication functionality
 * @access  Private (Admin only recommended)
 */
router.get('/test-auth', auth, async (req, res) => {
    try {
        const token = await paymobService.authenticate();
        res.json({
            success: true,
            message: 'Paymob authentication working',
            tokenPreview: token.substring(0, 15) + '...'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Paymob authentication failed',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/payments/callback
 * @desc    Paymob Webhook Callback - Handles payment status updates
 * @access  Public (Verified via HMAC)
 */
router.post('/callback', async (req, res) => {
    try {
        const { obj, type } = req.body;
        const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
        const receivedHmac = req.query.hmac;

        console.log(`📩 Paymob Webhook Received: Type=${type}`);

        // 1. Verify HMAC for security
        const calculatedHmac = paymobService.calculateHmac(obj, hmacSecret);

        if (calculatedHmac !== receivedHmac) {
            console.error('❌ Paymob HMAC verification failed');
            return res.status(401).json({ success: false, message: 'Invalid HMAC signature' });
        }

        // 2. Process transaction
        if (type === 'TRANSACTION') {
            const paymobOrderId = obj.order.id;
            const success = obj.success;

            // Find original order in our DB
            const order = await Order.findOne({ paymobOrderId: paymobOrderId.toString() });

            if (!order) {
                console.error(`❌ Order not found for Paymob ID: ${paymobOrderId}`);
                return res.status(404).end();
            }

            if (success === true || success === 'true') {
                console.log(`✅ Payment successful for Order: ${order._id}`);
                order.status = 'completed';
                order.paymentId = obj.id.toString();
                order.paymentMethod = obj.payment_key_claims?.integration_id === process.env.PAYMOB_INTEGRATION_ID_ONLINE ? 'card' : 'paymob';
                await order.save();

                // TODO: Send confirmation email or grant access
            } else {
                console.log(`⚠️ Payment failed for Order: ${order._id}`);
                order.status = 'cancelled';
                await order.save();
            }
        }

        // Always return 200 to acknowledge receipt
        res.status(200).json({ success: true });

    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).end();
    }
});

module.exports = router;
