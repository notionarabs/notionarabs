/*
  Fix existing creator_followed notifications to link to /creators/[username]
  Usage: node backend/scripts/fix-follow-notification-links.js
*/

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const Notification = require('../models/Notification');
const User = require('../models/User');

async function main() {
  const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/notion-arabs';
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });

  const cursor = Notification.find({ type: 'creator_followed' }).cursor();
  let fixed = 0;
  for await (const notif of cursor) {
    const followerId = notif?.metadata?.followerId;
    if (!followerId) continue;

    // If link already looks like /creators/<username-like>, skip
    if (typeof notif.link === 'string' && notif.link.startsWith('/creators/')) {
      const slug = notif.link.replace('/creators/', '');
      // Heuristic: if it's not a 24-hex id, assume fine
      if (!/^[a-f0-9]{24}$/i.test(slug)) continue;
    }

    const follower = await User.findById(followerId).select('username email displayName name creatorStatus');
    if (!follower) continue;

    const emailUser = (follower.email && follower.email.includes('@')) ? follower.email.split('@')[0] : null;
    const nameSlug = (follower.displayName || follower.name || '')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase();
    const followerUsername = follower.username || emailUser || nameSlug || follower._id.toString();

    // Change link to the creator's own profile instead
    const creatorUser = await User.findById(notif.user).select('username email displayName name');
    const creatorEmailUser = (creatorUser?.email && creatorUser.email.includes('@')) ? creatorUser.email.split('@')[0] : null;
    const creatorNameSlug = (creatorUser?.displayName || creatorUser?.name || '')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase();
    const creatorUsername = creatorUser?.username || creatorEmailUser || creatorNameSlug || (creatorUser?._id?.toString() || '');
    const newLink = `/creators/${creatorUsername}`;
    let needsSave = false;
    if (notif.link !== newLink) {
      notif.link = newLink;
      needsSave = true;
    }
    if (!notif.metadata) notif.metadata = {};
    if (notif.metadata.followerUsername !== followerUsername) {
      notif.metadata.followerUsername = followerUsername;
      needsSave = true;
    }
    if (needsSave) {
      await notif.save();
      fixed += 1;
    }
  }

  console.log(`Fixed ${fixed} creator_followed notification links.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Fix script error:', err);
  process.exit(1);
});


