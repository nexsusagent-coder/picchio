const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

let supabaseUrl, supabaseKey;
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
for (const line of envContent.split('\n')) {
  const [key, ...vals] = line.split('=');
  if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = vals.join('=').trim().replace(/^['"]|['"]$/g, '');
  if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseKey = vals.join('=').trim().replace(/^['"]|['"]$/g, '');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing update for 'Salep' (i-sic-4)...");
  const { data, error } = await supabase
    .from('items')
    .update({ allergens: 'Süt Ürünleri' })
    .eq('id', 'i-sic-4')
    .select();
  
  if (error) {
    console.error("Update Error:", error.message);
  } else {
    console.log("Update Result:", JSON.stringify(data, null, 2));
  }
}
test();
