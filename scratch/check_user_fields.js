const supabase = require('../backend/utils/supabase');

async function checkFields() {
    const { data, error } = await supabase.from('User').select('*').limit(1);
    if (error) {
        console.error(error);
        return;
    }
    console.log('User fields:', Object.keys(data[0] || {}));
}

checkFields();
