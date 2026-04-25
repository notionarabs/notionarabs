const supabase = require('../utils/supabase');

async function checkUser() {
  try {
    const { data: user, error } = await supabase
      .from('User')
      .select('*')
      .eq('id', '3ba3852c7821650871c938c4')
      .maybeSingle();

    if (error) throw error;
    console.log('User:', user);
  } catch (err) {
    console.error('Error:', err);
  }
}

checkUser();
