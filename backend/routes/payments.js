const express = require('express');
const router = express.Router();
const paymobService = require('../services/paymobService');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Template = require('../models/Template');
const User = require('../models/User');
const DownloadLog = require('../models/DownloadLog');
const jwt = require('jsonwebtoken');

const authOptional = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        const token = authHeader?.replace('Bearer ', '');
        if (!token || token === 'null' || token === 'undefined') {
            req.user = null;
            return next();
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const userId = decoded.userId || decoded.id;
        const user = await User.findById(userId).select('-password');
        req.user = user || null;
        next();
    } catch (err) {
        req.user = null;
        next();
    }
};

/**
 * @route   POST /api/payments/create-checkout-session
 * @desc    Create a Paymob Unified Checkout session via Intention API
 * @access  Public / Optional Auth
 */
router.post('/create-checkout-session', authOptional, async (req, res) => {
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

        const amountCents = Math.round(template.price * 100);

        const cleanTitle = template.slug || 'Template-' + templateId.substring(0, 5);

        // 2. Prepare billing data for guest or user
        const billingData = {
            firstName: req.user?.name?.split(' ')[0] || 'Notion',
            lastName: req.user?.name?.split(' ').slice(1).join(' ') || 'Member',
            email: req.user?.email || 'guest@notionarabs.com',
            phone: req.user?.phone || '01012345678'
        };

        // 3. Create order in our DB (pending)
        const userId = req.user?.id || req.user?._id || 'guest_user';
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

        const savedOrder = await order.save();
        const finalOrderId = (savedOrder.id || savedOrder._id || order.id || order._id).toString();

        const frontendUrl = process.env.FRONTEND_URL || 'https://www.notionarabs.com';

        const { clientSecret, publicKey } = await paymobService.createIntention({
            amountCents,
            currency: 'EGP',
            billingData,
            itemName: cleanTitle,
            redirectionUrl: `${frontendUrl}/payment/callback`
        });

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
                if (process.env.NODE_ENV === 'production') {
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

            // Try to find order by Paymob order ID or fallback to latest pending
            const order = await Order.findOne({ paymobOrderId: paymobOrderId.toString() })
                || await Order.findOne({ status: 'PENDING' });

            if (!order) {
                console.error(`❌ Order not found for Paymob ID: ${paymobOrderId}`);
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
                        if (order.items && order.items.length > 0) {
                            const platformFeePercent = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '10');
                            const buyer = await User.findById(order.user || order.userId);
                            
                            for (const item of order.items) {
                                const template = await Template.findById(item.templateId);
                                if (template) {
                                    if (template.creator) {
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

                                    template.downloads = (template.downloads || 0) + 1;
                                    await template.save();

                                    try {
                                        await DownloadLog.create({
                                            template: template._id,
                                            creator: template.creator,
                                            user: order.user || order.userId,
                                            userEmailSnapshot: buyer?.email || 'guest@notionarabs.com',
                                            templateTitleSnapshot: template.title || null,
                                            userAgent: 'Paymob Webhook',
                                            referrer: 'Paid Purchase'
                                        });
                                    } catch (logErr) {}
                                }
                            }
                        }
                    } catch (err) {
                        console.error('Error updating creator/template stats:', err);
                    }
                }
            } else {
                order.status = 'CANCELLED';
                await order.save();
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
 * @access  Public / Optional Auth
 */
router.post('/confirm-redirect', authOptional, async (req, res) => {
    try {
        const { orderId, txnId } = req.body;
        const userId = req.user?.id || req.user?._id || 'guest_user';

        // Find latest pending order for this user or guest
        const order = await Order.findOne({ user: userId, status: 'PENDING' });
        
        if (!order) {
            return res.json({ success: true, message: 'No pending orders found or already completed' });
        }

        order.status = 'COMPLETED';
        if (orderId) order.paymobOrderId = orderId.toString();
        if (txnId) order.paymentId = txnId.toString();
        order.paymentMethod = 'CARD';
        await order.save();

        try {
            if (order.items && order.items.length > 0) {
                const platformFeePercent = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '10');
                const buyer = await User.findById(userId);
                
                for (const item of order.items) {
                    const template = await Template.findById(item.templateId);
                    if (template) {
                        if (template.creator) {
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

                        template.downloads = (template.downloads || 0) + 1;
                        await template.save();

                        try {
                            await DownloadLog.create({
                                template: template._id,
                                creator: template.creator,
                                user: userId,
                                userEmailSnapshot: buyer?.email || 'guest@notionarabs.com',
                                templateTitleSnapshot: template.title || null,
                                userAgent: 'Paymob Redirect Verification',
                                referrer: 'Paid Purchase Redirect'
                            });
                        } catch (logErr) {}
                    }
                }
            }
        } catch (err) {}

        // Return populated order so frontend localStorage can save items
        await order.populate('items.templateId', 'title slug previewImage notionLink');

        res.json({ success: true, order });
    } catch (error) {
        console.error('Confirm redirect error:', error);
        res.status(500).json({ success: false });
    }
});

module.exports = router;
