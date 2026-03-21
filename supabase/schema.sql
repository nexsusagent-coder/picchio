-- ============================================================
-- PICCHIO COCKTAIL - COMPLETE MENU DATA (ALL ITEMS)
-- Run this in Supabase SQL Editor
-- ============================================================

-- Ensure new columns exist on the items table
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS image TEXT;

-- 1. CATEGORIES (All 15)
insert into public.categories (id, name, "order", is_active) values
  ('c11', 'PICCHIO SPECIALS & APERITIFS', 1, true),
  ('c12', 'CLASSIC KOKTEYL', 2, true),
  ('c1', 'FIÇI BİRALAR', 3, true),
  ('c2', 'ŞİŞE BİRALAR', 4, true),
  ('c3', 'WHISKEY''S', 5, true),
  ('c4', 'VOTKA''S', 6, true),
  ('c5', 'GIN''S', 7, true),
  ('c6', 'ROM''S & COGNAC', 8, true),
  ('c7', 'LİKÖR & VERMUT', 9, true),
  ('c8', 'SHOT''S', 10, true),
  ('c9', 'ALKOLLÜ SICAK KAHVELER', 11, true),
  ('c10', 'ŞARAPLAR', 12, true),
  ('c13', 'KAHVELER & MOKTEYLLER', 13, true),
  ('c14', 'SICAK İÇECEKLER & SOFT DRINK''S', 14, true),
  ('c15', 'YEMEK & ÇEREZ', 15, true)
on conflict (id) do update set name = excluded.name, "order" = excluded."order", is_active = excluded.is_active;

-- 2. DELETE old items to prevent duplicates
delete from public.item_variants;
delete from public.items;

