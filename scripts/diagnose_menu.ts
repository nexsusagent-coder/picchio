import { getCategories, getItems } from './src/lib/api';

async function diagnose() {
  try {
    const cats = await getCategories();
    const items = await getItems();

    console.log('--- CATEGORIES ---');
    cats.sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(c => {
      console.log(`[${c.id}] ${c.name} (Order: ${c.order})`);
    });

    console.log('\n--- HOT DRINKS & TEA SEARCH ---');
    const searchItems = items.filter(i => 
      i.name.toLowerCase().includes('ay') || 
      i.name.toLowerCase().includes('tea') || 
      i.category_id === 'c_hot' || 
      i.category_id === '24' ||
      i.category_id.toLowerCase().includes('sicak')
    );
    searchItems.forEach(i => {
      console.log(`[${i.id}] ${i.name} - Cat: ${i.category_id} - Price: ${i.price}`);
    });

    console.log('\n--- MOCKTAIL CHECK ---');
    const mocktails = items.filter(i => i.name.toLowerCase().includes('lime') || i.name.toLowerCase().includes('berry') || i.category_id === '23');
    mocktails.forEach(i => {
      console.log(`[${i.id}] ${i.name} - Cat: ${i.category_id}`);
    });

  } catch (err) {
    console.error(err);
  }
}

diagnose();
