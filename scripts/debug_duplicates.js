const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

let supabaseUrl, supabaseKey;
try {
  const envPath = path.join(__dirname, '../.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const [key, ...vals] = line.split('=');
    if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = vals.join('=').trim().replace(/^['"]|['"]$/g, '');
    if (key === 'SUPABASE_SERVICE_ROLE_KEY' || key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
       if (!supabaseKey || key === 'SUPABASE_SERVICE_ROLE_KEY') supabaseKey = vals.join('=').trim().replace(/^['"]|['"]$/g, '');
    }
  }
} catch (err) { process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: items } = await supabase.from('items').select('id, name, allergens, category_id').eq('category_id', 'c14');
  const grouped = {};
  items.forEach(i => {
    if (!grouped[i.name]) grouped[i.name] = [];
    grouped[i.name].push(i);
  });
  console.log(JSON.stringify(grouped, null, 2));
}
check();
