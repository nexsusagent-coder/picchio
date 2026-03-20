-- ============================================================
-- PICCHIO COCKTAIL - 🍹 FINAL 100% RECOVERY SQL (ALL ITEMS)
-- ============================================================

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
on conflict (id) do update set name = excluded.name, "order" = excluded.order;

-- 2. ALL ITEMS (FULL LIST)
insert into public.items (id, category_id, name, price, ingredients, allergens, tags, is_signature, is_recommended, volume) values
  -- SPECIALS
  ('i-spec-1', 'c11', 'PICCHIO STAR', 399, 'Absolut Vanilya · Passoa · Passion Fruit · Lime Suyu · Vegan Foamer', array['Sülfitler'], array['Tatlı','Ferah'], true, true, null),
  ('i-spec-2', 'c11', 'GRINCH', 399, 'London Dry Gin · Kuzu Kulağı · Lime Suyu · Vegan Foamer', array['Sülfitler'], array['Ekşi','Ferah'], true, true, null),
  ('i-spec-3', 'c11', 'HELLIOS', 399, 'Absolut Raspberry · Ahududu Likörü · Orman Meyvesi · Lime Suyu · Vegan Foamer', array['Sülfitler'], array['Ekşi','Meyveli'], true, false, null),
  ('i-spec-4', 'c11', 'CASPER', 399, 'Olmeca Silver · Limon Suyu · Bergamot · Vanilya · Şeftali · Vegan Foamer', array['Sülfitler'], array['Tatlı','Meyveli','Ferah'], true, false, null),
  ('i-spec-5', 'c11', 'FUEGO', 399, 'Pink Gin · White Peach · Lime Suyu · Vegan Foamer', array['Sülfitler'], array['Ferah','Tatlı'], true, false, null),
  ('i-spec-6', 'c11', 'PICCHIO SURPRISE', 399, '…Secret…', null, array['Tatlı','Meyveli'], true, false, null),
  ('i-spec-7', 'c11', 'COFFEINA', 449, 'Havana · Disaronno · Baileys · Kahlua · Krema · Muz', array['Sülfitler','Süt Ürünleri'], array['Sert','Kahveli'], true, true, null),
  ('i-spec-8', 'c11', 'SPRITZ (Aperol)', 399, 'Aperol, Prosecco, Soda, Portakal Dilimi', array['Sülfitler'], array['Ferah','Tatlı'], false, false, null),
  ('i-spec-9', 'c11', 'SPRITZ (Campari)', 399, 'Campari, Prosecco, Soda, Portakal Dilimi', array['Sülfitler'], array['Bitter','Ferah'], false, false, null),
  ('i-spec-10', 'c11', 'SPRITZ (Lemoncello)', 399, 'Limoncello, Prosecco, Soda, Limon Dilimi', array['Sülfitler'], array['Ekşi','Ferah'], false, false, null),
  ('i-spec-11', 'c11', 'SPRITZ (Hugo)', 399, 'Elderflower Şurubu, Prosecco, Soda, Nane', array['Sülfitler'], array['Tatlı','Ferah'], false, false, null),
  -- CLASSICS
  ('i-clas-1', 'c12', 'Mojito', 399, 'Beyaz Rom, Lime, Nane, Şeker, Soda', array['Sülfitler'], array['Ferah', 'Ekşi'], false, false, null),
  ('i-clas-2', 'c12', 'Pina Colada', 399, 'Beyaz Rom, Hindistan Cevizi Kreması, Ananas Suyu', array['Sülfitler', 'Süt Ürünleri'], array['Tatlı', 'Meyveli'], false, false, null),
  ('i-clas-3', 'c12', 'Margarita', 399, 'Tekila, Triple Sec, Lime Suyu, Tuz', array['Sülfitler'], array['Ekşi', 'Sert'], false, false, null),
  ('i-clas-4', 'c12', 'NEGRONI', 449, 'Gin, Campari, Sweet Vermouth', array['Sülfitler'], array['Bitter', 'Sert'], false, false, null),
  ('i-clas-5', 'c12', 'OLD FASHIONED', 449, 'Bourbon, Angostura Bitters, Şeker, Portakal Kabuğu', array['Sülfitler'], array['Sert', 'Tatlı'], false, false, null),
  ('i-clas-6', 'c12', 'BOULEVARDIER', 449, 'Bourbon, Campari, Sweet Vermouth', array['Sülfitler'], array['Sert', 'Bitter'], false, false, null),
  ('i-clas-7', 'c12', 'LONG ISLAND ICE TEA', 449, 'Votka, Gin, Rom, Tekila, Triple Sec, Limon, Cola', array['Sülfitler'], array['Sert', 'Ferah'], false, false, null),
  -- BEERS (Draught)
  ('i-fici-1', 'c1', 'GUINNESS', null, 'Su, Arpa Maltı, Arpa, Şerbetçiotu', array['Glüten'], array['Sert'], false, false, '25cl / 50cl'),
  ('i-fici-2', 'c1', 'TUBORG 100 MALT', null, 'Su, Arpa Maltı, Şerbetçiotu', array['Glüten'], null, false, false, '33cl / 50cl / 100cl'),
  ('i-fici-4', 'c1', 'Carlsberg', null, 'Su, Arpa Maltı, Şerbetçiotu', array['Glüten'], null, false, false, '33cl / 50cl / 100cl / 2.5l'),
  ('i-fici-6', 'c1', '1664 BLANC', null, 'Su, Buğday Maltı, Arpa Maltı, Şerbetçiotu, Kişniş, Portakal Kabuğu', array['Glüten'], null, false, false, '33cl / 50cl'),
  ('i-fici-8', 'c1', 'Weihenstephan HEFEWEISSBIER', null, 'Su, Buğday Maltı, Arpa Maltı, Şerbetçiotu, Maya', array['Glüten'], null, false, false, '33cl / 50cl'),
  -- BEERS (Bottle)
  ('i-sise-1', 'c2', 'GUINNESS (44cl Kutu)', 279, null, array['Glüten'], null, false, false, null),
  ('i-sise-2', 'c2', 'TUBORG 100 MALT (50cl)', 159, null, array['Glüten'], null, false, false, null),
  ('i-sise-3', 'c2', 'TUBORG ICE (33cl)', 199, null, array['Glüten'], null, false, false, null),
  ('i-sise-8', 'c2', '1664 BLANC (33cl)', 229, null, array['Glüten'], null, false, false, null),
  ('i-sise-10', 'c2', 'SOL CERVEZA (33cl)', 239, null, array['Glüten'], null, false, false, null),
  ('i-sise-11', 'c2', 'DESPERADOS (33cl)', 239, 'Bira, Tekila Aroması', array['Glüten'], null, false, false, null),
  -- VOTKA
  ('i-vot-1', 'c4', 'ABSOLUT', 300, 'İsveç Votkası, %40 ABV', array['Sülfitler'], null, false, false, null),
  ('i-vot-2', 'c4', 'SMIRNOFF', 300, 'Triple Distilled Votka', array['Sülfitler'], null, false, false, null),
  ('i-vot-3', 'c4', 'BELVEDERE', 450, 'Polonya Premium Votka', array['Sülfitler'], null, false, false, null),
  -- GIN
  ('i-gin-1', 'c5', 'BEEFEATER / PINK', 300, 'London Dry Gin, Ardıç', array['Sülfitler'], null, false, false, null),
  ('i-gin-2', 'c5', 'GORDON''S', 300, 'London Dry Gin', array['Sülfitler'], null, false, false, null),
  ('i-gin-3', 'c5', 'BOMBAY SAPPHIRE', 400, 'Vapour Infused Gin', array['Sülfitler'], null, false, false, null),
  -- ROM & COGNAC
  ('i-rom-1', 'c6', 'HAVANA / BACARDI / CAPTAIN MORGAN', 350, 'Karayip Romu', array['Sülfitler'], null, false, false, null),
  -- LİKÖR
  ('i-lik-1', 'c7', 'KAHLUA / MALIBU / LEMONCELLO', 250, null, array['Sülfitler','Süt Ürünleri'], null, false, false, null),
  ('i-lik-2', 'c7', 'BAILEYS', 275, 'İrlanda Kremalı Likör', array['Sülfitler','Süt Ürünleri'], null, false, false, null),
  ('i-lik-3', 'c7', 'DISARONNO', 300, 'Amaretto Likörü', array['Sülfitler','Kabuklu Yemişler'], null, false, false, null),
  -- SHOTS
  ('i-sho-1', 'c8', 'SHOT MIX (Olmeca/Jager/etc)', 175, null, array['Sülfitler'], null, false, false, null),
  ('i-sho-2', 'c8', 'DON JULIO BLANCO / REPOSADO', 250, 'Premium Meksika Tekilası', array['Sülfitler'], null, false, false, null),
  -- HOT ALC
  ('i-asc-1', 'c9', 'IRISH COFFEE', 399, 'İrlanda Whiskey, Espresso, Krema', array['Sülfitler','Süt Ürünleri'], null, false, false, null),
  ('i-asc-2', 'c9', 'BAILEYS COFFEE', 399, 'Baileys, Espresso, Krema', array['Sülfitler','Süt Ürünleri'], null, false, false, null),
  -- WINES
  ('i-sar-1', 'c10', 'Standart (Kırmızı, Beyaz, Rose)', null, null, array['Sülfitler'], null, false, false, null),
  ('i-sar-3', 'c10', 'SANGRIA', null, 'Şarap, Mevsim Meyveleri', array['Sülfitler'], null, false, false, null),
  -- COFFEE & MOCKTAILS
  ('i-kah-1', 'c13', 'ESPRESSO', null, null, null, null, false, false, null),
  ('i-kah-3', 'c13', 'LATTE', 199, 'Espresso, Buharda Süt', array['Süt Ürünleri'], null, false, false, null),
  ('i-kah-6', 'c13', 'ALKOLSÜZ MOKTEYL', 249, 'Taze Meyveler, Soda', null, array['Alkolsüz','Ferah'], false, false, null),
  -- SOFT DRINKS
  ('i-sic-6', 'c14', 'Cola / Fanta / Sprite / Fuse Tea', 129, null, null, null, false, false, null),
  ('i-sic-7', 'c14', 'REDBULL', 169, null, null, null, false, false, null),
  ('i-sic-11', 'c14', 'Churchill', 159, null, null, null, false, false, null),
  -- FOOD
  ('i-yem-1', 'c15', 'PICCHIO Bira Tabağı', 400, 'Atıştırmalıklar ve dip soslar', array['Glüten','Süt Ürünleri'], null, false, false, null),
  ('i-yem-2', 'c15', 'Patates Tabağı', 200, null, array['Glüten'], null, false, false, null),
  ('i-yem-4', 'c15', 'Hamburger', 300, null, array['Glüten','Süt Ürünleri','Yumurta','Susam'], null, false, false, null),
  ('i-yem-9', 'c15', 'Peynir Tabağı', 300, null, array['Süt Ürünleri'], null, false, false, null)
