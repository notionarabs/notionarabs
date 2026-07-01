// Automatic payouts are disabled — payouts are processed manually by admins via the admin panel.
// To re-enable, restore the logic and required imports (Payout, User, supabase, emailService).
function checkAndTriggerAutoPayout(_userId) {
  return Promise.resolve();
}

module.exports = {
  checkAndTriggerAutoPayout
};
