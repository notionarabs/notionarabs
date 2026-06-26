const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const paymobService = require('../services/paymobService');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Template = require('../models/Template');
const User = require('../models/User');
const DownloadLog = require('../models/DownloadLog');
const { invalidateCache } = require('../utils/redis-cache');
const { sendOrderConfirmationEmail, sendPaymentFailedEmail } = require('../services/emailService');
const PaymentLog = require('../models/PaymentLog');
const { purchaseRateLimit } = require('../middleware/security');

// Sets req.user if a valid token is present, continues without error if not.
const optionalAuth = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return next();
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const userId = decoded.userId || decoded.id;
        if (userId) {
            const user = await User.findById(userId).select('-password');
            if (user?.isActive) req.user = user;
        }
    } catch (_) {}
    next();
};

// Single source of truth for post-payment fulfillment (purchase or boost).
async function _fulfillOrder(order, userId) {
    if (!order.items || order.items.length === 0) return;

    const platformFeePercent = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '10');
    const buyer = userId ? await User.findById(userId) : null;

    if (order.source && order.source.startsWith('boost_')) {
        for (const item of order.items) {
            const templateId = item.templateId?._id || item.templateId?.id || item.templateId;
            if (templateId) {
                await Template.findByIdAndUpdate(templateId, {
                    isPinned: true,
                    pinnedAt: new Date().toISOString(),
                    pinnedById: order.source
                });
                try { await invalidateCache('template'); } catch (_) {}
                console.log(`🚀 Template ${templateId} boosted via _fulfillOrder`);
            }
        }
    } else {
        for (const item of order.items) {
            const template = await Template.findById(item.templateId);
            if (!template) continue;

            if (template.creator) {
                const salePrice = item.price;
                const creatorEarnings = salePrice - (salePrice * platformFeePercent) / 100;
                await User.findByIdAndUpdate(template.creator, {
                    $inc: { totalEarnings: salePrice, balance: creatorEarnings }
                });

                // Trigger automatic payout check
                const { checkAndTriggerAutoPayout } = require('../services/payoutService');
                checkAndTriggerAutoPayout(template.creator).catch(err => {
                    console.error('[Payment AutoPayout Trigger] Error running check:', err);
                });
            }

            template.downloads = (template.downloads || 0) + 1;
            await template.save();

            try {
                await DownloadLog.create({
                    template: template._id,
                    creator: template.creator,
                    user: userId || order.user || order.userId || null,
                    userEmailSnapshot: buyer?.email || null,
                    templateTitleSnapshot: template.title || null,
                    userAgent: 'Payment Fulfillment',
                    referrer: 'Paid Purchase'
                });
            } catch (_) {}
        }

        const firstItem = order.items?.[0];
        PaymentLog.record({
            event: 'COMPLETED',
            userId,
            orderId: order.id || order._id,
            templateId: firstItem?.templateId?._id || firstItem?.templateId,
            amount: order.total
        }).catch(() => {});

        if (buyer) {
            try { await sendOrderConfirmationEmail(buyer, order); } catch (_) {}
        }
    }
}

/**
 * @route   POST /api/payments/create-checkout-session
 * @desc    Create a Paymob Unified Checkout session via Intention API
 * @access  Private
 */
