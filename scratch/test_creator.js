const dotenv = require('../backend/node_modules/dotenv');
dotenv.config({ path: 'C:/Users/hazem/OneDrive/Desktop/notion-arabs/backend/.env' });
const User = require('../backend/models/User');
const Template = require('../backend/models/Template');

async function run() {
    try {
        const id = 'hazemyasser911';
        console.log('Testing User.findOne for:', id);
        const creator = await User.findOne({ 
            $or: [
                { username: id.toLowerCase() }, 
                { name: id }, 
                { displayName: id }, 
                { email: id.toLowerCase() + '@' }, 
                { email: { $regex: '^' + id.toLowerCase() + '@', $options: 'i' } }
            ], 
            creatorStatus: 'approved', 
            isActive: true, 
            isEmailVerified: true 
        });
        
        console.log('CREATOR FOUND:', creator ? creator.id : 'NONE');
        if (creator) {
            console.log('Creator Data:', JSON.stringify(creator, null, 2));
            const hasTemplates = await Template.exists({
                creator: creator._id,
                status: 'approved'
            });
            console.log('HAS APPROVED TEMPLATES:', hasTemplates);
        }
    } catch (err) {
        console.error('ERROR:', err);
    }
}

run();
