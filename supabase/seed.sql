-- ============================================================
-- PICCHIO COCKTAIL - SEED DATA
-- ============================================================

-- 1. CATEGORIES
INSERT INTO public.categories (id, name, "order", is_active) VALUES
  ('c11', 'PICCHIO SPECIAL''S & APERITIFS', 1, true),
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
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, "order" = EXCLUDED."order", is_active = EXCLUDED.is_active;

-- 2. CAMPAIGNS & SETTINGS
INSERT INTO public.campaigns (id, title, description, type, is_active)
VALUES ('camp-shot-1plus1', '1+1 Shot Kampanyası', 'Tüm shotlarda geçerli! Bir shot alana ikincisi bizden.', 'animated', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.site_settings (id, address, phone, instagram_url, whatsapp_url, maps_url)
VALUES (1, 'Alsancak, Kültür Mahallesi 1388 Sokak, İzmir', '+90 555 123 45 67', 'https://instagram.com/picchiococktail', 'https://wa.me/905551234567', 'https://maps.google.com/?q=Picchio+Cocktail+Alsancak')
ON CONFLICT (id) DO NOTHING;

-- 3. PRODUCT DATA
-- (Shortened example, see full_database_restore.sql for complete 200 items)
-- Specials
INSERT INTO public.items (id, category_id, name, price, description, is_available, is_recommended, is_signature, allergens) VALUES 
('item-spec-star', 'c11', 'Picchio Star', 399, 'Absolut Vanilya, Passoa, Passion Fruit, Lime Suyu, Vegan Foamer', true, true, true, 'Sülfitler'),
('item-spec-grinch', 'c11', 'Grinch', 399, 'London Dry Gin, Kuzu Kulağı, Lime Suyu, Vegan Foamer', true, true, true, 'Sülfitler'),
('item-spec-hellios', 'c11', 'Hellios', 399, 'Absolut Raspberry, Ahududu Likörü, Orman Meyvesi, Lime Suyu, Vegan Foamer', true, true, true, 'Sülfitler'),
('item-spec-casper', 'c11', 'Casper', 399, 'Olmeca Silver, Limon Suyu, Bergamot, Vanilya, Şeftali, Vegan Foamer', true, true, true, 'Sülfitler'),
('item-spec-coffeina', 'c11', 'Coffeina', 449, 'Havana, Disaronno, Baileys, Kahlua, Krema, Muz', true, true, true, 'Sülfitler, Süt Ürünleri, Sert Kabuklu Meyveler');

-- Classics
INSERT INTO public.items (id, category_id, name, price, description, is_available, allergens) VALUES 
('item-classic-negroni', 'c12', 'Campari Negroni', 449, 'Campari, Cin, Kırmızı Vermut', true, 'Sülfitler'),
('item-classic-pinacolada', 'c12', 'Pina Colada', 399, 'Rom, Malibu, Ananas Suyu, Süt', true, 'Sülfitler, Süt Ürünleri'),
('item-classic-mojito', 'c12', 'Mojito', 399, 'Rom, Lime, Nane, Şeker, Soda', true, 'Sülfitler');

-- Beers
INSERT INTO public.items (id, category_id, name, price, is_available, allergens) VALUES 
('item-beer-guinness', 'c2', 'Guinness Kutu (44cl)', 279, true, 'Gluten, Sülfitler'),
('item-beer-tuborg-gold', 'c2', 'Tuborg Gold (50cl)', 159, true, 'Gluten, Sülfitler');

-- Whiskey
INSERT INTO public.items (id, category_id, name, price, price_secondary, price_label, price_secondary_label, is_available, allergens) VALUES 
('item-whiskey-jack', 'c3', 'Jack Daniel''s', 350, 550, 'Tek', 'Duble', true, 'Sülfitler');

-- ... (Rest of items)
