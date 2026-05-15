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

async function fixAllergens() {
  console.log("🚀 AGRESİF Alerjen süzgeçleme işlemi başlıyor...");
  
  const { data: items, error: fetchError } = await supabase
    .from('items')
    .select('id, name, category_id, allergens');
  
  if (fetchError) {
    console.error("Veri çekme hatası:", fetchError);
    return;
  }

  for (const item of items) {
    let newAllergens = item.allergens; // Default to current

    // 1. Category Specific Rules
    if (item.category_id === 'c14' || item.category_id === 'c13') {
       const lowerName = item.name.toLowerCase();
       if (lowerName.includes('türk kahvesi') || lowerName.includes('redbull')) {
         newAllergens = 'Kafein';
       } else if (lowerName.includes('salep')) {
         newAllergens = 'Süt Ürünleri';
       } else {
         newAllergens = null;
       }
    } else if (['c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12'].includes(item.category_id)) {
      if (item.category_id === 'c2') {
        newAllergens = 'Gluten, Sülfitler';
      } else {
        newAllergens = 'Sülfitler';
      }

      // Special Milk/Cream items anywhere in alcoholic categories
      const milkCreamItems = ['baileys', 'white russian', 'espresso martini', 'creamy', 'süt'];
      if (milkCreamItems.some(term => item.name.toLowerCase().includes(term))) {
        newAllergens = 'Kafein, Süt Ürünleri, Sülfitler';
      }
    }

    // Force update if rule dictates
    if (newAllergens !== item.allergens) {
      console.log(`[FORCE UPDATE] ${item.name}: "${item.allergens}" -> "${newAllergens}"`);
      const { error: updateError } = await supabase
        .from('items')
        .update({ allergens: newAllergens })
        .eq('id', item.id);
      
      if (updateError) {
        console.error(`ERROR UPDATING ${item.name}:`, updateError.message);
      }
    }
  }

  console.log("✅ AGRESİF İşlem tamamlandı.");
}

fixAllergens();
