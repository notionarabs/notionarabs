const express = require('express');
const router = express.Router();
const Payout = require('../models/Payout');
const User = require('../models/User');
const auth = require('../middleware/auth');
const emailService = require('../services/emailService');

/**
 * @route   POST /api/payouts/request
 * @desc    Request a payout
 * @access  Private (Creator)
 */
router.post('/request', auth, async (req, res) => {
    return res.status(400).json({
        success: false,
        message: 'تم إلغاء طلبات السحب اليدوية. يتم الآن سحب الأرباح تلقائياً فور وصول رصيدك للحد المحدد في الإعدادات.'
    });
});

/**
 * @route   GET /api/payouts/me
 * @desc    Get my payout history
 * @access  Private (Creator)
 */
router.get('/me', auth, async (req, res) => {
    try {
        const payouts = await Payout.find({ creator: req.user._id });
        res.json({ success: true, payouts });
    } catch (error) {
        console.error('Fetch payouts error:', error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

/**
 * @route   GET /api/payouts/admin/all
 * @desc    Get all payout requests (Admin)
 * @access  Private (Admin)
 */
router.get('/admin/all', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'غير مصرح لك' });
        }

        const payouts = await Payout.find({}).populate('creatorId');
        res.json({ success: true, payouts });
    } catch (error) {
        console.error('Admin fetch payouts error:', error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

/**
 * @route   PATCH /api/payouts/admin/:id
 * @desc    Update payout status
 * @access  Private (Admin)
 */
router.patch('/admin/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'غير مصرح لك' });
        }

        const { status, rejectionReason } = req.body;
        const payout = await Payout.findOne({ id: req.params.id });

        if (!payout) {
            return res.status(404).json({ success: false, message: 'طلب السحب غير موجود' });
        }

        const oldStatus = payout.status;
        payout.status = status.toUpperCase();
        if (rejectionReason) payout.rejectionReason = rejectionReason;

        const creator = await User.findById(payout.creatorId);

        // If rejecting, return balance to user
        if (status.toUpperCase() === 'REJECTED' && oldStatus !== 'REJECTED') {
            await User.findByIdAndUpdate(payout.creatorId, {
                $inc: { balance: payout.amount }
            });
            if (creator) {
                emailService.sendPayoutRejectedEmail(creator, payout, rejectionReason).catch(err => console.error('Email error:', err));
            }
        } else if (status.toUpperCase() === 'PAID' && oldStatus !== 'PAID') {
            if (creator) {
                emailService.sendPayoutApprovedEmail(creator, payout).catch(err => console.error('Email error:', err));
            }
        }

        await payout.save();

        res.json({ success: true, message: 'تم تحديث حالة الطلب بنجاح', payout });
    } catch (error) {
        console.error('Admin update payout error:', error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

module.exports = router;