-- 3. ALL ITEMS
insert into public.items (id, category_id, name, price, description, ingredients, allergens, tags, is_signature, is_recommended, is_available, volume, image) values
  -- ========== PICCHIO SPECIALS & APERITIFS ==========
  ('i-spec-1', 'c11', 'PICCHIO STAR', 399, 'Absolut Vanilya bazlı, Passion Fruit ile taçlandırılmış imza kokteyl', 'Absolut Vanilya · Passoa · Passion Fruit · Lime Suyu · Vegan Foamer', array['Sülfitler'], array['Tatlı','Ferah'], true, true, true, null, '/cocktail-star.png'),
  ('i-spec-2', 'c11', 'GRINCH', 399, 'London Dry Gin ve Kuzu Kulağı ile hazırlanan özgün kokteyl', 'London Dry Gin · Kuzu Kulağı · Lime Suyu · Vegan Foamer', array['Sülfitler'], array['Ekşi','Ferah'], true, true, true, null, '/cocktail-grinch.png'),
  ('i-spec-3', 'c11', 'HELLIOS', 399, 'Absolut Raspberry ve orman meyvelerinin büyülü karışımı', 'Absolut Raspberry · Ahududu Likörü · Orman Meyvesi · Lime Suyu · Vegan Foamer', array['Sülfitler'], array['Ekşi','Meyveli'], true, false, true, null, null),
  ('i-spec-4', 'c11', 'CASPER', 399, 'Tekila bazlı, bergamot ve şeftali aromalı hafif kokteyl', 'Olmeca Silver · Limon Suyu · Bergamot · Vanilya · Şeftali · Vegan Foamer', array['Sülfitler'], array['Tatlı','Meyveli','Ferah'], true, false, true, null, null),
  ('i-spec-5', 'c11', 'FUEGO', 399, 'Pink gin ve beyaz şeftali ile zarif bir keskinlik', 'Pink Gin · White Peach · Lime Suyu · Vegan Foamer', array['Sülfitler'], array['Ferah','Tatlı'], true, false, true, null, null),
  ('i-spec-6', 'c11', 'PICCHIO SURPRISE', 399, 'Gizli tarif — her seferinde farklı bir deneyim', '…Secret…', null, array['Tatlı','Meyveli'], true, false, true, null, null),
  ('i-spec-7', 'c11', 'COFFEINA', 449, 'Havana rom ve likör karışımıyla hazırlanan yoğun kahveli kokteyl', 'Havana · Disaronno · Baileys · Kahlua · Krema · Muz', array['Sülfitler','Süt Ürünleri'], array['Sert','Kahveli'], true, true, true, null, '/cocktail-coffeina.png'),
  ('i-spec-8', 'c11', 'SPRITZ (Aperol)', 399, 'Klasik İtalyan aperitif', 'Aperol · Prosecco · Soda · Portakal Dilimi', array['Sülfitler'], array['Ferah','Tatlı'], false, false, true, null, null),
  ('i-spec-9', 'c11', 'SPRITZ (Campari)', 399, 'Acı-tatlı dengesi', 'Campari · Prosecco · Soda · Portakal Dilimi', array['Sülfitler'], array['Bitter','Ferah'], false, false, true, null, null),
  ('i-spec-10', 'c11', 'SPRITZ (Lemoncello)', 399, 'Limon ferahlığı', 'Limoncello · Prosecco · Soda · Limon Dilimi', array['Sülfitler'], array['Ekşi','Ferah'], false, false, true, null, null),
  ('i-spec-11', 'c11', 'SPRITZ (Hugo)', 399, 'Mürver çiçeği aroması', 'Elderflower Şurubu · Prosecco · Soda · Nane', array['Sülfitler'], array['Tatlı','Ferah'], false, false, true, null, null),

  -- ========== CLASSIC KOKTEYL ==========
  ('i-clas-1', 'c12', 'MOJITO', 399, 'Küba''nın efsane kokteyli', 'Beyaz Rom · Lime · Nane · Şeker · Soda', array['Sülfitler'], array['Ferah','Ekşi'], false, false, true, null, null),
  ('i-clas-2', 'c12', 'PINA COLADA', 399, 'Tropikal lezzet', 'Beyaz Rom · Hindistan Cevizi Kreması · Ananas Suyu', array['Sülfitler','Süt Ürünleri'], array['Tatlı','Meyveli'], false, false, true, null, null),
  ('i-clas-3', 'c12', 'MARGARITA', 399, 'Meksika klasiği', 'Tekila · Triple Sec · Lime Suyu · Tuz', array['Sülfitler'], array['Ekşi','Sert'], false, false, true, null, null),
  ('i-clas-4', 'c12', 'NEGRONI', 449, 'İtalyan bitter klasiği', 'Gin · Campari · Sweet Vermouth', array['Sülfitler'], array['Bitter','Sert'], false, false, true, null, null),
  ('i-clas-5', 'c12', 'OLD FASHIONED', 449, 'Zamansız bir klasik', 'Bourbon · Angostura Bitters · Şeker · Portakal Kabuğu', array['Sülfitler'], array['Sert','Tatlı'], false, false, true, null, null),
  ('i-clas-6', 'c12', 'BOULEVARDIER', 449, 'Bourbon ile Negroni yorumu', 'Bourbon · Campari · Sweet Vermouth', array['Sülfitler'], array['Sert','Bitter'], false, false, true, null, null),
  ('i-clas-7', 'c12', 'LONG ISLAND ICE TEA', 449, 'Güçlü ve ferah', 'Votka · Gin · Rom · Tekila · Triple Sec · Limon · Cola', array['Sülfitler'], array['Sert','Ferah'], false, false, true, null, null),

  -- ========== FIÇI BİRALAR ==========
  ('i-fici-1', 'c1', 'GUINNESS', null, 'İrlanda stout birası', 'Su · Arpa Maltı · Arpa · Şerbetçiotu', array['Glüten'], array['Sert'], false, false, true, '25cl / 50cl', null),
  ('i-fici-2', 'c1', 'TUBORG 100 MALT', null, 'Premium fıçı biranın klasiği', 'Su · Arpa Maltı · Şerbetçiotu', array['Glüten'], null, false, false, true, '33cl / 50cl / 100cl', null),
  ('i-fici-3', 'c1', 'TUBORG 98100 GOLD MALT', null, 'Altın sarısı premium lager', null, array['Glüten'], null, false, false, true, '2.5l Biraver', null),
  ('i-fici-4', 'c1', 'Carlsberg', null, 'Danimarka''nın en iyisi', 'Su · Arpa Maltı · Şerbetçiotu', array['Glüten'], null, false, false, true, '33cl / 50cl / 100cl / 2.5l Biraver', null),
  ('i-fici-5', 'c1', 'Carlsberg LUNA', null, 'Hafif ve ferah lager', null, array['Glüten'], null, false, false, true, '33cl / 50cl', null),
  ('i-fici-6', 'c1', '1664 BLANC', null, 'Fransız buğday birası', 'Su · Buğday Maltı · Arpa Maltı · Şerbetçiotu · Kişniş · Portakal Kabuğu', array['Glüten'], null, false, false, true, '33cl / 50cl', null),
  ('i-fici-7', 'c1', 'FREDERIK YAKIMA IPA', null, 'Aromalı IPA', null, array['Glüten'], null, false, false, true, '33cl', null),
  ('i-fici-8', 'c1', 'Weihenstephan HEFEWEISSBIER', null, 'Alman buğday birası', 'Su · Buğday Maltı · Arpa Maltı · Şerbetçiotu · Maya', array['Glüten'], null, false, false, true, '33cl / 50cl', null),
  ('i-fici-9', 'c1', 'KILKENNY', null, 'İrlanda kırmızı ale birası', null, array['Glüten'], null, false, false, true, '25cl / 50cl', null),

  -- ========== ŞİŞE BİRALAR ==========
  ('i-sise-1', 'c2', 'GUINNESS (44cl Kutu)', 279, 'İrlanda stout', null, array['Glüten'], null, false, false, true, '44cl', null),
  ('i-sise-2', 'c2', 'TUBORG 100 MALT (50cl)', 159, null, null, array['Glüten'], null, false, false, true, '50cl', null),
  ('i-sise-3', 'c2', 'TUBORG ICE (33cl)', 199, null, null, array['Glüten'], null, false, false, true, '33cl', null),
  ('i-sise-4', 'c2', 'TUBORG 100 Filtresiz MALT (50cl)', 199, 'Filtresiz premium lager', null, array['Glüten'], null, false, false, true, '50cl', null),
  ('i-sise-5', 'c2', 'TUBORG 100 MALT Amber (50cl)', 199, 'Amber lager', null, array['Glüten'], null, false, false, true, '50cl', null),
  ('i-sise-6', 'c2', 'Carlsberg (50cl)', 169, null, null, array['Glüten'], null, false, false, true, '50cl', null),
  ('i-sise-7', 'c2', 'Carlsberg LUNA (50cl)', 199, 'Hafif lager', null, array['Glüten'], null, false, false, true, '50cl', null),
  ('i-sise-8', 'c2', '1664 BLANC (33cl)', 229, 'Fransız buğday birası', null, array['Glüten'], null, false, false, true, '33cl', null),
  ('i-sise-9', 'c2', 'FREDERIK (35cl)', 229, 'India Pale Ale · Yakima IPA · Wheat IPA · Marzen Lager · Brown Ale · Local · Meipa', null, array['Glüten'], null, false, false, true, '35cl', null),
  ('i-sise-10', 'c2', 'SOL CERVEZA (33cl)', 239, 'Meksika birası', null, array['Glüten'], null, false, false, true, '33cl', null),
  ('i-sise-11', 'c2', 'DESPERADOS (33cl)', 239, 'Tekila aromalı bira', 'Bira · Tekila Aroması', array['Glüten'], null, false, false, true, '33cl', null),
  ('i-sise-12', 'c2', 'Weihenstephan HEFEWEISSBIER / VITUS (33cl)', 239, 'Alman buğday birası', null, array['Glüten'], null, false, false, true, '33cl', null),
  ('i-sise-13', 'c2', 'GRIMBERGEN BLONDE / DOUBLE AMBREE (33cl)', 225, 'Belçika manastır birası', null, array['Glüten'], null, false, false, true, '33cl', null),

  -- ========== WHISKEY'S ==========
  ('i-whi-1', 'c3', 'JACK DANIEL''S', null, 'Klasik / Honey / Fire', 'Tennessee Whiskey', array['Sülfitler'], null, false, false, true, null, null),
  ('i-whi-2', 'c3', 'JAMESON', null, 'İrlanda Whiskey', 'Triple Distilled Irish Whiskey', array['Sülfitler'], null, false, false, true, null, null),
  ('i-whi-3', 'c3', 'CHIVAS REGAL', null, 'Blended Scotch Whisky', null, array['Sülfitler'], null, false, false, true, null, null),
  ('i-whi-4', 'c3', 'CHIVAS 18', null, 'Premium Blended Scotch', null, array['Sülfitler'], null, false, false, true, null, null),
  ('i-whi-5', 'c3', 'J. WALKER BLACK LABEL', null, 'Blended Scotch Whisky', null, array['Sülfitler'], null, false, false, true, null, null),
  ('i-whi-6', 'c3', 'GENTLEMAN JACK', null, 'Double Mellowed Whiskey', null, array['Sülfitler'], null, false, false, true, null, null),
  ('i-whi-7', 'c3', 'MACALLAN 12', null, 'Single Malt Scotch', null, array['Sülfitler'], null, false, false, true, null, null),
  ('i-whi-8', 'c3', 'JIM BEAM', null, 'Kentucky Bourbon', null, array['Sülfitler'], null, false, false, true, null, null),

  -- ========== VOTKA'S ==========
  ('i-vot-1', 'c4', 'ABSOLUT', 300, 'Klasik · Vanilia · Citron · Raspberry', 'İsveç Votkası · %40 ABV', array['Sülfitler'], null, false, false, true, '5cl', null),
  ('i-vot-2', 'c4', 'SMIRNOFF', 300, 'Triple Distilled Votka', null, array['Sülfitler'], null, false, false, true, '5cl', null),
  ('i-vot-3', 'c4', 'BELVEDERE', 450, 'Polonya Premium Votka', null, array['Sülfitler'], null, false, false, true, '5cl', null),

  -- ========== GIN'S ==========
  ('i-gin-1', 'c5', 'BEEFEATER / PINK', 300, 'London Dry Gin', 'Ardıç · Botanikler', array['Sülfitler'], null, false, false, true, '5cl', null),
  ('i-gin-2', 'c5', 'GORDON''S', 300, 'London Dry Gin', null, array['Sülfitler'], null, false, false, true, '5cl', null),
  ('i-gin-3', 'c5', 'BOMBAY SAPPHIRE', 400, 'Vapour Infused Gin', null, array['Sülfitler'], null, false, false, true, '5cl', null),

  -- ========== ROM'S & COGNAC ==========
  ('i-rom-1', 'c6', 'HAVANA / BACARDI / CAPTAIN MORGAN', 350, 'Karayip Romu', null, array['Sülfitler'], null, false, false, true, '5cl', null),
  ('i-rom-2', 'c6', 'HENNESSY', null, 'Fransız Cognac', null, array['Sülfitler'], null, false, false, true, null, null),

  -- ========== LİKÖR & VERMUT ==========
  ('i-lik-1', 'c7', 'KAHLUA / MALIBU / LEMONCELLO / ŞEFTALİ / NANE', 250, 'Popüler likörler', null, array['Sülfitler'], null, false, false, true, null, null),
  ('i-lik-2', 'c7', 'BAILEYS', 275, 'İrlanda Kremalı Likör', null, array['Sülfitler','Süt Ürünleri'], null, false, false, true, null, null),
  ('i-lik-3', 'c7', 'DISARONNO', 300, 'Amaretto Likörü', null, array['Sülfitler','Kabuklu Yemişler'], null, false, false, true, null, null),
  ('i-lik-4', 'c7', 'GARRONE (Triple Sec / Rosso / Extra Dry / Bianco)', null, 'İtalyan Vermut çeşitleri', null, array['Sülfitler'], null, false, false, true, null, null),

  -- ========== SHOT'S ==========
  ('i-sho-1', 'c8', 'OLMECA SILVER / JAGERMEISTER / F-16 / PICCHIO / SAMBUCA', 175, null, null, array['Sülfitler'], null, false, false, true, null, null),
  ('i-sho-2', 'c8', 'DON JULIO BLANCO / REPOSADO', 250, 'Premium Meksika Tekilası', null, array['Sülfitler'], null, false, false, true, null, null),
  ('i-sho-3', 'c8', 'JAGERMEISTER MANIFEST', 225, 'Premium herbal likör', null, array['Sülfitler'], null, false, false, true, null, null),
  ('i-sho-4', 'c8', 'JACK DANIELS FIRE / HONEY', 200, null, null, array['Sülfitler'], null, false, false, true, null, null),

  -- ========== ALKOLLÜ SICAK KAHVELER ==========
  ('i-asc-1', 'c9', 'IRISH COFFEE', 399, 'İrlanda Whiskey ile hazırlanan sıcak kahve', 'İrlanda Whiskey · Espresso · Krema', array['Sülfitler','Süt Ürünleri'], null, false, false, true, null, null),
  ('i-asc-2', 'c9', 'BAILEYS COFFEE', 399, 'Baileys ile kremsi sıcak kahve', 'Baileys · Espresso · Krema', array['Sülfitler','Süt Ürünleri'], null, false, false, true, null, null),
  ('i-asc-3', 'c9', 'PICCHIO COFFEE', 399, 'İmza sıcak kahve', null, array['Sülfitler','Süt Ürünleri'], null, false, false, true, null, null),

  -- ========== ŞARAPLAR ==========
  ('i-sar-1', 'c10', 'Standart (Kırmızı, Beyaz, Rose)', null, null, null, array['Sülfitler'], null, false, false, true, null, null),
  ('i-sar-2', 'c10', 'Premium Rose', null, null, null, array['Sülfitler'], null, false, false, true, null, null),
  ('i-sar-3', 'c10', 'SANGRIA (Kırmızı, Beyaz, Rose)', null, 'Şarap ve mevsim meyveleri', 'Şarap · Mevsim Meyveleri', array['Sülfitler'], null, false, false, true, null, null),

  -- ========== KAHVELER & MOKTEYLLER ==========
  ('i-kah-1', 'c13', 'ESPRESSO (Single)', 169, null, null, null, null, false, false, true, null, null),
  ('i-kah-1b', 'c13', 'ESPRESSO (Double)', 179, null, null, null, null, false, false, true, null, null),
  ('i-kah-2', 'c13', 'AMERICANO', 189, null, 'Espresso · Sıcak Su', null, null, false, false, true, null, null),
  ('i-kah-3', 'c13', 'LATTE', 199, null, 'Espresso · Buharda Süt', array['Süt Ürünleri'], null, false, false, true, null, null),
  ('i-kah-4', 'c13', 'CAPPUCCINO', 199, null, 'Espresso · Buharda Süt · Süt Köpüğü', array['Süt Ürünleri'], null, false, false, true, null, null),
  ('i-kah-5', 'c13', 'MOCHA (Klasik / White / Caramel)', 229, null, 'Espresso · Çikolata · Süt', array['Süt Ürünleri'], null, false, false, true, null, null),
  ('i-kah-6', 'c13', 'ALKOLSÜZ MOKTEYL', 249, 'Cool Lime · Berry Hibiscus ve diğerleri', 'Taze Meyveler · Soda', null, array['Alkolsüz','Ferah'], false, false, true, null, null),

  -- ========== SICAK İÇECEKLER & SOFT DRINK'S ==========
  ('i-sic-1', 'c14', 'Çay', 70, null, null, null, null, false, false, true, null, null),
  ('i-sic-2', 'c14', 'Çay (Fincan)', 100, null, null, null, null, false, false, true, null, null),
  ('i-sic-3', 'c14', 'Türk Kahvesi', 149, null, null, null, null, false, false, true, null, null),
  ('i-sic-4', 'c14', 'Salep', 149, null, null, array['Süt Ürünleri'], null, false, false, true, null, null),
  ('i-sic-5', 'c14', 'Sıcak Çikolata', 149, null, null, array['Süt Ürünleri'], null, false, false, true, null, null),
  ('i-sic-5b', 'c14', 'Bitki Çayları', 149, null, null, null, null, false, false, true, null, null),
  ('i-sic-6', 'c14', 'Cola / Fanta / Sprite / Fuse Tea', 129, null, null, null, null, false, false, true, null, null),
  ('i-sic-7', 'c14', 'REDBULL', 169, null, null, null, null, false, false, true, null, null),
  ('i-sic-8', 'c14', 'Su', 49, null, null, null, null, false, false, true, null, null),
  ('i-sic-9', 'c14', 'Soda', 89, null, null, null, null, false, false, true, null, null),
  ('i-sic-10', 'c14', 'Meyveli Soda', 99, null, null, null, null, false, false, true, null, null),
  ('i-sic-11', 'c14', 'Churchill', 159, null, null, null, null, false, false, true, null, null),

  -- ========== YEMEK & ÇEREZ ==========
  ('i-yem-1', 'c15', 'PICCHIO Bira Tabağı', 400, 'Atıştırmalıklar ve dip soslar', null, array['Glüten','Süt Ürünleri'], null, false, false, true, null, null),
  ('i-yem-2', 'c15', 'Patates Tabağı', 200, null, null, array['Glüten'], null, false, false, true, null, null),
  ('i-yem-3', 'c15', 'Çıtır Tavuk', 350, null, null, array['Glüten','Yumurta'], null, false, false, true, null, null),
  ('i-yem-4', 'c15', 'Hamburger', 300, null, null, array['Glüten','Süt Ürünleri','Yumurta','Susam'], null, false, false, true, null, null),
  ('i-yem-5', 'c15', 'Chicken Burger', 300, null, null, array['Glüten','Süt Ürünleri','Yumurta','Susam'], null, false, false, true, null, null),
  ('i-yem-6', 'c15', 'Cheese Burger', 325, null, null, array['Glüten','Süt Ürünleri','Yumurta','Susam'], null, false, false, true, null, null),
  ('i-yem-7', 'c15', 'Penne Alfredo', 350, null, null, array['Glüten','Süt Ürünleri'], null, false, false, true, null, null),
  ('i-yem-8', 'c15', 'Penne Bolonez', 350, null, null, array['Glüten','Süt Ürünleri'], null, false, false, true, null, null),
  ('i-yem-9', 'c15', 'Peynir Tabağı', 300, null, null, array['Süt Ürünleri'], null, false, false, true, null, null),
  ('i-yem-10', 'c15', 'Antep Fıstığı', 200, null, null, array['Kabuklu Yemişler'], null, false, false, true, null, null),
  ('i-yem-11', 'c15', 'Badem', 200, null, null, array['Kabuklu Yemişler'], null, false, false, true, null, null),
  ('i-yem-12', 'c15', 'Karışık Kuruyemiş', 200, null, null, array['Kabuklu Yemişler'], null, false, false, true, null, null),
  ('i-yem-13', 'c15', 'Çikolata', 200, null, null, array['Süt Ürünleri'], null, false, false, true, null, null),
  ('i-yem-14', 'c15', 'Jelibon', 200, null, null, null, null, false, false, true, null, null),
  ('i-yem-15', 'c15', 'Tuzlu Fıstık', 100, null, null, array['Kabuklu Yemişler'], null, false, false, true, null, null),
  ('i-yem-16', 'c15', 'Turşu', 100, null, null, null, null, false, false, true, null, null);

