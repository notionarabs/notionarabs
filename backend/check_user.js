const User = require('./models/User');

async function run() {
    try {
        const user = await User.findOne({ email: 'hazemyasser911@gmail.com' });
        console.log('User found:', {
            id: user?.id,
            name: user?.name,
            email: user?.email,
            googleId: user?.googleId,
            passwordLength: user?.password ? user.password.length : null,
            passwordIsHash: user?.password ? (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) : false,
            passwordVal: user?.password
        });
    } catch (err) {
        console.error('Error:', err);
    }
    process.exit(0);
}

run();
