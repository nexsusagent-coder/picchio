-- ============================================================
-- PICCHIO COCKTAIL - NEON PostgreSQL ŞEMA
-- Adım 1: Bu dosyayı Neon SQL Editor'de çalıştır
-- ============================================================

-- CATEGORIES tablosu
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ITEMS tablosu
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC,
  price_secondary NUMERIC,
  price_label TEXT,
  price_secondary_label TEXT,
  description TEXT,
  ingredients TEXT,
  allergens TEXT[],
  tags TEXT[],
  volume TEXT,
  abv NUMERIC,
  is_available BOOLEAN DEFAULT true,
  is_special BOOLEAN DEFAULT false,
  is_signature BOOLEAN DEFAULT false,
  is_recommended BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  taste_intensity TEXT,
  service_style TEXT,
  calories INTEGER,
  is_vegan BOOLEAN DEFAULT false,
  is_vegetarian BOOLEAN DEFAULT false,
  allergen_details TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ITEM_VARIANTS tablosu (Tek/Duble gibi fiyat varyantları)
CREATE TABLE IF NOT EXISTS item_variants (
  id SERIAL PRIMARY KEY,
  item_id TEXT REFERENCES items(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  price NUMERIC NOT NULL
);

-- ANNOUNCEMENTS tablosu (Duyuru banner'ları)
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  type TEXT DEFAULT 'info',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CAMPAIGNS tablosu (Kampanya kartları)
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'special',
  image_urls TEXT[] DEFAULT '{}',
  price NUMERIC,
  is_active BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SITE_SETTINGS tablosu (Site ayarları)
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  address TEXT,
  phone TEXT,
  instagram_url TEXT,
  whatsapp_url TEXT,
  maps_url TEXT,
  working_hours TEXT,
  menu_title TEXT DEFAULT 'Picchio Cocktail Bar Menüsü',
  is_header_visible BOOLEAN DEFAULT true,
  hero_logo_url TEXT DEFAULT '/logo.png',
  primary_color TEXT DEFAULT '#4E0000',
  secondary_color TEXT DEFAULT '#1a0404',
  accent_gold TEXT DEFAULT '#D4AF37',
  bg_gradient_start TEXT DEFAULT '#4E0000',
  bg_gradient_end TEXT DEFAULT '#000000',
  button_color TEXT DEFAULT '#4a0e0e',
  font_family TEXT DEFAULT 'Inter'
);

-- ACTIVITY_LOG tablosu (Admin işlem geçmişi)
CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  entity_name TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Başarı mesajı
SELECT 'Şema başarıyla oluşturuldu! Adım 2: neon_2_seed.sql dosyasını çalıştır.' AS durum;
