import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
  console.log('Starting final menu cleanup and addition...');

  // 1. DELETE BROKEN CATEGORY
  const { data: cats } = await supabase.from('categories').select('*');
  const brokenCat = cats?.find(c => c.name === "LATTE'S (SICAK - SO");
  if (brokenCat) {
    console.log(`Deleting broken category: ${brokenCat.name} (${brokenCat.id})`);
    await supabase.from('categories').delete().eq('id', brokenCat.id);
  }

  // 2. ADD MISSING PRODUCTS TO SICAK ICECEKLER
  const sicakCat = cats?.find(c => c.name === 'SICAK ICECEKLER');
  if (sicakCat) {
    const missingItems = [
      { name: 'Çay', price: 49, category_id: sicakCat.id, order: 1, content: 'Taze demlenmiş siyah çay.' },
      { name: 'Bitki Çayları', price: 119, category_id: sicakCat.id, order: 2, content: 'Adaçayı, Ihlamur, Papatya, Yeşil Çay' },
      { name: 'Sıcak Çikolata', price: 129, category_id: sicakCat.id, order: 5, content: 'Yoğun sütlü ve çikolatalı sıcak içecek.' }
    ];

    for (const item of missingItems) {
      // Check if it exists first
      const { data: existing } = await supabase.from('items').select('*').eq('name', item.name).eq('category_id', sicakCat.id);
      if (!existing || existing.length === 0) {
        console.log(`Adding missing item: ${item.name}`);
        await supabase.from('items').insert([item]);
      } else {
        console.log(`Item ${item.name} already exists, updating price.`);
        await supabase.from('items').update({ price: item.price }).eq('id', existing[0].id);
      }
    }
  }

  // 3. REMOVE DUPLICATE PRODUCTS
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
        const toDelete = counts[key].slice(1);
        console.log(`Deleting duplicates for ${key}: ${toDelete.length} items`);
        await supabase.from('items').delete().in('id', toDelete);
      }
    }
  }

  console.log('Cleanup complete.');
}

cleanup();
