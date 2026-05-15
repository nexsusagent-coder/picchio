import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing environment variables!")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function migrate() {
  console.log("Starting drink category migration...")

  // 1. Rename categories
  const { error: cat13 } = await supabase
    .from("categories")
    .update({ name: "KAHVELER & SICAK İÇECEKLER" })
    .eq("id", "c13")
  if (cat13) console.error("Error updating c13 name:", cat13)

  const { error: cat14 } = await supabase
    .from("categories")
    .update({ name: "MOKTEYLLER & SOFT DRINKS" })
    .eq("id", "c14")
  if (cat14) console.error("Error updating c14 name:", cat14)

  // 2. Reassign items
  // Mocktails to c14 (i-kah-6 was "ALKOLSÜZ MOKTEYL")
  const { error: itemMock } = await supabase
    .from("items")
    .update({ category_id: "c14" })
    .eq("id", "i-kah-6")
  if (itemMock) console.error("Error moving Mocktails to c14:", itemMock)

  // Hot drinks to c13
  const { error: itemHot } = await supabase
    .from("items")
    .update({ category_id: "c13" })
    .in("id", ["i-sic-1", "i-sic-2", "i-sic-3", "i-sic-4", "item-hot-chocolate", "i-sic-5"])
  if (itemHot) console.error("Error moving Hot Drinks to c13:", itemHot)

  console.log("Migration complete.")
}

migrate()
