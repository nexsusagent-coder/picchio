-- ============================================================
-- SUPABASE OTOMATIK STORAGE TEMIZLIK SISTEMI
-- ============================================================
-- Bu SQL'i Supabase Dashboard > SQL Editor'da calistirin.
--
-- Yaptiklari:
-- 1. image_version → her gorsel degistiginde otomatik artar (cache busting)
-- 2. cleanup_log → silinen dosya kayitlari tutulur
-- 3. pg_cron → haftalik otomatik orphan temizligi
-- ============================================================

-- ============================================================
-- ADIM 1: image_version kolonu ekle (cache busting)
-- ============================================================
ALTER TABLE items ADD COLUMN IF NOT EXISTS image_version INTEGER DEFAULT 1;

-- image_url her degistiginde version'u otomatik artir
CREATE OR REPLACE FUNCTION increment_image_version()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.image_url IS DISTINCT FROM OLD.image_url THEN
    NEW.image_version = COALESCE(OLD.image_version, 1) + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_image_version ON items;
CREATE TRIGGER trg_image_version
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION increment_image_version();

-- ============================================================
-- ADIM 2: Temizlik log tablosu
-- ============================================================
CREATE TABLE IF NOT EXISTS cleanup_log (
  id BIGSERIAL PRIMARY KEY,
  bucket TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  deleted_at TIMESTAMPTZ DEFAULT NOW(),
  triggered_by TEXT DEFAULT 'manual'
);

-- ============================================================
-- ADIM 3: Storage orphan dosya referans tablosu (cache)
-- Bu tablo audit sonuclarini saklar, tekrar tekrar listelemeye gerek kalmaz
-- ============================================================
CREATE TABLE IF NOT EXISTS storage_snapshot (
  id BIGSERIAL PRIMARY KEY,
  bucket TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  created_at TIMESTAMPTZ,
  snapshot_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bucket, file_path)
);

-- ============================================================
-- ADIM 4: Otomatik orphan tespit fonksiyonu
-- Bu fonksiyon storage'daki tum dosyalari tarar ve DB'de
-- referansi olmayanlari dondurur.
-- NOT: Supabase JS client ile kullanilmak uzere tasarlanmistir.
-- pg_cron uzerinden dogrudan storage API'sine erisilemez.
-- ============================================================

-- Bu fonksiyon sadece DB'deki image_url referanslarini normalize eder.
-- Asil silme islemi API route (/api/admin/cleanup-images) uzerinden yapilir.
CREATE OR REPLACE FUNCTION get_active_storage_paths()
RETURNS TABLE(storage_path TEXT) AS $$
BEGIN
  -- Urun gorselleri
  RETURN QUERY
  SELECT
    CASE
      WHEN image_url LIKE '%/storage/v1/object/public/%'
      THEN SUBSTRING(image_url FROM '/storage/v1/object/public/[^/]+/(.+)$')
      ELSE NULL
    END AS storage_path
  FROM items
  WHERE image_url IS NOT NULL AND image_url != ''
    AND image_url LIKE '%supabase.co%'
  UNION
  -- Kampanya gorselleri
  SELECT
    CASE
      WHEN url LIKE '%/storage/v1/object/public/%'
      THEN SUBSTRING(url FROM '/storage/v1/object/public/[^/]+/(.+)$')
      ELSE NULL
    END
  FROM campaigns c,
       LATERAL (SELECT unnest(c.image_urls) AS url WHERE c.image_urls IS NOT NULL) AS urls
  WHERE url LIKE '%supabase.co%'
  UNION
  -- Site ayarlari (logo)
  SELECT
    CASE
      WHEN hero_logo_url LIKE '%/storage/v1/object/public/%'
      THEN SUBSTRING(hero_logo_url FROM '/storage/v1/object/public/[^/]+/(.+)$')
      ELSE NULL
    END
  FROM site_settings
  WHERE hero_logo_url IS NOT NULL AND hero_logo_url != ''
    AND hero_logo_url LIKE '%supabase.co%';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ADIM 5: pg_cron ile haftalik otomatik raporlama
-- NOT: pg_cron yalnizca Pro plan ve uzerinde aktiftir.
-- Eger pg_cron yoksa bu adimi atlayin, uygulama seviyesinde
-- API route zaten admin panelden 1 tikla calisir.
-- ============================================================

-- pg_cron extension'i yukle (sadece Pro plan)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Haftalik Pazar gunu 03:00'te calisacak cron job
-- SELECT cron.schedule(
--   'weekly-storage-audit',
--   '0 3 * * 0',
--   $$
--   INSERT INTO storage_snapshot (bucket, file_path, file_size, created_at)
--   SELECT 'product-images', name, metadata->>'size', created_at
--   FROM storage.objects WHERE bucket_id = 'product-images'
--   ON CONFLICT (bucket, file_path) DO NOTHING;
--   $$
-- );

-- ============================================================
-- ADIM 6: item silindiginde log tutan trigger
-- ============================================================
CREATE OR REPLACE FUNCTION log_deleted_item_image()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.image_url IS NOT NULL AND OLD.image_url != '' THEN
    INSERT INTO cleanup_log (bucket, file_path, triggered_by)
    VALUES (
      CASE
        WHEN OLD.image_url LIKE '%/product-images/%' THEN 'product-images'
        WHEN OLD.image_url LIKE '%/campaign-images/%' THEN 'campaign-images'
        ELSE 'unknown'
      END,
      OLD.image_url,
      'item-delete-trigger'
    );
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_item_deleted ON items;
CREATE TRIGGER trg_item_deleted
  BEFORE DELETE ON items
  FOR EACH ROW EXECUTE FUNCTION log_deleted_item_image();

-- ============================================================
-- KONTROL SORGULARI (manuel calistirabilirsiniz)
-- ============================================================

-- Kac urunde gorsel var?
-- SELECT COUNT(*) FROM items WHERE image_url IS NOT NULL AND image_url != '';

-- En cok gorsel degistirilen urunler (version takibi):
-- SELECT name, image_version, updated_at FROM items WHERE image_version > 1 ORDER BY image_version DESC;

-- Silinen dosya gecmisi:
-- SELECT * FROM cleanup_log ORDER BY deleted_at DESC LIMIT 20;
