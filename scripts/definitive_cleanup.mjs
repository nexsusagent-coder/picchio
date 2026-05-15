import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalClean() {
  console.log('--- FINAL DATABASE CLEANUP STARTED ---');

  // 1. DELETE THE BROKEN CATEGORY
  // Broken ID identified in logs: c-1774986633346 ("LATTE'S (SICAK - SO")
  const { error: catErr } = await supabase.from('categories').delete().eq('id', 'c-1774986633346');
  if (catErr) console.error('Error deleting broken category:', catErr);
  else console.log('Successfully deleted broken category LATTE\'S (SICAK - SO).');

  // 2. DELETE MANGO DUPLICATES (Keeping item-1774987879026)
  const mangoToKeep = 'item-1774987879026';
  const { data: mangos } = await supabase.from('items').select('id').ilike('name', 'Mango Passion Fruit');
  const mangoToDelete = mangos?.filter(m => m.id !== mangoToKeep).map(m => m.id) || [];
  
  if (mangoToDelete.length > 0) {
    const { error: mangoErr } = await supabase.from('items').delete().in('id', mangoToDelete);
    if (mangoErr) console.error('Error deleting mango duplicates:', mangoErr);
    else console.log(`Successfully deleted ${mangoToDelete.length} Mango Passion Fruit duplicates.`);
  }

  // 3. DELETE MOCHA DUPLICATES (Keeping item-1774987529285)
  const mochaToKeep = 'item-1774987529285';
  const { data: mochas } = await supabase.from('items').select('id').eq('name', 'MOCHA');
  const mochaToDelete = mochas?.filter(m => m.id !== mochaToKeep).map(m => m.id) || [];

  if (mochaToDelete.length > 0) {
    const { error: mochaErr } = await supabase.from('items').delete().in('id', mochaToDelete);
    if (mochaErr) console.error('Error deleting mocha duplicates:', mochaErr);
    else console.log(`Successfully deleted ${mochaToDelete.length} Mocha duplicates.`);
  }

  // 4. VERIFY BITKI CAYLARI (Ensure it's in the right place)
  const { data: bitki } = await supabase.from('items').select('*, categories(name)').ilike('name', 'Bitki Çayları');
  console.log('Bitki Çayları Current Status:', JSON.stringify(bitki, null, 2));

  console.log('--- FINAL DATABASE CLEANUP COMPLETE ---');
}

finalClean();