router.post('/create-checkout-session', auth, purchaseRateLimit, async (req, res) => {
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

        // 2a. Prevent duplicate purchases
        const userId = req.user.id || req.user._id;
        const templateDbId = template.id || template._id;

        const alreadyPurchased = await Order.existsForTemplate(userId.toString(), templateDbId.toString());
        if (alreadyPurchased) {
            PaymentLog.record({ event: 'DUPLICATE_BLOCKED', userId, templateId: templateDbId, amount: template.price }).catch(() => {});
            return res.status(400).json({
                success: false,
                message: 'لقد اشتريت هذا القالب بالفعل. يمكنك الوصول إليه من مكتبتك.',
                alreadyPurchased: true
            });
        }

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

        const savedOrder = await order.save();
        const finalOrderId = (savedOrder.id || savedOrder._id || order.id || order._id).toString();

        // 4. Use Paymob Intention API (new unified checkout)
        // Automatically picks TEST or LIVE integration based on NODE_ENV

        const frontendUrl = process.env.FRONTEND_URL || 'https://www.notionarabs.com';

        let clientSecret, publicKey;
        try {
            ({ clientSecret, publicKey } = await paymobService.createIntention({
                amountCents,
                currency: 'EGP',
                billingData,
                itemName: cleanTitle,
                redirectionUrl: `${frontendUrl}/payment/callback?dbOrderId=${finalOrderId}`,
                extras: { dbOrderId: finalOrderId }
            }));
        } catch (intentionError) {
            // Cancel the pending order so it doesn't linger
            try {
                savedOrder.status = 'CANCELLED';
                await savedOrder.save();
            } catch (_) {}
            PaymentLog.record({ event: 'CANCELLED', userId, orderId: finalOrderId, templateId: templateDbId, amount: template.price, reason: intentionError.message }).catch(() => {});
            throw intentionError;
        }

        PaymentLog.record({ event: 'INITIATED', userId, orderId: finalOrderId, templateId: templateDbId, amount: template.price }).catch(() => {});

        // 5. Build the Unified Checkout URL
        const checkoutUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${publicKey}&clientSecret=${clientSecret}`;

        res.json({
            success: true,
            checkoutUrl,
            orderId: finalOrderId
        });

    } catch (error) {
        console.error('Checkout Session Error:', JSON.stringify(error, null, 2) || error.message);

        let reason = error.message || 'Unknown error';
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
 * @route   POST /api/payments/create-boost-session
 * @desc    Create a Paymob checkout session for paid template boosting
 * @access  Private (Approved Creator)
 */
router.post('/create-boost-session', auth, async (req, res) => {
    try {
        const { templateId, duration } = req.body;
        const userId = req.user.id || req.user._id;

        // 1. Validate template ownership & approval status
        const template = await Template.findById(templateId);
        if (!template) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }

        const isOwner = template.creator?.toString() === userId.toString();
        const isAdmin = req.user.role?.toLowerCase() === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Unauthorized access to this template' });
        }

        if (template.status !== 'approved') {
            return res.status(400).json({ success: false, message: 'Only approved templates can be boosted' });
        }

        // 2. Validate duration & calculate pricing
        const parsedDuration = parseInt(duration, 10);
        const pricingMap = {
            3: 100,  // 100 EGP
            7: 200,  // 200 EGP
            30: 500  // 500 EGP
        };

        const price = pricingMap[parsedDuration];
        if (!price) {
            return res.status(400).json({ success: false, message: 'Invalid boost duration. Choose 3, 7, or 30 days.' });
        }

        const amountCents = price * 100; // Paymob works in cents

        // Clean title for Paymob
        const cleanTitle = `Boost-${parsedDuration}d-${templateId.substring(0, 8)}`;

        // 3. Prepare billing data
        const billingData = {
            firstName: req.user.name?.split(' ')[0] || 'Notion',
            lastName: req.user.name?.split(' ').slice(1).join(' ') || 'Member',
            email: req.user.email,
            phone: req.user.phone || '01012345678'
        };

        // 4. Create boost order (pending)
        const order = new Order({
            user: userId,
            items: [{
                templateId: template.id || template._id,
                name: `ترويج قالب: ${template.title} (${parsedDuration} أيام)`,
                price: price
            }],
            total: price,
            status: 'PENDING',
            source: `boost_${parsedDuration}`, // Store duration in source (e.g. boost_7)
            paymentMethod: 'CARD'
        });

        const savedOrder = await order.save();
        const finalOrderId = (savedOrder.id || savedOrder._id || order.id || order._id).toString();

        // 5. Use Paymob Intention API
        const frontendUrl = process.env.FRONTEND_URL || 'https://www.notionarabs.com';

        const { clientSecret, publicKey } = await paymobService.createIntention({
            amountCents,
            currency: 'EGP',
            billingData,
            itemName: cleanTitle,
            redirectionUrl: `${frontendUrl}/payment/callback?dbOrderId=${finalOrderId}&type=boost`,
            extras: { dbOrderId: finalOrderId }
        });

        const checkoutUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${publicKey}&clientSecret=${clientSecret}`;

        res.json({
            success: true,
            checkoutUrl,
            orderId: finalOrderId
        });

    } catch (error) {
        console.error('Create Boost Session Error:', error);
        res.status(500).json({
            success: false,
            message: `Failed to initialize boost: ${error.message}`
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
                console.warn('⚠️ Paymob HMAC verification mismatch (Forgiving in Test Mode)');
                if (paymobService.isLive) {
                    return res.status(401).json({ success: false, message: 'Invalid HMAC signature' });
                }
            }
        }

        // Process transaction or intention
        if (type === 'TRANSACTION' || (obj && obj.order)) {
            const paymobOrderId = obj.order?.id || obj.id;
            const success = obj.success;

            if (!paymobOrderId) {
                console.warn('⚠️ No order ID in webhook payload');
                return res.status(200).json({ success: true });
            }

            // Try to find order by internal dbOrderId (from extras), then by Paymob order ID
            const dbOrderId = obj.extras?.dbOrderId || obj.extras?.db_order_id;
            let order;
            if (dbOrderId) {
                order = await Order.findOne({ id: dbOrderId });
            }
            if (!order && paymobOrderId) {
                order = await Order.findOne({ paymobOrderId: paymobOrderId.toString() });
            }

            if (!order) {
                console.error(`❌ Order not found for Webhook (dbOrderId: ${dbOrderId || 'none'}, paymobOrderId: ${paymobOrderId})`);
                return res.status(200).json({ success: true, note: 'Ignored unmatched order' });
            }

            if (success === true || success === 'true') {
                if (order.status !== 'COMPLETED') {
                    order.status = 'COMPLETED';
                    order.paymentId = obj.id?.toString();
                    order.paymobOrderId = paymobOrderId.toString();
                    order.paymentMethod = 'CARD';
                    await order.save();

                    try {
                        await _fulfillOrder(order, order.user || order.userId);
                    } catch (err) {
                        console.error('Error fulfilling order via webhook:', err);
                    }
                }
            } else {
                order.status = 'CANCELLED';
                await order.save();

                const failedUserId = order.user || order.userId;
                PaymentLog.record({ event: 'FAILED', userId: failedUserId, orderId: order.id || order._id, amount: order.total, reason: 'Paymob webhook: success=false' }).catch(() => {});
                if (failedUserId) {
                    try {
                        const failedUser = await User.findById(failedUserId);
                        if (failedUser) await sendPaymentFailedEmail(failedUser, order);
                    } catch (_) {}
                }
            }
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(200).json({ success: false });
    }
});

