-- ============================================================
-- PICCHIO COCKTAIL - NEON PostgreSQL VERİ
-- Adım 2: Bu dosyayı Adım 1'den sonra çalıştır
-- ============================================================

-- 1. KATEGORİLER
INSERT INTO categories (id, name, "order", is_active) VALUES
  ('c11', 'PICCHIO SPECIAL''S & APERITIFS', 1, true),
  ('c12', 'CLASSIC KOKTEYL', 2, true),
  ('c1',  'FIÇI BİRALAR', 3, true),
  ('c2',  'ŞİŞE BİRALAR', 4, true),
  ('c3',  'WHISKEY''S', 5, true),
  ('c4',  'VOTKA''S', 6, true),
  ('c5',  'GIN''S', 7, true),
  ('c6',  'ROM''S & COGNAC', 8, true),
  ('c7',  'LİKÖR & VERMUT', 9, true),
  ('c8',  'SHOT''S', 10, true),
  ('c9',  'ALKOLLÜ SICAK KAHVELER', 11, true),
  ('c10', 'ŞARAPLAR', 12, true),
  ('c13', 'KAHVELER & SICAK İÇECEKLER', 13, true),
  ('c14', 'MOKTEYLLER & SOFT DRINKS', 14, true),
  ('c15', 'YEMEK & ÇEREZ', 15, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, "order" = EXCLUDED."order", is_active = EXCLUDED.is_active;

-- 2. ÜRÜNLER
INSERT INTO items (id, category_id, name, price, description, ingredients, allergens, tags, is_signature, is_recommended, is_available, volume, image_url) VALUES
  -- ========== PICCHIO SPECIAL'S & APERITIFS ==========
  ('i-spec-1',  'c11', 'PICCHIO STAR',     399, 'Absolut Vanilya bazlı, Passion Fruit ile taçlandırılmış imza kokteyl', 'Absolut Vanilya · Passoa · Passion Fruit · Lime Suyu · Vegan Foamer', ARRAY['Sülfitler'], ARRAY['Tatlı','Ferah'],       true,  true,  true, NULL, '/cocktail-star.png'),
  ('i-spec-2',  'c11', 'GRINCH',           399, 'London Dry Gin ve Kuzu Kulağı ile hazırlanan özgün kokteyl',           'London Dry Gin · Kuzu Kulağı · Lime Suyu · Vegan Foamer',             ARRAY['Sülfitler'], ARRAY['Ekşi','Ferah'],        true,  true,  true, NULL, '/cocktail-grinch.png'),
  ('i-spec-3',  'c11', 'HELLIOS',          399, 'Absolut Raspberry ve orman meyvelerinin büyülü karışımı',              'Absolut Raspberry · Ahududu Likörü · Orman Meyvesi · Lime Suyu · Vegan Foamer', ARRAY['Sülfitler'], ARRAY['Ekşi','Meyveli'], true, false, true, NULL, NULL),
  ('i-spec-4',  'c11', 'CASPER',           399, 'Tekila bazlı, bergamot ve şeftali aromalı hafif kokteyl',              'Olmeca Silver · Limon Suyu · Bergamot · Vanilya · Şeftali · Vegan Foamer', ARRAY['Sülfitler'], ARRAY['Tatlı','Meyveli','Ferah'], true, false, true, NULL, NULL),
  ('i-spec-5',  'c11', 'FUEGO',            399, 'Pink gin ve beyaz şeftali ile zarif bir keskinlik',                    'Pink Gin · White Peach · Lime Suyu · Vegan Foamer',                   ARRAY['Sülfitler'], ARRAY['Ferah','Tatlı'],       true,  false, true, NULL, NULL),
  ('i-spec-6',  'c11', 'PICCHIO SURPRISE', 399, 'Gizli tarif — her seferinde farklı bir deneyim',                       '…Secret…',                                                             NULL,               ARRAY['Tatlı','Meyveli'],     true,  false, true, NULL, NULL),
  ('i-spec-7',  'c11', 'COFFEINA',         449, 'Havana rom ve likör karışımıyla hazırlanan yoğun kahveli kokteyl',     'Havana · Disaronno · Baileys · Kahlua · Krema · Muz',                 ARRAY['Sülfitler','Süt Ürünleri','Sert Kabuklu Meyveler'], ARRAY['Sert','Kahveli'], true, true, true, NULL, '/cocktail-coffeina.png'),
  ('i-spec-8',  'c11', 'SPRITZ (Aperol)',      399, 'Klasik İtalyan aperitif',   'Aperol · Prosecco · Soda · Portakal Dilimi',    ARRAY['Sülfitler'], ARRAY['Ferah','Tatlı'],  false, false, true, NULL, NULL),
  ('i-spec-9',  'c11', 'SPRITZ (Campari)',     399, 'Acı-tatlı dengesi',         'Campari · Prosecco · Soda · Portakal Dilimi',   ARRAY['Sülfitler'], ARRAY['Bitter','Ferah'], false, false, true, NULL, NULL),
  ('i-spec-10', 'c11', 'SPRITZ (Lemoncello)', 399, 'Limon ferahlığı',           'Limoncello · Prosecco · Soda · Limon Dilimi',   ARRAY['Sülfitler'], ARRAY['Ekşi','Ferah'],   false, false, true, NULL, NULL),
  ('i-spec-11', 'c11', 'SPRITZ (Hugo)',        399, 'Mürver çiçeği aroması',     'Elderflower Şurubu · Prosecco · Soda · Nane',   ARRAY['Sülfitler'], ARRAY['Tatlı','Ferah'],  false, false, true, NULL, NULL),

  -- ========== CLASSIC KOKTEYL ==========
  ('i-clas-1', 'c12', 'MOJITO',               399, 'Küba''nın efsane kokteyli',  'Beyaz Rom · Lime · Nane · Şeker · Soda',                   ARRAY['Sülfitler'], ARRAY['Ferah','Ekşi'],   false, false, true, NULL, NULL),
  ('i-clas-2', 'c12', 'PINA COLADA',          399, 'Tropikal lezzet',            'Beyaz Rom · Hindistan Cevizi Kreması · Ananas Suyu',       ARRAY['Sülfitler','Süt Ürünleri'], ARRAY['Tatlı','Meyveli'], false, false, true, NULL, NULL),
  ('i-clas-3', 'c12', 'MARGARITA',            399, 'Meksika klasiği',            'Tekila · Triple Sec · Lime Suyu · Tuz',                    ARRAY['Sülfitler'], ARRAY['Ekşi','Sert'],     false, false, true, NULL, NULL),
  ('i-clas-4', 'c12', 'NEGRONI',              449, 'İtalyan bitter klasiği',     'Gin · Campari · Sweet Vermouth',                           ARRAY['Sülfitler'], ARRAY['Bitter','Sert'],   false, false, true, NULL, NULL),
  ('i-clas-5', 'c12', 'OLD FASHIONED',        449, 'Zamansız bir klasik',        'Bourbon · Angostura Bitters · Şeker · Portakal Kabuğu',    ARRAY['Sülfitler'], ARRAY['Sert','Tatlı'],   false, false, true, NULL, NULL),
  ('i-clas-6', 'c12', 'BOULEVARDIER',         449, 'Bourbon ile Negroni yorumu', 'Bourbon · Campari · Sweet Vermouth',                       ARRAY['Sülfitler'], ARRAY['Sert','Bitter'],  false, false, true, NULL, NULL),
  ('i-clas-7', 'c12', 'LONG ISLAND ICE TEA',  449, 'Güçlü ve ferah',            'Votka · Gin · Rom · Tekila · Triple Sec · Limon · Cola',   ARRAY['Sülfitler'], ARRAY['Sert','Ferah'],   false, false, true, NULL, NULL),

  -- ========== FIÇI BİRALAR ==========
  ('i-fici-1', 'c1', 'GUINNESS',                  NULL, 'İrlanda stout birası',        'Su · Arpa Maltı · Şerbetçiotu',     ARRAY['Glüten','Sülfitler'], NULL, false, false, true, '25cl / 50cl', NULL),
  ('i-fici-2', 'c1', 'TUBORG 100 MALT',           NULL, 'Premium fıçı biranın klasiği','Su · Arpa Maltı · Şerbetçiotu',     ARRAY['Glüten','Sülfitler'], NULL, false, false, true, '33cl / 50cl / 100cl', NULL),
  ('i-fici-3', 'c1', 'TUBORG GOLD MALT',          NULL, 'Altın sarısı premium lager',  NULL,                                ARRAY['Glüten','Sülfitler'], NULL, false, false, true, '2.5l Biraver', NULL),
  ('i-fici-4', 'c1', 'Carlsberg',                 NULL, 'Danimarka''nın en iyisi',     'Su · Arpa Maltı · Şerbetçiotu',     ARRAY['Glüten','Sülfitler'], NULL, false, false, true, '33cl / 50cl / 100cl / 2.5l', NULL),
  ('i-fici-5', 'c1', 'Carlsberg LUNA',            NULL, 'Hafif ve ferah lager',        NULL,                                ARRAY['Glüten','Sülfitler'], NULL, false, false, true, '33cl / 50cl', NULL),
  ('i-fici-6', 'c1', '1664 BLANC',               NULL, 'Fransız buğday birası',       'Su · Buğday Maltı · Arpa Maltı · Şerbetçiotu · Kişniş · Portakal Kabuğu', ARRAY['Glüten','Sülfitler'], NULL, false, false, true, '33cl / 50cl', NULL),
  ('i-fici-7', 'c1', 'FREDERIK YAKIMA IPA',       NULL, 'Aromalı IPA',                NULL,                                ARRAY['Glüten','Sülfitler'], NULL, false, false, true, '33cl', NULL),
  ('i-fici-8', 'c1', 'Weihenstephan HEFEWEISSBIER',NULL,'Alman buğday birası',        'Su · Buğday Maltı · Arpa Maltı · Şerbetçiotu · Maya', ARRAY['Glüten','Sülfitler'], NULL, false, false, true, '33cl / 50cl', NULL),
  ('i-fici-9', 'c1', 'KILKENNY',                  NULL, 'İrlanda kırmızı ale birası', NULL,                                ARRAY['Glüten','Sülfitler'], NULL, false, false, true, '25cl / 50cl', NULL),

  -- ========== ŞİŞE BİRALAR ==========
  ('i-sise-1',  'c2', 'GUINNESS (44cl Kutu)',               279, NULL, NULL, ARRAY['Glüten','Sülfitler'], NULL, false, false, true, '44cl', NULL),
  ('i-sise-2',  'c2', 'TUBORG 100 MALT (50cl)',             159, NULL, NULL, ARRAY['Glüten','Sülfitler'], NULL, false, false, true, '50cl', NULL),
  ('i-sise-3',  'c2', 'TUBORG ICE (33cl)',                  199, NULL, NULL, ARRAY['Glüten','Sülfitler'], NULL, false, false, true, '33cl', NULL),
  ('i-sise-4',  'c2', 'TUBORG 100 Filtresiz MALT (50cl)',   199, 'Filtresiz premium lager', NULL, ARRAY['Glüten','Sülfitler'], NULL, false, false, true, '50cl', NULL),
  ('i-sise-5',  'c2', 'TUBORG 100 MALT Amber (50cl)',       199, 'Amber lager', NULL, ARRAY['Glüten','Sülfitler'], NULL, false, false, true, '50cl', NULL),
  ('i-sise-6',  'c2', 'Carlsberg (50cl)',                   169, NULL, NULL, ARRAY['Glüten','Sülfitler'], NULL, false, false, true, '50cl', NULL),
  ('i-sise-7',  'c2', 'Carlsberg LUNA (50cl)',              199, 'Hafif lager', NULL, ARRAY['Glüten','Sülfitler'], NULL, false, false, true, '50cl', NULL),
  ('i-sise-8',  'c2', '1664 BLANC (33cl)',                  229, NULL, NULL, ARRAY['Glüten','Sülfitler'], NULL, false, false, true, '33cl', NULL),
  ('i-sise-9',  'c2', 'FREDERIK Serisi (35cl)',             229, 'India Pale Ale, Yakima IPA, Wheat IPA, Marzen Lager, Brown Ale, Local, Meipa', NULL, ARRAY['Glüten','Sülfitler'], NULL, false, false, true, '35cl', NULL),
  ('i-sise-10', 'c2', 'SOL CERVEZA (33cl)',                 239, 'Meksika birası', NULL, ARRAY['Glüten','Sülfitler'], NULL, false, false, true, '33cl', NULL),
  ('i-sise-11', 'c2', 'DESPERADOS (33cl)',                  239, 'Tekila aromalı bira', 'Bira · Tekila Aroması', ARRAY['Glüten','Sülfitler'], NULL, false, false, true, '33cl', NULL),
  ('i-sise-12', 'c2', 'Weihenstephan (33cl)',               239, 'HEFEWEISSBIER / VITUS', NULL, ARRAY['Glüten','Sülfitler'], NULL, false, false, true, '33cl', NULL),
  ('i-sise-13', 'c2', 'GRIMBERGEN (33cl)',                  225, 'BLONDE / DOUBLE AMBREE', NULL, ARRAY['Glüten','Sülfitler'], NULL, false, false, true, '33cl', NULL),

  -- ========== WHISKEY'S ==========
  ('i-whi-1', 'c3', 'JACK DANIEL''S',    NULL, 'Klasik / Honey / Fire',           'Tennessee Whiskey · %40 ABV',    ARRAY['Sülfitler'], NULL, false, false, true, NULL, NULL),
  ('i-whi-2', 'c3', 'JAMESON',           NULL, 'İrlanda Whiskey',                 'Triple Distilled Whiskey · %40', ARRAY['Sülfitler'], NULL, false, false, true, NULL, NULL),
  ('i-whi-3', 'c3', 'CHIVAS REGAL',      NULL, 'Blended Scotch Whisky',           NULL,                             ARRAY['Sülfitler'], NULL, false, false, true, NULL, NULL),
  ('i-whi-4', 'c3', 'CHIVAS 18',         NULL, 'Premium Blended Scotch',          NULL,                             ARRAY['Sülfitler'], NULL, false, false, true, NULL, NULL),
  ('i-whi-5', 'c3', 'J. WALKER BLACK LABEL', NULL, 'Blended Scotch Whisky',       NULL,                             ARRAY['Sülfitler'], NULL, false, false, true, NULL, NULL),
  ('i-whi-6', 'c3', 'GENTLEMAN JACK',    NULL, 'Double Mellowed Tennessee Whiskey', NULL,                           ARRAY['Sülfitler'], NULL, false, false, true, NULL, NULL),
  ('i-whi-7', 'c3', 'MACALLAN 12',       NULL, 'Single Malt Scotch · Sherry Oak', NULL,                             ARRAY['Sülfitler'], NULL, false, false, true, NULL, NULL),
  ('i-whi-8', 'c3', 'JIM BEAM',          NULL, 'Kentucky Bourbon',                NULL,                             ARRAY['Sülfitler'], NULL, false, false, true, NULL, NULL),

  -- ========== VOTKA'S ==========
  ('i-vot-1', 'c4', 'ABSOLUT',   300, 'Klasik · Vanilia · Citron · Raspberry', 'İsveç Votkası · %40 ABV', ARRAY['Sülfitler'], NULL, false, false, true, '5cl', NULL),
  ('i-vot-2', 'c4', 'SMIRNOFF',  300, 'Triple Distilled Votka',                NULL,                      ARRAY['Sülfitler'], NULL, false, false, true, '5cl', NULL),
  ('i-vot-3', 'c4', 'BELVEDERE', 450, 'Polonya Premium Votka',                 NULL,                      ARRAY['Sülfitler'], NULL, false, false, true, '5cl', NULL),

  -- ========== GIN'S ==========
  ('i-gin-1', 'c5', 'BEEFEATER / PINK', 300, 'London Dry Gin',     'Ardıç · Botanikler', ARRAY['Sülfitler'], NULL, false, false, true, '5cl', NULL),
  ('i-gin-2', 'c5', 'GORDON''S',        300, 'London Dry Gin',     NULL,                 ARRAY['Sülfitler'], NULL, false, false, true, '5cl', NULL),
  ('i-gin-3', 'c5', 'BOMBAY SAPPHIRE', 400, 'Vapour Infused Gin', NULL,                 ARRAY['Sülfitler'], NULL, false, false, true, '5cl', NULL),

  -- ========== ROM'S & COGNAC ==========
  ('i-rom-1', 'c6', 'HAVANA / BACARDI / CAPTAIN MORGAN', 350, 'Karayip Romu', NULL, ARRAY['Sülfitler'], NULL, false, false, true, '5cl', NULL),
  ('i-rom-2', 'c6', 'HENNESSY',                          NULL, 'V.S Cognac · Fransa', NULL, ARRAY['Sülfitler'], NULL, false, false, true, NULL, NULL),

  -- ========== LİKÖR & VERMUT ==========
  ('i-lik-1', 'c7', 'KAHLUA / MALIBU / LEMONCELLO / ŞEFTALİ / NANE', 250, 'Çeşitli meyve ve bitki bazlı likörler', NULL, ARRAY['Sülfitler'], NULL, false, false, true, NULL, NULL),
  ('i-lik-2', 'c7', 'BAILEYS',        275, 'İrlanda Kremalı Likör · %17 ABV', 'İrlanda Kreması · Kakao · Vanilya', ARRAY['Sülfitler','Süt Ürünleri'], NULL, false, false, true, NULL, NULL),
  ('i-lik-3', 'c7', 'DISARONNO',      300, 'Amaretto Likörü · %28 ABV',       'Badem Aroması',                     ARRAY['Sülfitler','Sert Kabuklu Meyveler'], NULL, false, false, true, NULL, NULL),
  ('i-lik-4', 'c7', 'GARRONE Serisi', NULL, 'Triple Sec / Rosso / Extra Dry / Bianco', 'İtalyan Vermut · Botanikler', ARRAY['Sülfitler'], NULL, false, false, true, NULL, NULL),

  -- ========== SHOT'S ==========
  ('i-sho-1', 'c8', 'OLMECA SILVER / JAGERMEISTER / F-16 / PICCHIO / SAMBUCA', 175, NULL, NULL, ARRAY['Sülfitler'], NULL, false, false, true, NULL, NULL),
  ('i-sho-2', 'c8', 'DON JULIO BLANCO / REPOSADO',                             250, 'Premium Meksika Tekilası · %38 ABV', NULL, ARRAY['Sülfitler'], NULL, false, false, true, NULL, NULL),
  ('i-sho-3', 'c8', 'JAGERMEISTER MANIFEST',                                   225, '56 Botanik · Meşe Fıçı · %38 ABV',  NULL, ARRAY['Sülfitler'], NULL, false, false, true, NULL, NULL),
  ('i-sho-4', 'c8', 'JACK DANIELS FIRE / HONEY',                               200, 'Tennessee Whiskey · Tarçın / Bal Aroması', NULL, ARRAY['Sülfitler'], NULL, false, false, true, NULL, NULL),

  -- ========== ALKOLLÜ SICAK KAHVELER ==========
  ('i-asc-1', 'c9', 'IRISH COFFEE',   399, 'İrlanda Whiskey ile hazırlanan sıcak kahve', 'İrlanda Whiskey · Espresso · Krema',   ARRAY['Sülfitler','Süt Ürünleri'], NULL, false, false, true, NULL, NULL),
  ('i-asc-2', 'c9', 'BAILEYS COFFEE', 399, 'Baileys ile kremsi sıcak kahve',              'Baileys · Espresso · Krema',           ARRAY['Sülfitler','Süt Ürünleri'], NULL, false, false, true, NULL, NULL),
  ('i-asc-3', 'c9', 'PICCHIO COFFEE', 399, 'İmza sıcak kahve',                            'Özel likör karışımı · Espresso · Krema', ARRAY['Sülfitler','Süt Ürünleri'], NULL, false, false, true, NULL, NULL),

  -- ========== ŞARAPLAR ==========
  ('i-sar-1', 'c10', 'Standart (Kırmızı, Beyaz, Rose)', NULL, NULL, NULL, ARRAY['Sülfitler'], NULL, false, false, true, NULL, NULL),
  ('i-sar-2', 'c10', 'Premium Rose',                    NULL, NULL, NULL, ARRAY['Sülfitler'], NULL, false, false, true, NULL, NULL),
  ('i-sar-3', 'c10', 'SANGRIA (Kırmızı, Beyaz, Rose)', NULL, 'Şarap ve mevsim meyveleri', 'Şarap · Mevsim Meyveleri · Portakal · Şeker', ARRAY['Sülfitler'], NULL, false, false, true, NULL, NULL),

  -- ========== KAHVELER & SICAK İÇECEKLER ==========
  ('i-kah-1', 'c13', 'ESPRESSO',                       169, NULL, '100% Arabica',                    ARRAY['Kafein'], NULL, false, false, true, 'Single', NULL),
  ('i-kah-2', 'c13', 'ESPRESSO Double',                179, NULL, '100% Arabica',                    ARRAY['Kafein'], NULL, false, false, true, 'Double', NULL),
  ('i-kah-3', 'c13', 'AMERICANO',                      189, NULL, 'Espresso · Sıcak Su',             ARRAY['Kafein'], NULL, false, false, true, NULL, NULL),
  ('i-kah-4', 'c13', 'LATTE',                          199, NULL, 'Espresso · Buharda Süt',          ARRAY['Kafein','Süt Ürünleri'], NULL, false, false, true, NULL, NULL),
  ('i-kah-5', 'c13', 'CAPPUCCINO',                     199, NULL, 'Espresso · Buharda Süt · Köpük',  ARRAY['Kafein','Süt Ürünleri'], NULL, false, false, true, NULL, NULL),
  ('i-kah-6', 'c13', 'MOCHA (Klasik / White / Caramel)', 229, NULL, 'Espresso · Çikolata · Süt · Krema', ARRAY['Kafein','Süt Ürünleri'], NULL, false, false, true, NULL, NULL),
  ('i-sic-1', 'c13', 'Çay',                            70,  NULL, NULL, NULL, NULL, false, false, true, 'Bardak', NULL),
  ('i-sic-2', 'c13', 'Çay (Fincan)',                   100, NULL, NULL, NULL, NULL, false, false, true, 'Fincan', NULL),
  ('i-sic-3', 'c13', 'Türk Kahvesi',                   149, NULL, 'Türk Kahve Çekirdeği', ARRAY['Kafein'], NULL, false, false, true, NULL, NULL),
  ('i-sic-4', 'c13', 'Salep',                          149, NULL, 'Salep · Süt · Tarçın', ARRAY['Süt Ürünleri'], NULL, false, false, true, NULL, NULL),
  ('i-sic-5', 'c13', 'Sıcak Çikolata',                149, NULL, 'Çikolata · Süt · Krema', ARRAY['Süt Ürünleri'], NULL, false, false, true, NULL, NULL),
  ('i-sic-6', 'c13', 'Bitki Çayları',                  149, NULL, NULL, NULL, NULL, false, false, true, NULL, NULL),

  -- ========== MOKTEYLLER & SOFT DRINKS ==========
  ('i-mok-1', 'c14', 'ALKOLSÜZ MOKTEYL (Cool Lime, Berry Hibiscus vb.)', 249, NULL, 'Taze Meyveler · Şeker Şurubu · Soda', NULL, ARRAY['Alkolsüz','Ferah'], false, false, true, NULL, NULL),
  ('i-sof-1', 'c14', 'Cola / Fanta / Sprite / Fuse Tea', 129, NULL, NULL, NULL, NULL, false, false, true, NULL, NULL),
  ('i-sof-2', 'c14', 'REDBULL',                          169, NULL, NULL, ARRAY['Kafein'], NULL, false, false, true, NULL, NULL),
  ('i-sof-3', 'c14', 'Su',                               49,  NULL, NULL, NULL, NULL, false, false, true, NULL, NULL),
  ('i-sof-4', 'c14', 'Soda',                             89,  NULL, NULL, NULL, NULL, false, false, true, NULL, NULL),
  ('i-sof-5', 'c14', 'Meyveli Soda',                     99,  NULL, NULL, NULL, NULL, false, false, true, NULL, NULL),
  ('i-sof-6', 'c14', 'Churchill',                        159, NULL, NULL, NULL, NULL, false, false, true, NULL, NULL),

  -- ========== YEMEK & ÇEREZ ==========
  ('i-yem-1',  'c15', 'PICCHIO Bira Tabağı',  400, 'Çeşitli atıştırmalıklar ve dip soslar', NULL, ARRAY['Glüten','Süt Ürünleri'], NULL, false, false, true, NULL, NULL),
  ('i-yem-2',  'c15', 'Patates Tabağı',       200, NULL, NULL, ARRAY['Glüten'], NULL, false, false, true, NULL, NULL),
  ('i-yem-3',  'c15', 'Çıtır Tavuk',          350, NULL, NULL, ARRAY['Glüten','Yumurta'], NULL, false, false, true, NULL, NULL),
  ('i-yem-4',  'c15', 'Hamburger',            300, NULL, NULL, ARRAY['Glüten','Süt Ürünleri','Yumurta','Susam'], NULL, false, false, true, NULL, NULL),
  ('i-yem-5',  'c15', 'Chicken Burger',       300, NULL, NULL, ARRAY['Glüten','Süt Ürünleri','Yumurta','Susam'], NULL, false, false, true, NULL, NULL),
  ('i-yem-6',  'c15', 'Cheese Burger',        325, NULL, NULL, ARRAY['Glüten','Süt Ürünleri','Yumurta','Susam'], NULL, false, false, true, NULL, NULL),
  ('i-yem-7',  'c15', 'Penne Alfredo',        350, NULL, 'Penne · Krema · Parmesan · Sarımsak', ARRAY['Glüten','Süt Ürünleri'], NULL, false, false, true, NULL, NULL),
  ('i-yem-8',  'c15', 'Penne Bolonez',        350, NULL, 'Penne · Kıyma · Domates Sosu · Parmesan', ARRAY['Glüten','Süt Ürünleri'], NULL, false, false, true, NULL, NULL),
  ('i-yem-9',  'c15', 'Peynir Tabağı',        300, NULL, NULL, ARRAY['Süt Ürünleri'], NULL, false, false, true, NULL, NULL),
  ('i-yem-10', 'c15', 'Antep Fıstığı / Badem / Karışık', 200, NULL, NULL, ARRAY['Kabuklu Yemişler'], NULL, false, false, true, NULL, NULL),
  ('i-yem-11', 'c15', 'Çikolata / Jelibon',  200, NULL, NULL, ARRAY['Süt Ürünleri'], NULL, false, false, true, NULL, NULL),
  ('i-yem-12', 'c15', 'Tuzlu Fıstık',        100, NULL, NULL, ARRAY['Kabuklu Yemişler'], NULL, false, false, true, NULL, NULL),
  ('i-yem-13', 'c15', 'Turşu',               100, NULL, NULL, NULL, NULL, false, false, true, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- 3. VARYANTlar (Tek/Duble fiyatlar)
INSERT INTO item_variants (item_id, label, price) VALUES
  ('i-whi-1', 'Tek', 350), ('i-whi-1', 'Duble', 550),
  ('i-whi-2', 'Tek', 320), ('i-whi-2', 'Duble', 510),
  ('i-whi-3', 'Tek', 350), ('i-whi-3', 'Duble', 550),
  ('i-whi-4', 'Tek', 500), ('i-whi-4', 'Duble', 750),
  ('i-whi-5', 'Tek', 350), ('i-whi-5', 'Duble', 550),
  ('i-whi-6', 'Tek', 375), ('i-whi-6', 'Duble', 575),
  ('i-whi-7', 'Tek', 450), ('i-whi-7', 'Duble', 700),
  ('i-whi-8', 'Tek', 350), ('i-whi-8', 'Duble', 550),
  ('i-rom-2', 'Tek', 400), ('i-rom-2', 'Duble', 600),
  ('i-sar-1', 'Kadeh', 200), ('i-sar-1', 'Şişe', 899),
  ('i-sar-2', 'Kadeh', 250), ('i-sar-2', 'Şişe', 1099),
  ('i-sar-3', 'Kadeh', 250), ('i-sar-3', 'Şişe', 1099),
  ('i-lik-4', 'Triple Sec / Rosso', 250), ('i-lik-4', 'Extra Dry / Bianco', 300);

-- 4. DUYURULAR
INSERT INTO announcements (id, text, is_active, type) VALUES
  ('ann-1', '🎉 Bu hafta sonu canlı müzik! Cuma & Cumartesi 21:00''de buluşalım.', true,  'promo'),
  ('ann-2', '⚠️ Mutfak siparişleri saat 23:00''e kadar alınmaktadır.',             false, 'info')
ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text, is_active = EXCLUDED.is_active;

-- 5. SİTE AYARLARI
INSERT INTO site_settings (id, address, phone, instagram_url, whatsapp_url, maps_url, working_hours, menu_title, hero_logo_url) VALUES (
  1,
  'Alsancak, Kültür Mahallesi 1388 Sokak, İzmir',
  '+90 555 123 45 67',
  'https://instagram.com/picchiococktail',
  'https://wa.me/905551234567',
  'https://maps.google.com/?q=Picchio+Cocktail+Alsancak',
  'Hafta İçi: 18:00 - 02:00 | Hafta Sonu: 18:00 - 04:00',
  'PICCHIO COCKTAIL BAR MENÜSÜ',
  '/logo.png'
)
ON CONFLICT (id) DO NOTHING;

-- Tamamlandı
SELECT 'Tüm veriler başarıyla yüklendi!' AS durum, COUNT(*) AS urun_sayisi FROM items;
