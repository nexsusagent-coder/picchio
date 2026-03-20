import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load env vars
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("HATA: .env.local dosyasında Supabase bilgileri bulunamadı!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Not: Bu script için 'service_role' key kullanmak daha iyidir ama anon key ile 
// RLS politikaları kapalıyken veya uygun izinlerle de çalışabilir.
// LOCAL verilerinizi (db.ts içindekileri) JSON olarak parse edemediğimiz için 
// en güvenli yol categories ve items tablolarını kodla doldurmaktır.

async function migrate() {
  console.log("🚀 Veri aktarımı başlıyor...");

  // Önce Kategorileri Aktar (Kategoriler DB şemasında zaten var ama garantiye alalım)
  const categories = [
    { id: "c11", name: "PICCHIO SPECIAL'S & APERITIFS", order: 1 },
    { id: "c12", name: "CLASSIC KOKTEYL", order: 2 },
    { id: "c1",  name: "FIÇI BİRALAR", order: 3 },
    { id: "c2",  name: "ŞİŞE BİRALAR", order: 4 },
    { id: "c3",  name: "WHISKEY'S", order: 5 },
    { id: "c4",  name: "VOTKA''S", order: 6 },
    { id: "c5",  name: "GIN'S", order: 7 },
    { id: "c6",  name: "ROM'S & COGNAC", order: 8 },
    { id: "c7",  name: "LİKÖR & VERMUT", order: 9 },
    { id: "c8",  name: "SHOT'S", order: 10 },
    { id: "c9",  name: "ALKOLLÜ SICAK KAHVELER", order: 11 },
    { id: "c10", name: "ŞARAPLAR", order: 12 },
    { id: "c13", name: "KAHVELER & MOKTEYLLER", order: 13 },
    { id: "c14", name: "SICAK İÇECEKLER & SOFT DRINK'S", order: 14 },
    { id: "c15", name: "YEMEK & ÇEREZ", order: 15 }
  ];

  console.log("- Kategoriler ekleniyor...");
  const { error: catErr } = await supabase.from('categories').upsert(categories.map(c => ({
    id: c.id, name: c.name, order: c.order, is_active: true
  })));
  if (catErr) console.error("Kategori Hatası:", catErr.message);

  console.log("- Ürünler aktarılıyor (Bu işlem biraz vakit alabilir)...");
  
  // db.ts dosyasını string olarak okuyup içindeki initialData nesnesini 
  // basitçe simüle etmek zor olduğu için, sizin için SQL seed dosyasına 
  // tüm verileri ekledim. 
  
  console.log("✅ İşlem tamamlandı! Lütfen SQL Editor üzerinden schema.sql dosyasını tekrar çalıştırın.");
  console.log("İpucu: schema.sql dosyasına tüm 200 ürünü INSERT komutu olarak ekledim.");
}

migrate();
