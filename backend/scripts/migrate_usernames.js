const supabase = require('../utils/supabase');
const dotenv = require('dotenv');
const crypto = require('crypto');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrateUsernames() {
    console.log('🚀 Starting Username Migration...');

    try {
        // 1. Fetch all users where username is null or empty
        const { data: users, error: fetchError } = await supabase
            .from('User')
            .select('id, email, name, username')
            .or('username.is.null,username.eq.""');

        if (fetchError) throw fetchError;

        if (!users || users.length === 0) {
            console.log('✅ No users found with missing usernames.');
            return;
        }

        console.log(`Found ${users.length} users needing a username update.`);

        for (const user of users) {
            let baseUsername = '';
            
            // Try to use email prefix
            if (user.email) {
                baseUsername = user.email.split('@')[0];
            } else if (user.name) {
                baseUsername = user.name.toLowerCase().replace(/\s+/g, '');
            } else {
                baseUsername = 'user_' + crypto.randomBytes(3).toString('hex');
            }

            // Clean username (alphanumeric and underscores only)
            baseUsername = baseUsername.replace(/[^a-zA-Z0-9_]/g, '');
            
            let finalUsername = baseUsername;
            let attempt = 0;
            let isUnique = false;

            // Check for uniqueness and append suffix if needed
            while (!isUnique) {
                const checkUsername = attempt === 0 ? finalUsername : `${finalUsername}${attempt}`;
                const { data: existing, error: checkError } = await supabase
                    .from('User')
                    .select('id')
                    .eq('username', checkUsername)
                    .maybeSingle();

                if (checkError) throw checkError;

                if (!existing) {
                    finalUsername = checkUsername;
                    isUnique = true;
                } else {
                    attempt++;
                }
            }

            console.log(`Updating user ${user.email || user.id}: ${user.username || 'null'} -> ${finalUsername}`);

            const { error: updateError } = await supabase
                .from('User')
                .update({ username: finalUsername })
                .eq('id', user.id);

            if (updateError) {
                console.error(`❌ Failed to update user ${user.id}:`, updateError.message);
            }
        }

        console.log('🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration Error:', error.message || error);
    }
}

migrateUsernames();
