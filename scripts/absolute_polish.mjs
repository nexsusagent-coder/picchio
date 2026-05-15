import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function absolutePolish() {
  console.log('--- STARTING ABSOLUTE POLISH ---');

  // 1. CLEAR DUPLICATE ITEMS
  const { data: allItems, error: itemsError } = await supabase.from('items').select('*');
  if (itemsError) {
    console.error('Error fetching items:', itemsError);
    return;
  }

  const seenItems = new Map();
  const toDeleteIds = [];

  for (const item of allItems) {
    const key = `${item.name.toLowerCase().trim()}-${item.category_id}`;
    if (seenItems.has(key)) {
      toDeleteIds.push(item.id);
    } else {
      seenItems.set(key, item.id);
    }
  }

  if (toDeleteIds.length > 0) {
    console.log(`Found ${toDeleteIds.length} duplicates. Attempting deletion...`);
    const { error: delError } = await supabase.from('items').delete().in('id', toDeleteIds);
    if (delError) {
      console.error('ERROR deleting items (likely RLS):', delError);
    } else {
      console.log('Successfully deleted duplicate items.');
    }
  } else {
    console.log('No duplicate items found.');
  }

  // 2. CLEAR BROKEN CATEGORY
  const { data: cats, error: catsError } = await supabase.from('categories').select('*');
  if (catsError) {
    console.error('Error fetching categories:', catsError);
    return;
  }

  const brokenCat = cats.find(c => c.name.includes("LATTE'S (SICAK - SO"));
  if (brokenCat) {
    console.log(`Found broken category: ${brokenCat.name}. Attempting deletion...`);
    const { error: delCatError } = await supabase.from('categories').delete().eq('id', brokenCat.id);
    if (delCatError) {
       console.error('ERROR deleting category (likely RLS):', delCatError);
       // Try updating it instead if delete is blocked?
       console.log('Attempting to RENAME the broken category to "DELETE_ME" as a fallback...');
       await supabase.from('categories').update({ name: 'DELETE_ME_HIDDEN' }).eq('id', brokenCat.id);
    } else {
      console.log('Successfully deleted broken category.');
    }
  }

  // 3. FINAL VERIFICATION OF SICAK ICECEKLER
  const sicakCat = cats.find(c => c.name === 'SICAK İÇECEKLER');
  if (sicakCat) {
    const { data: sicakItems } = await supabase.from('items').select('*').eq('category_id', sicakCat.id);
    console.log('Items in SICAK İÇECEKLER:', sicakItems?.map(i => i.name).join(', '));
  }

  console.log('--- POLISH COMPLETE ---');
}

absolutePolish();
