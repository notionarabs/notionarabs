const User = require('./models/User');

async function pinUser() {
  const id = '30663edd6404be4645d20bc9';
  const user = await User.findById(id);
  
  if (!user) {
    console.error('User not found');
    return;
  }
  
  console.log('Current isPinned:', user.isPinned);
  user.isPinned = true;
  user.pinnedAt = new Date();
  
  await user.save();
  console.log('User pinned successfully');
  
  // Verify
  const updatedUser = await User.findById(id);
  console.log('Updated isPinned:', updatedUser.isPinned);
  process.exit(0);
}

pinUser().catch(err => {
  console.error('Pin error:', err);
  process.exit(1);
});
