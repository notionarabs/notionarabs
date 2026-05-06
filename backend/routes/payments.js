const express = require('express');
const router = express.Router();
const paymobService = require('../services/paymobService');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Template = require('../models/Template');

/**
 * @route   POST /api/payments/create-checkout-session
 * @desc    Create a Paymob Unified Checkout session via Intention API
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

        const amountCents = Math.round(template.price * 100); // Paymob works in cents
 
        // Clean title for Paymob (ASCII only or fallback to ID)
        // Paymob Intention API can be picky about special chars
        const cleanTitle = template.slug || 'Template-' + templateId.substring(0, 5);

        // 2. Prepare billing data
        const billingData = {
            firstName: req.user.name?.split(' ')[0] || 'Notion',
            lastName: req.user.name?.split(' ').slice(1).join(' ') || 'Member',
            email: req.user.email,
            phone: req.user.phone || '01012345678'
        };

        // 3. Create order in our DB (pending) before redirecting to payment
        const userId = req.user.id || req.user._id;
        const templateDbId = template.id || template._id;
        
        const order = new Order({
            user: userId,
            items: [{
                templateId: templateDbId,
                name: template.title,
                price: template.price
            }],
            total: template.price,
            status: 'PENDING',
            source: 'purchase',
            paymentMethod: 'CARD'
        });

        await order.save();
        const finalOrderId = (order.id || order._id).toString();

        // 4. Use Paymob Intention API (new unified checkout)
        // Automatically picks TEST or LIVE integration based on NODE_ENV

        const frontendUrl = process.env.FRONTEND_URL || 'https://www.notionarabs.com';

        const { clientSecret, publicKey } = await paymobService.createIntention({
            amountCents,
            currency: 'EGP',
            billingData,
            itemName: cleanTitle,
            redirectionUrl: `${frontendUrl}/payment/callback`
        });

        // 5. Build the Unified Checkout URL
        const checkoutUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${publicKey}&clientSecret=${clientSecret}`;

        res.json({
            success: true,
            checkoutUrl,
            orderId: finalOrderId
        });

    } catch (error) {
        console.error('Checkout Session Error:', JSON.stringify(error, null, 2) || error.message);

        let reason = 'Unknown error';
        const detailedError = error.response?.data || error.details;
        if (detailedError) {
            if (Array.isArray(detailedError)) reason = detailedError.join(', ');
            else if (typeof detailedError === 'object') reason = JSON.stringify(detailedError);
            else reason = String(detailedError);
        }

        res.status(500).json({
            success: false,
            message: `Payment failed: ${reason}`,
            error: error.message,
            details: detailedError,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
        const hmacSecret = paymobService.hmacSecret;
        const receivedHmac = req.query.hmac;


        if (hmacSecret && receivedHmac) {
            const calculatedHmac = paymobService.calculateHmac(obj, hmacSecret);
            if (calculatedHmac !== receivedHmac) {
                console.error('❌ Paymob HMAC verification failed');
                return res.status(401).json({ success: false, message: 'Invalid HMAC signature' });
            }
        }

        // 2. Process transaction
        if (type === 'TRANSACTION') {
            const paymobOrderId = obj.order?.id;
            const success = obj.success;

            if (!paymobOrderId) {
                console.warn('⚠️  No order ID in webhook payload');
                return res.status(200).json({ success: true });
            }

            // Try to find order by Paymob order ID
            const order = await Order.findOne({ paymobOrderId: paymobOrderId.toString() })
                || await Order.findOne({ status: 'pending' }).sort({ createdAt: -1 });

            if (!order) {
                console.error(`❌ Order not found for Paymob ID: ${paymobOrderId}`);
                return res.status(404).end();
            }

            if (success === true || success === 'true') {
                order.status = 'completed';
                order.paymentId = obj.id?.toString();
                order.paymobOrderId = paymobOrderId.toString();
                order.paymentMethod = 'card';
                await order.save();

                // Update creator earnings and balance
                try {
                    if (order.items && order.items.length > 0) {
                        // Default platform fee is 10% unless specified in env
                        const platformFeePercent = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '10');
                        
                        for (const item of order.items) {
                            const template = await Template.findById(item.templateId);
                            if (template && template.creator) {
                                const creatorId = template.creator;
                                const salePrice = item.price;
                                const platformFee = (salePrice * platformFeePercent) / 100;
                                const creatorEarnings = salePrice - platformFee;

                                await User.findByIdAndUpdate(creatorId, {
                                    $inc: { 
                                        totalEarnings: salePrice,
                                        balance: creatorEarnings
                                    }
                                });
                            }
                        }
                    }
                } catch (err) {
                    console.error('Error updating creator earnings:', err);
                }
            } else {
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
