import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("HATA: .env.local dosyasında Supabase bilgileri bulunamadı!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAllergens() {
  console.log("🚀 Alerjen süzgeçleme işlemi başlıyor...");
  
  const { data: items, error: fetchError } = await supabase
    .from('items')
    .select('id, name, category_id, allergens');
  
  if (fetchError) {
    console.error("Veri çekme hatası:", fetchError);
    return;
  }

  console.log(`${items.length} ürün inceleniyor...`);

  for (const item of items) {
    let newAllergens = null;

    // 1. Sıcak İçecekler (c14) ve Soft drinks (c13)
    if (item.category_id === 'c14') {
      if (item.name.toLowerCase().includes('türk kahvesi')) {
        newAllergens = 'Kafein';
      } else if (item.name.toLowerCase().includes('salep')) {
        newAllergens = 'Süt Ürünleri';
      } else if (item.name.toLowerCase().includes('redbull')) {
        newAllergens = 'Kafein';
      } else {
        newAllergens = null;
      }
    } else if (item.category_id === 'c13') {
       if (item.name.toLowerCase().includes('redbull')) {
         newAllergens = 'Kafein';
       } else {
         newAllergens = null;
       }
    } else if (['c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12'].includes(item.category_id)) {
      // 2. Alkollü İçecekler & Biralar
      if (item.category_id === 'c2') {
        newAllergens = 'Gluten, Sülfitler';
      } else {
        newAllergens = 'Sülfitler';
      }

      // 3. Özel Durumlar: Süt/Krema içerenler
      const milkCreamItems = ['baileys coffee', 'white russian', 'espresso martini'];
      if (milkCreamItems.some(name => item.name.toLowerCase().includes(name.toLowerCase()))) {
        newAllergens = 'Kafein, Süt Ürünleri, Sülfitler';
      }
    }

    // 4. Update if changed
    if (newAllergens !== item.allergens) {
      console.log(`[GÜNCELLE] ${item.name}: ${item.allergens} -> ${newAllergens}`);
      const { error: updateError } = await supabase
        .from('items')
        .update({ allergens: newAllergens })
        .eq('id', item.id);
      
      if (updateError) {
        console.error(`Hata (${item.name}):`, updateError);
      }
    }
  }

  console.log("✅ İşlem tamamlandı.");
}

fixAllergens();