-- 4. VARIANTS (Whiskey, Cognac, Wine, Garrone)
insert into public.item_variants (item_id, label, price) values
  -- JACK DANIEL'S
  ('i-whi-1', 'Tek', 350), ('i-whi-1', 'Duble', 550),
  -- JAMESON
  ('i-whi-2', 'Tek', 320), ('i-whi-2', 'Duble', 510),
  -- CHIVAS REGAL
  ('i-whi-3', 'Tek', 350), ('i-whi-3', 'Duble', 550),
  -- CHIVAS 18
  ('i-whi-4', 'Tek', 500), ('i-whi-4', 'Duble', 750),
  -- J. WALKER BLACK LABEL
  ('i-whi-5', 'Tek', 350), ('i-whi-5', 'Duble', 550),
  -- GENTLEMAN JACK
  ('i-whi-6', 'Tek', 375), ('i-whi-6', 'Duble', 575),
  -- MACALLAN 12
  ('i-whi-7', 'Tek', 450), ('i-whi-7', 'Duble', 700),
  -- JIM BEAM
  ('i-whi-8', 'Tek', 350), ('i-whi-8', 'Duble', 550),
  -- HENNESSY
  ('i-rom-2', 'Tek', 400), ('i-rom-2', 'Duble', 600),
  -- Standart Wine
  ('i-sar-1', 'Kadeh', 200), ('i-sar-1', 'Şişe', 899),
  -- Premium Rose
  ('i-sar-2', 'Kadeh', 250), ('i-sar-2', 'Şişe', 1099),
  -- SANGRIA
  ('i-sar-3', 'Kadeh', 250), ('i-sar-3', 'Şişe', 1099),
  -- GARRONE
  ('i-lik-4', 'Triple Sec / Rosso', 250), ('i-lik-4', 'Extra Dry / Bianco', 300);

-- 5. ANNOUNCEMENTS
insert into public.announcements (id, text, is_active, type) values
  ('ann-1', '🎉 Bu hafta sonu canlı müzik! Cuma & Cumartesi 21:00''de buluşalım.', true, 'promo'),
  ('ann-2', '⚠️ Mutfak siparişleri saat 23:00''e kadar alınmaktadır.', false, 'info')
on conflict (id) do update set text = excluded.text, is_active = excluded.is_active;
