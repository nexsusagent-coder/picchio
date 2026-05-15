-- Picchio Cocktail Bar - Dinamik Tasarım ve Marka Yönetimi Migrasyonu
-- Bu scripti Supabase SQL Editor içerisinde çalıştırın.

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#4E0000',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS accent_gold TEXT DEFAULT '#D4AF37',
ADD COLUMN IF NOT EXISTS bg_gradient_start TEXT DEFAULT '#4E0000',
ADD COLUMN IF NOT EXISTS bg_gradient_end TEXT DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS button_color TEXT DEFAULT '#4a0e0e',
ADD COLUMN IF NOT EXISTS border_radius INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS glass_blur INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS noise_opacity DECIMAL DEFAULT 0.05,
ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS footer_text TEXT DEFAULT '© 2026 Picchio Cocktail Bar';

-- Mevcut ayar satırını (ID=1) varsayılan değerlerle güncelle
UPDATE site_settings 
SET 
  primary_color = COALESCE(primary_color, '#4E0000'),
  secondary_color = COALESCE(secondary_color, '#000000'),
  accent_gold = COALESCE(accent_gold, '#D4AF37'),
  bg_gradient_start = COALESCE(bg_gradient_start, '#4E0000'),
  bg_gradient_end = COALESCE(bg_gradient_end, '#000000'),
  button_color = COALESCE(button_color, '#4a0e0e'),
  border_radius = COALESCE(border_radius, 12),
  glass_blur = COALESCE(glass_blur, 12),
  noise_opacity = COALESCE(noise_opacity, 0.05),
  font_family = COALESCE(font_family, 'Inter'),
  footer_text = COALESCE(footer_text, '© 2026 Picchio Cocktail Bar')
WHERE id = 1;
