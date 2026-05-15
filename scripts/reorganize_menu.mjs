import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Starting menu reorganization...");

  // 1. Categories
  const categories = [
    { id: "c13", name: "KAHVELER", order: 20 },
    { id: "c_latte", name: "LATTE'S (SICAK - SOĞUK)", order: 21 },
    { id: "c_mocha", name: "MOCHA'S (SICAK - SOĞUK)", order: 22 },
    { id: "c_mocktail", name: "ALKOLSÜZ MOKTEYL", order: 23 },
    { id: "c_hot", name: "SICAK İÇECEKLER", order: 24 },
    { id: "c14", name: "SOFT DRINKS", order: 25 },
  ];

  for (const cat of categories) {
    const { error } = await supabase.from('categories').upsert({
      id: cat.id,
      name: cat.name,
      order: cat.order,
      is_active: true
    });
    if (error) console.error(`Error upserting category ${cat.name}:`, error);
    else console.log(`Category ${cat.name} updated.`);
  }

  // 2. Delete old combined items
  await supabase.from('items').delete().in('id', ['i-kah-5', 'i-kah-6']);
  console.log("Old combined items deleted.");

  // 3. Define Items
  const items = [
    // KAHVELER
    { id: "i-kah-1", category_id: "c13", name: "ESPRESSO SINGLE", price: 169, sort_order: 1 },
    { id: "i-kah-1-db", category_id: "c13", name: "ESPRESSO DOUBLE", price: 179, sort_order: 2 },
    { id: "i-kah-2", category_id: "c13", name: "AMERICANO (SICAK - SOĞUK)", price: 189, sort_order: 3 },
    { id: "i-kah-flat", category_id: "c13", name: "FLAT WHITE", price: 199, sort_order: 4 },
    { id: "i-kah-4", category_id: "c13", name: "CAPPUCCINO", price: 199, sort_order: 5 },
    { id: "i-kah-macch", category_id: "c13", name: "CARAMEL MACCHIATO (SICAK - SOĞUK)", price: 229, sort_order: 6 },

    // LATTE'S
    { id: "i-lat-1", category_id: "c_latte", name: "LATTE", price: 199, sort_order: 1 },
    { id: "i-lat-car", category_id: "c_latte", name: "CARAMEL LATTE", price: 209, sort_order: 2 },
    { id: "i-lat-van", category_id: "c_latte", name: "VANILLA LATTE", price: 209, sort_order: 3 },
    { id: "i-lat-coc", category_id: "c_latte", name: "COCONUT LATTE", price: 209, sort_order: 4 },

    // MOCHA'S
    { id: "i-moc-1", category_id: "c_mocha", name: "MOCHA", price: 229, sort_order: 1 },
    { id: "i-moc-white", category_id: "c_mocha", name: "WHITE MOCHA", price: 229, sort_order: 2 },
    { id: "i-moc-car", category_id: "c_mocha", name: "CARAMEL MOCHA", price: 229, sort_order: 3 },

    // ALKOLSÜZ MOKTEYL
    { id: "i-mok-lime", category_id: "c_mocktail", name: "COOL LIME", price: 249, sort_order: 1 },
    { id: "i-mok-hib", category_id: "c_mocktail", name: "BERRY HIBISCUS", price: 249, sort_order: 2 },
    { id: "i-mok-man", category_id: "c_mocktail", name: "MANGO PASSION FRUIT", price: 249, sort_order: 3 },
    { id: "i-mok-cici", category_id: "c_mocktail", name: "CİCİ BEBE", price: 249, sort_order: 4 },
  ];

  for (const item of items) {
    const { error } = await supabase.from('items').upsert({
      ...item,
      is_available: true,
      description: item.category_id.includes('kah') ? "Sıcak veya Soğuk Seçeneği ile" : "Taze meyveler ve özel karışım"
    });
    if (error) console.error(`Error upserting item ${item.name}:`, error);
    else console.log(`Item ${item.name} updated.`);
  }

  // 4. Move Hot Drinks
  const hotDrinkIds = ['i-sic-1', 'i-sic-2', 'i-sic-3', 'i-sic-4', 'item-hot-chocolate', 'i-sic-5'];
  await supabase.from('items').update({ category_id: "c_hot" }).in('id', hotDrinkIds);
  console.log("Hot drinks moved to SICAK İÇECEKLER.");

  // 5. Move Soft Drinks
  const softDrinkIds = ['i-sic-6', 'i-sic-7', 'i-sic-8', 'i-sic-9', 'i-sic-10', 'i-sic-11'];
  await supabase.from('items').update({ category_id: "c14" }).in('id', softDrinkIds);
  console.log("Soft drinks moved to SOFT DRINKS.");

  console.log("Reorganization complete!");
}

run();
