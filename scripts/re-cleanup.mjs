import { createClient } from '@supabase/supabase-js';

// No dotenv import needed, run with node --env-file=.env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
  console.log('Starting final menu cleanup...');

  // 1. DELETE BROKEN CATEGORY
  const { data: cats } = await supabase.from('categories').select('*');
  const brokenCat = cats?.find(c => c.name === "LATTE'S (SICAK - SO");
  if (brokenCat) {
    console.log(`Deleting broken category: ${brokenCat.name} (${brokenCat.id})`);
    const { error } = await supabase.from('categories').delete().eq('id', brokenCat.id);
    if (error) console.error('Error deleting category:', error);
  }

  // 2. REMOVE DUPLICATE PRODUCTS
  const { data: allItems } = await supabase.from('items').select('*');
  if (allItems) {
    const counts = {};
    for (const item of allItems) {
      const key = `${item.name}-${item.category_id}`;
      if (!counts[key]) {
        counts[key] = [];
      }
      counts[key].push(item.id);
    }

    for (const key in counts) {
      if (counts[key].length > 1) {
        // Keep the first one, delete the rest
        const toDeleteIds = counts[key].slice(1);
        console.log(`Deleting duplicates for ${key}: ${toDeleteIds.length} items`);
        const { error } = await supabase.from('items').delete().in('id', toDeleteIds);
        if (error) console.error('Error deleting items:', error);
      }
    }
  }

  console.log('Cleanup complete.');
}

cleanup();
