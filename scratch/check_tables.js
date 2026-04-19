const supabase = require('../backend/utils/supabase');
const dotenv = require('dotenv');
dotenv.config({ path: 'C:/Users/hazem/OneDrive/Desktop/notion-arabs/backend/.env' });

async function run() {
    const tables = ['UserFollower', 'user_followers', 'Follower', 'Following', 'Follow', 'Follows', 'User_Following', 'User_Followers'];
    for (const t of tables) {
        const { data, error } = await supabase.from(t).select('*').limit(1);
        if (error) {
            console.log(`❌ Table ${t}: ${error.code} - ${error.message}`);
        } else {
            console.log(`✅ Table ${t} found! Columns:`, Object.keys(data[0] || {}));
        }
    }
}

run();
