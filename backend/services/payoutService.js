const Payout = require('../models/Payout');
const User = require('../models/User');
const supabase = require('../utils/supabase');
const emailService = require('./emailService');

/**
 * Checks if a creator's balance exceeds their configured automatic payout threshold
 * and if so, automatically triggers a payout request.
 * 
 * @param {string} userId - The ID of the creator/user to check
 */
async function checkAndTriggerAutoPayout(userId) {
  // Automatic payouts are disabled. Payouts must be processed manually by admins.
  return;

  try {
    if (!userId) return;

    // Fetch user details
    const user = await User.findById(userId);
    if (!user || user.role !== 'creator' || user.creatorStatus !== 'approved') {
      return;
    }

    const payoutDetails = user.payoutDetails || {};
    
    // Parse threshold (minimum 100 EGP, default to 500 EGP)
    // Note: Automatic withdrawal is now the only available withdrawal method, so it is always active.
    let threshold = parseFloat(payoutDetails.autoPayoutThreshold);
    if (isNaN(threshold) || threshold < 100) {
      threshold = 500;
    }

    const balance = parseFloat(user.balance) || 0;

    // Verify balance exceeds threshold
    if (balance < threshold) {
      return;
    }

    // Validate payout method & details completeness
    const method = user.payoutMethod;
    if (!method || !['vodafone_cash', 'bank_transfer'].includes(method)) {
      console.warn(`[AutoPayout] User ${userId} has auto payout enabled but missing/invalid payout method: ${method}`);
      return;
    }

    if (method === 'vodafone_cash' && !payoutDetails.walletNumber) {
      console.warn(`[AutoPayout] User ${userId} has auto payout enabled for vodafone_cash but missing walletNumber`);
      return;
    }

    if (method === 'bank_transfer' && (!payoutDetails.bankName || !payoutDetails.accountName || !payoutDetails.accountNumber)) {
      console.warn(`[AutoPayout] User ${userId} has auto payout enabled for bank_transfer but missing bank account details`);
      return;
    }

    const withdrawAmount = balance;

    // 1. Deduct balance atomically via Supabase update with condition (gte balance)
    // This protects against double-payouts in case of race conditions/concurrent requests
    const { data: updatedUser, error: updateError } = await supabase
      .from('User')
      .update({ balance: user.balance - withdrawAmount })
      .eq('id', userId)
      .gte('balance', withdrawAmount)
      .select();

    if (updateError || !updatedUser || updatedUser.length === 0) {
      console.warn(`[AutoPayout] Concurrency check failed or balance changed for user ${userId}. Auto payout aborted.`);
      return;
    }

    // 2. Create payout request in PENDING state
    // We pass a serialized accountDetails object similar to manual payouts in the route handler
    const payout = await Payout.create({
      creatorId: userId,
      amount: withdrawAmount,
      method: method,
      accountDetails: JSON.stringify(payoutDetails),
      status: 'PENDING'
    });

    console.log(`[AutoPayout] Automatically triggered a payout of ${withdrawAmount} EGP for user ${userId} (Payout ID: ${payout.id})`);

    // 3. Send email notifications asynchronously
    emailService.sendPayoutRequestedEmail(user, payout).catch(err => {
      console.error(`[AutoPayout] Failed to send payout request email for user ${userId}:`, err);
    });

  } catch (err) {
    console.error(`[AutoPayout] Error checking auto payout for user ${userId}:`, err);
  }
}

module.exports = {
  checkAndTriggerAutoPayout
};
