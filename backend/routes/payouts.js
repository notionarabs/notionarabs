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
    try {
        if (req.user.role !== 'creator' || req.user.creatorStatus !== 'approved') {
            return res.status(403).json({ success: false, message: 'يجب أن تكون مبدعاً معتمداً لطلب سحب الأرباح' });
        }

        const { amount, method, accountDetails } = req.body;

        // 1. Basic validation
        if (!amount || amount < 100) {
            return res.status(400).json({ success: false, message: 'الحد الأدنى للسحب هو 100 ج.م' });
        }

        if (!method || !accountDetails) {
            return res.status(400).json({ success: false, message: 'يرجى إكمال بيانات الدفع' });
        }

        // 2. Method-specific account detail validation
        const validMethods = ['vodafone_cash', 'bank_transfer'];
        if (!validMethods.includes(method)) {
            return res.status(400).json({ success: false, message: 'طريقة السحب غير مدعومة' });
        }

        if (method === 'vodafone_cash') {
            const phone = (accountDetails.walletNumber || '').replace(/\s/g, '');
            const egyptianMobile = /^(010|011|012|015)\d{8}$/;
            if (!egyptianMobile.test(phone)) {
                return res.status(400).json({
                    success: false,
                    message: 'رقم المحفظة يجب أن يكون رقم مصري صحيح مكون من 11 رقمًا (010, 011, 012, 015)'
                });
            }
        }

        if (method === 'bank_transfer') {
            const { bankName, accountName, accountNumber } = accountDetails;
            if (!bankName || bankName.trim().length < 2) {
                return res.status(400).json({ success: false, message: 'يرجى إدخال اسم البنك' });
            }
            if (!accountName || accountName.trim().length < 3) {
                return res.status(400).json({ success: false, message: 'يرجى إدخال اسم صاحب الحساب كما في البنك' });
            }
            if (!accountNumber || accountNumber.trim().length < 10) {
                return res.status(400).json({ success: false, message: 'يرجى إدخال رقم حساب أو IBAN صحيح (10 أرقام على الأقل)' });
            }
        }

        // 2. Check user balance
        const user = await User.findById(req.user._id);
        if (!user || (user.balance || 0) < amount) {
            return res.status(400).json({ success: false, message: 'رصيدك غير كافٍ لهذا الطلب' });
        }

        // 3. Create payout request
        const payout = await Payout.create({
            creatorId: req.user._id,
            amount,
            method,
            accountDetails,
            status: 'PENDING'
        });

        // 4. Deduct from balance immediately (hold)
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { balance: -amount }
        });

        // 5. Send email notification asynchronously
        emailService.sendPayoutRequestedEmail(user, payout).catch(err => console.error('Failed to send payout request email:', err));

        res.json({
            success: true,
            message: 'تم استلام طلب السحب بنجاح، سيتم التحقق منه خلال 3 أيام عمل',
            payout
        });

    } catch (error) {
        console.error('Payout request error:', error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
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