on conflict (id) do update set price = excluded.price, ingredients = excluded.ingredients, volume = excluded.volume;

-- 3. VARIANTS (Whiskey & Wine)
insert into public.items (id, category_id, name) values 
  ('i-whi-1', 'c3', 'JACK DANIEL''S'), 
  ('i-whi-2', 'c3', 'JAMESON'),
  ('i-whi-7', 'c3', 'MACALLAN 12'),
  ('i-sar-1-v', 'c10', 'Standart Kadeh/Şişe')
on conflict (id) do nothing;

insert into public.item_variants (item_id, label, price) values 
  ('i-whi-1', 'Tek', 350), ('i-whi-1', 'Duble', 550),
  ('i-whi-2', 'Tek', 320), ('i-whi-2', 'Duble', 510),
  ('i-whi-7', 'Tek', 450), ('i-whi-7', 'Duble', 700),
  ('i-sar-1-v', 'Kadeh', 200), ('i-sar-1-v', 'Şişe', 899)
on conflict (id) do nothing;

-- 4. ANNOUNCEMENTS
insert into public.announcements (id, text, is_active, type) values
  ('ann-1', '🎉 Bu hafta sonu canlı müzik! Cuma & Cumartesi 21:00''de buluşalım.', true, 'promo'),
  ('ann-2', '⚠️ Mutfak siparişleri saat 23:00''e kadar alınmaktadır.', false, 'info')
on conflict (id) do update set text = excluded.text, is_active = excluded.is_active;
