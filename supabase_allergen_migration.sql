-- ============================================================
-- PICCHIO COCKTAIL — ALERJEN VERİSİ DÜZELTME MİGRASYONU
-- Supabase SQL Editor'de çalıştırın.
-- ============================================================

-- ADIM 1: Önce tüm null/boş alanları genel bir değerle doldur
-- (Sonraki adımlar kategori bazlı üzerine yazacak)
UPDATE items SET allergens = 'Sülfitler'
WHERE allergens IS NULL OR allergens = '' OR allergens = '""';

-- ADIM 2: BİRALAR (category_id c1 = Fıçı, c2 = Şişe)
UPDATE items SET allergens = 'Glüten, Sülfitler'
WHERE category_id IN ('c1', 'c2');

-- ADIM 3: TÜM ALKOLLER — sadece alkol kategorileri (varsayılan Sülfitler)
-- Whiskey, Votka, Gin, Rom/Cognac, Likör, Shot, Kokteyl, Şarap
UPDATE items SET allergens = 'Sülfitler'
WHERE category_id IN ('c3','c4','c5','c6','c7','c8','c10','c11','c12')
  AND (allergens IS NULL OR allergens NOT LIKE '%Süt Ürünleri%')
  AND (allergens IS NULL OR allergens NOT LIKE '%Kabuklu%');

-- ADIM 4: SÜT İÇEREN ALKOLLER (içerik bazlı)
UPDATE items SET allergens = 'Sülfitler, Süt Ürünleri'
WHERE category_id IN ('c7','c9','c11','c12')
  AND (
    ingredients ILIKE '%baileys%' OR
    ingredients ILIKE '%krema%' OR
    ingredients ILIKE '%süt%' OR
    ingredients ILIKE '%cream%' OR
    ingredients ILIKE '%hindistan cevizi kreması%'
  );

-- ADIM 5: KABUKLU YEMİŞ İÇEREN ALKOLLER (Disaronno / Amaretto)
UPDATE items SET allergens = 'Sülfitler, Sert Kabuklu Meyveler'
WHERE category_id IN ('c7','c11','c12')
  AND (
    ingredients ILIKE '%disaronno%' OR
    ingredients ILIKE '%amaretto%' OR
    name ILIKE '%disaronno%'
  );

-- ADIM 6: HEM SÜT HEM KABUKLU (Coffeina gibi)
UPDATE items SET allergens = 'Sülfitler, Süt Ürünleri, Sert Kabuklu Meyveler'
WHERE category_id IN ('c7','c9','c11','c12')
  AND (ingredients ILIKE '%baileys%' OR ingredients ILIKE '%krema%' OR ingredients ILIKE '%süt%')
  AND (ingredients ILIKE '%disaronno%' OR ingredients ILIKE '%amaretto%');

-- ADIM 7: ALKOLLÜ SICAK KAHVELER (c9: Irish Coffee, Baileys Coffee, Picchio Coffee)
UPDATE items SET allergens = 'Sülfitler, Süt Ürünleri, Kafein'
WHERE category_id = 'c9';

-- ADIM 8: KAFVELER & MOKTEYLLER (c13)
UPDATE items SET allergens = 'Kafein'
WHERE category_id = 'c13'
  AND (ingredients NOT ILIKE '%süt%' AND ingredients NOT ILIKE '%krema%');

UPDATE items SET allergens = 'Kafein, Süt Ürünleri'
WHERE category_id = 'c13'
  AND (ingredients ILIKE '%süt%' OR ingredients ILIKE '%krema%');

-- Mokteyl (alkolsüz, içinde süt/kafein yok)
UPDATE items SET allergens = 'Şeker / Tatlandırıcı'
WHERE category_id = 'c13'
  AND (name ILIKE '%mokteyl%' OR name ILIKE '%mocktail%');

-- ADIM 9: SICAK İÇECEKLER & SOFT DRINKS (c14)
-- Çay, Türk Kahvesi
UPDATE items SET allergens = 'Kafein'
WHERE category_id = 'c14'
  AND (name ILIKE '%çay%' OR name ILIKE '%kahve%' OR name ILIKE '%salep%' OR name ILIKE '%çikolata%');

-- Salep (süt var)
UPDATE items SET allergens = 'Kafein, Süt Ürünleri'
WHERE category_id = 'c14'
  AND (name ILIKE '%salep%' OR name ILIKE '%sıcak çikolata%' OR name ILIKE '%latte%')
  AND (ingredients ILIKE '%süt%' OR ingredients ILIKE '%krema%');

-- Soft drinks
UPDATE items SET allergens = 'Şeker / Tatlandırıcı'
WHERE category_id = 'c14'
  AND (name ILIKE '%cola%' OR name ILIKE '%fanta%' OR name ILIKE '%sprite%' OR name ILIKE '%soda%' OR name ILIKE '%meyve%');

-- RedBull / Churchill (kafein + şeker)
UPDATE items SET allergens = 'Kafein, Şeker / Tatlandırıcı'
WHERE category_id = 'c14'
  AND (name ILIKE '%redbull%' OR name ILIKE '%red bull%' OR name ILIKE '%churchill%' OR name ILIKE '%energy%');

-- Su
UPDATE items SET allergens = 'Alerjen İçermez'
WHERE category_id = 'c14'
  AND name ILIKE '%su%'
  AND name NOT ILIKE '%soda%';

-- ADIM 10: YEMEK & ÇEREZ (c15) — sadece eksik olanları doldur
UPDATE items SET allergens = 'Glüten, Süt Ürünleri'
WHERE category_id = 'c15' AND (name ILIKE '%alfredo%' OR name ILIKE '%bolonez%' OR name ILIKE '%penne%');

UPDATE items SET allergens = 'Glüten, Süt Ürünleri, Yumurta, Susam'
WHERE category_id = 'c15' AND (name ILIKE '%burger%' OR name ILIKE '%hamburger%');

UPDATE items SET allergens = 'Glüten, Yumurta'
WHERE category_id = 'c15' AND (name ILIKE '%tavuk%' OR name ILIKE '%çıtır%');

UPDATE items SET allergens = 'Süt Ürünleri'
WHERE category_id = 'c15' AND (name ILIKE '%peynir%' OR name ILIKE '%çikolata%');

UPDATE items SET allergens = 'Kabuklu Yemişler'
WHERE category_id = 'c15' AND (name ILIKE '%fıstık%' OR name ILIKE '%badem%' OR name ILIKE '%antep%' OR name ILIKE '%karışık%');

UPDATE items SET allergens = 'Sülfitler'
WHERE category_id = 'c15' AND name ILIKE '%turşu%';

-- ADIM 11: Son kontrol — hâlâ null kalanları genel değerle doldur
UPDATE items SET allergens = 'Sülfitler'
WHERE allergens IS NULL OR allergens = '' OR allergens = '""';

-- ADIM 12: Tekrar temizleme (virgülle ayrılmış değerlerdeki tırnakları sil)
UPDATE items SET allergens = REPLACE(allergens, '"', '')
WHERE allergens LIKE '%"%';

-- Sonucu kontrol et:
-- SELECT id, name, allergens FROM items ORDER BY category_id, name;