/**
 * @route   POST /api/payments/confirm-redirect
 * @desc    Immediate verification when user returns from Paymob checkout
 * @access  Private
 */
router.post('/confirm-redirect', optionalAuth, async (req, res) => {
    try {
        const { dbOrderId, hmac, ...queryData } = req.body;
        const userId = req.user?.id || req.user?._id || null;

        // 1. Verify Paymob HMAC Signature
        if (hmac) {
            const isSignatureValid = paymobService.verifyTransactionHmac(queryData, hmac);
            if (!isSignatureValid) {
                console.warn('⚠️ Paymob HMAC verification mismatch in confirm-redirect (Forgiving in Test Mode)');
                if (paymobService.isLive) {
                    return res.status(400).json({ success: false, message: 'Invalid payment signature' });
                }
            }
        } else {
            console.warn('⚠️ Missing HMAC in confirm-redirect request');
            if (paymobService.isLive) {
                return res.status(400).json({ success: false, message: 'Missing payment signature' });
            }
        }

        // 2. Verify payment success status
        const isSuccess = queryData.success === 'true' || queryData.success === true;
        const isPending = queryData.pending === 'true' || queryData.pending === true;

        if (!isSuccess || isPending) {
            if (dbOrderId && userId) {
                try {
                    const failedOrder = await Order.findOne({ id: dbOrderId, user: userId });
                    if (failedOrder && failedOrder.status !== 'CANCELLED') {
                        failedOrder.status = 'CANCELLED';
                        await failedOrder.save();
                        PaymentLog.record({ event: 'FAILED', userId, orderId: dbOrderId, amount: failedOrder.total, reason: 'confirm-redirect: success=false' }).catch(() => {});
                        const failedUser = await User.findById(userId);
                        if (failedUser) await sendPaymentFailedEmail(failedUser, failedOrder);
                    }
                } catch (_) {}
            }
            return res.status(400).json({ success: false, message: 'Payment is unsuccessful or pending' });
        }

        // 3. Find target order — guests have no userId so search by id only
        let order;
        if (dbOrderId) {
            const query = { id: dbOrderId };
            if (userId) query.user = userId;
            order = await Order.findOne(query);
        } else if (userId) {
            console.log(`[Confirm Redirect] Missing dbOrderId. Falling back to latest order for user ${userId}`);
            order = await Order.findOne({ user: userId });
        }
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // If already completed (e.g. by Webhook callback running first), just return success
        if (order.status === 'COMPLETED') {
            return res.json({ success: true, message: 'Order already completed', order });
        }

        order.status = 'COMPLETED';
        if (queryData.order) order.paymobOrderId = queryData.order.toString();
        if (queryData.id) order.paymentId = queryData.id.toString();
        order.paymentMethod = 'CARD';
        await order.save();

        try {
            await _fulfillOrder(order, userId);
        } catch (err) {
            console.error('Error fulfilling order via redirect:', err);
        }

        res.json({ success: true, order });
    } catch (error) {
        console.error('Confirm redirect error:', error);
        res.status(500).json({ success: false, message: 'Error confirming payment' });
    }
});

module.exports = router;
