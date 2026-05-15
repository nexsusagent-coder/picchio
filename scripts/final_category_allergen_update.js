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
} catch (err) { 
  console.error("Env load error:", err);
  process.exit(1); 
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function performUpdates() {
  console.log("🚀 Kategori ve Alerjen güncellemeleri başlıyor...");

  // 1. KATEGORİ İSİM GÜNCELLEMELERİ
  const categoryUpdates = [
    { old: "ALKOLLÜ", new: "ALKOLLÜ SICAK KAHVELER" },
    { old: "SICAK", new: "SICAK İÇECEKLER & SOFT DRINK'S" },
    { old: "YEMEK", new: "YEMEK & ÇEREZ" },
    { old: "LİKÖR", new: "LİKÖR & VERMUT" },
    { old: "ROM'S", new: "ROM'S & COGNAC" }
  ];

  for (const update of categoryUpdates) {
    const { data: cat, error: findError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', update.old)
      .single();
    
    if (cat) {
      const { error: updError } = await supabase
        .from('categories')
        .update({ name: update.new })
        .eq('id', cat.id);
      
      if (!updError) console.log(`[KATEGORİ] ${update.old} -> ${update.new} güncellendi.`);
      else console.error(`[KATEGORİ] ${update.old} güncelleme hatası:`, updError.message);
    }
  }

  // 2. ÜRÜN ÖZEL ALERJEN GÜNCELLEMELERİ
  const { data: items, error: fetchError } = await supabase
    .from('items')
    .select('id, name, allergens, category_id');

  if (fetchError) {
    console.error("Ürün çekme hatası:", fetchError);
    return;
  }

  // Helper function to normalize name for comparison
  const normalize = (str) => str.toLowerCase().replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c');

  const itemsToRemoveAllergens = [
    "bitki caylari", "cay", "cay(fincan)", "churchill", "cola", "fanta", "sprite", "fuse ttea", "meyveli soda", "soda", "su", "tursu"
  ];

  for (const item of items) {
    const normName = normalize(item.name);
    let newAllergens = item.allergens;

    // A. Alerjenleri Komple Kaldırılması Gerekenler
    if (itemsToRemoveAllergens.some(term => normName.includes(term)) || (normName.includes("alkolsuz mokteyld") || normName.includes("alkolsüz mokteyl"))) {
      newAllergens = null;
    }

    // B. Sıcak Çikolata (Kafein -> Süt Ürünleri)
    if (normName.includes("sicak cikolata")) {
      newAllergens = "Süt Ürünleri";
    }

    // C. Mocha ve Latte (Kafein + Süt Ürünleri)
    if (normName.includes("mocha") || normName.includes("latte")) {
      newAllergens = "Kafein, Süt Ürünleri";
    }

    // Güncelleme gerekliyse yap
    if (newAllergens !== item.allergens) {
      console.log(`[ALERJEN] ${item.name}: "${item.allergens}" -> "${newAllergens}"`);
      await supabase.from('items').update({ allergens: newAllergens }).eq('id', item.id);
    }
  }

  console.log("✅ Tüm güncellemeler tamamlandı.");
}

performUpdates();
